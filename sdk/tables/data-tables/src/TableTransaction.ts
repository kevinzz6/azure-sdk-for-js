// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import type {
  DeleteTableEntityOptions,
  TableEntity,
  TableTransactionEntityResponse,
  TableTransactionResponse,
  TransactionAction,
  UpdateMode,
  UpdateTableEntityOptions,
} from "./models.js";
import type { NamedKeyCredential, SASCredential, TokenCredential } from "@azure/core-auth";
import type { OperationOptions, ServiceClient } from "@azure/core-client";
import { serializationPolicy, serializationPolicyName } from "@azure/core-client";
import type { Pipeline, PipelineRequest, PipelineResponse } from "@azure/core-rest-pipeline";
import { RestError, createHttpHeaders, createPipelineRequest } from "@azure/core-rest-pipeline";
import {
  getInitialTransactionBody,
  getTransactionHttpRequestBody,
} from "./utils/transactionHelpers.js";
import {
  transactionHeaderFilterPolicy,
  transactionHeaderFilterPolicyName,
  transactionRequestAssemblePolicy,
  transactionRequestAssemblePolicyName,
} from "./TablePolicies.js";

import type { TableClientLike } from "./utils/internalModels.js";
import type { TableServiceErrorOdataError } from "./generated/index.js";
import { cosmosPatchPolicy } from "./cosmosPathPolicy.js";
import { getTransactionHeaders } from "./utils/transactionHeaders.js";
import { isCosmosEndpoint } from "./utils/isCosmosEndpoint.js";
import { tracingClient } from "./utils/tracing.js";

/**
 * Helper to build a list of transaction actions
 */
export class TableTransaction {
  /**
   * List of actions to perform in a transaction
   */
  public actions: TransactionAction[];

  constructor(actions?: TransactionAction[]) {
    this.actions = actions ?? [];
  }

  /**
   * Adds a create action to the transaction
   * @param entity - entity to create
   */
  createEntity<T extends object = Record<string, unknown>>(entity: TableEntity<T>): void {
    this.actions.push(["create", entity]);
  }

  /**
   * Adds a delete action to the transaction
   * @param partitionKey - partition key of the entity to delete
   * @param rowKey - rowKey of the entity to delete
   */
  deleteEntity(partitionKey: string, rowKey: string): void {
    this.actions.push(["delete", { partitionKey, rowKey }]);
  }

  /**
   * Adds an update action to the transaction
   * @param entity - entity to update
   * @param updateOptions - options for the update operation
   */
  updateEntity<T extends object = Record<string, unknown>>(
    entity: TableEntity<T>,
    updateOptions?: UpdateTableEntityOptions,
  ): void;

  /**
   * Adds an update action to the transaction
   * @param entity - entity to update
   * @param updateMode - update mode
   * @param updateOptions - options for the update operation
   */
  updateEntity<T extends object = Record<string, unknown>>(
    entity: TableEntity<T>,
    updateMode: UpdateMode,
    updateOptions?: UpdateTableEntityOptions,
  ): void;

  /**
   * Adds an update action to the transaction
   * @param entity - entity to update
   * @param updateModeOrOptions - update mode or update options
   * @param updateOptions - options for the update operation
   */
  updateEntity<T extends object = Record<string, unknown>>(
    entity: TableEntity<T>,
    updateModeOrOptions: UpdateMode | UpdateTableEntityOptions | undefined,
    updateOptions?: UpdateTableEntityOptions,
  ): void {
    // UpdateMode is a string union
    const realUpdateMode: UpdateMode | undefined =
      typeof updateModeOrOptions === "string" ? updateModeOrOptions : undefined;
    const realUpdateOptions: UpdateTableEntityOptions | undefined =
      typeof updateModeOrOptions === "object" ? updateModeOrOptions : updateOptions;
    this.actions.push(["update", entity, realUpdateMode ?? "Merge", realUpdateOptions ?? {}]);
  }

  /**
   * Adds an upsert action to the transaction, which inserts if the entity doesn't exist or updates the existing one
   * @param entity - entity to upsert
   * @param updateMode - update mode
   */
  upsertEntity<T extends object = Record<string, unknown>>(
    entity: TableEntity<T>,
    updateMode: UpdateMode = "Merge",
  ): void {
    this.actions.push(["upsert", entity, updateMode]);
  }
}

/**
 * TableTransaction collects sub-operations that can be submitted together via submitTransaction
 */
export class InternalTableTransaction {
  /**
   * Table Account URL
   */
  public url: string;
  /**
   * State that holds the information about a particular transation
   */
  private state: {
    transactionId: string;
    changesetId: string;
    pendingOperations: Promise<any>[];
    bodyParts: string[];
    partitionKey: string;
  };
  private interceptClient: TableClientLike;
  private allowInsecureConnection: boolean;
  private client: ServiceClient;

  /**
   * @param url - Tables account url
   * @param partitionKey - partition key
   * @param credential - credential to authenticate the transaction request
   */
  constructor(
    url: string,
    partitionKey: string,
    transactionId: string,
    changesetId: string,
    // eslint-disable-next-line @azure/azure-sdk/ts-use-interface-parameters
    client: ServiceClient,
    interceptClient: TableClientLike,
    credential?: NamedKeyCredential | SASCredential | TokenCredential,
    allowInsecureConnection: boolean = false,
  ) {
    this.client = client;
    this.url = url;
    this.interceptClient = interceptClient;
    this.allowInsecureConnection = allowInsecureConnection;

    // Initialize the state
    this.state = this.initializeState(transactionId, changesetId, partitionKey);

    // Depending on the auth method used we need to build the url
    if (!credential) {
      // When the SAS token is provided as part of the URL we need to move it after $batch
      const urlParts = url.split("?");
      this.url = urlParts[0];
      const sas = urlParts.length > 1 ? `?${urlParts[1]}` : "";
      this.url = `${this.getUrlWithSlash()}$batch${sas}`;
    } else {
      // When using a SharedKey credential no SAS token is needed
      this.url = `${this.getUrlWithSlash()}$batch`;
    }
  }

  private initializeState(
    transactionId: string,
    changesetId: string,
    partitionKey: string,
  ): {
    transactionId: string;
    changesetId: string;
    partitionKey: string;
    pendingOperations: Promise<any>[];
    bodyParts: string[];
  } {
    const pendingOperations: Promise<any>[] = [];
    const bodyParts = getInitialTransactionBody(transactionId, changesetId);
    const isCosmos = isCosmosEndpoint(this.url);
    prepateTransactionPipeline(this.interceptClient.pipeline, bodyParts, changesetId, isCosmos);

    return {
      transactionId,
      changesetId,
      partitionKey,
      pendingOperations,
      bodyParts,
    };
  }

  /**
   * Adds a createEntity operation to the transaction
   * @param entity - Entity to create
   */
  public createEntity<T extends object>(entity: TableEntity<T>): void {
    this.checkPartitionKey(entity.partitionKey);
    this.state.pendingOperations.push(this.interceptClient.createEntity(entity));
  }

  /**
   * Adds a createEntity operation to the transaction per each entity in the entities array
   * @param entities - Array of entities to create
   */
  public createEntities<T extends object>(entities: TableEntity<T>[]): void {
    for (const entity of entities) {
      this.checkPartitionKey(entity.partitionKey);
      this.state.pendingOperations.push(this.interceptClient.createEntity(entity));
    }
  }

  /**
   * Adds a deleteEntity operation to the transaction
   * @param partitionKey - Partition key of the entity to delete
   * @param rowKey - Row key of the entity to delete
   * @param options - Options for the delete operation
   */
  public deleteEntity(
    partitionKey: string,
    rowKey: string,
    options?: DeleteTableEntityOptions,
  ): void {
    this.checkPartitionKey(partitionKey);
    this.state.pendingOperations.push(
      this.interceptClient.deleteEntity(partitionKey, rowKey, options),
    );
  }

  /**
   * Adds an updateEntity operation to the transaction
   * @param entity - Entity to update
   * @param mode - Update mode (Merge or Replace)
   * @param options - Options for the update operation
   */
  public updateEntity<T extends object>(
    entity: TableEntity<T>,
    mode: UpdateMode,
    options?: UpdateTableEntityOptions,
  ): void {
    this.checkPartitionKey(entity.partitionKey);
    this.state.pendingOperations.push(this.interceptClient.updateEntity(entity, mode, options));
  }

  /**
   * Adds an upsertEntity operation to the transaction
   * @param entity - The properties for the table entity.
   * @param mode   - The different modes for updating the entity:
   *               - Merge: Updates an entity by updating the entity's properties without replacing the existing entity.
   *               - Replace: Updates an existing entity by replacing the entire entity.
   * @param options - The options parameters.
   */
  public upsertEntity<T extends object>(
    entity: TableEntity<T>,
    mode: UpdateMode,
    options?: OperationOptions,
  ): void {
    this.checkPartitionKey(entity.partitionKey);
    this.state.pendingOperations.push(this.interceptClient.upsertEntity(entity, mode, options));
  }

  /**
   * Submits the operations in the transaction
   * @param options - Options for the request.
   */
  public async submitTransaction(
    options: OperationOptions = {},
  ): Promise<TableTransactionResponse> {
    await Promise.all(this.state.pendingOperations);
    const body = getTransactionHttpRequestBody(
      this.state.bodyParts,
      this.state.transactionId,
      this.state.changesetId,
    );

    const headers = getTransactionHeaders(this.state.transactionId);

    return tracingClient.withSpan(
      "TableTransaction.submitTransaction",
      options,
      async (updatedOptions) => {
        const request = createPipelineRequest({
          ...updatedOptions,
          url: this.url,
          method: "POST",
          body,
          headers: createHttpHeaders(headers),
          allowInsecureConnection: this.allowInsecureConnection,
        });

        const rawTransactionResponse = await this.client.sendRequest(request);
        return parseTransactionResponse(rawTransactionResponse);
      },
    );
  }

  private checkPartitionKey(partitionKey: string): void {
    if (this.state.partitionKey !== partitionKey) {
      throw new Error("All operations in a transaction must target the same partitionKey");
    }
  }

  private getUrlWithSlash(): string {
    return this.url.endsWith("/") ? this.url : `${this.url}/`;
  }
}

export function parseTransactionResponse(
  transactionResponse: PipelineResponse,
): TableTransactionResponse {
  const subResponsePrefix = `--changesetresponse_`;
  const status = transactionResponse.status;
  const rawBody = transactionResponse.bodyAsText || "";
  const splitBody = rawBody.split(subResponsePrefix);
  const isSuccessByStatus = 200 <= status && status < 300;

  if (!isSuccessByStatus) {
    handleBodyError(rawBody, status, transactionResponse.request, transactionResponse);
  }

  // Dropping the first and last elements as they are the boundaries
  // we just care about sub request content
  const subResponses = splitBody.slice(1, splitBody.length - 1);

  const responses: TableTransactionEntityResponse[] = subResponses.map((subResponse) => {
    const statusMatch = subResponse.match(/HTTP\/1.1 ([0-9]*)/);
    if (statusMatch?.length !== 2) {
      throw new Error(`Couldn't extract status from sub-response:\n ${subResponse}`);
    }
    const subResponseStatus = Number.parseInt(statusMatch[1]);
    if (!Number.isInteger(subResponseStatus)) {
      throw new Error(`Expected sub-response status to be an integer ${subResponseStatus}`);
    }

    const bodyMatch = subResponse.match(/\{(.*)\}/);
    if (bodyMatch?.length === 2) {
      handleBodyError(
        bodyMatch[0],
        subResponseStatus,
        transactionResponse.request,
        transactionResponse,
      );
    }

    const etagMatch = subResponse.match(/ETag: (.*)/);
    const rowKeyMatch = subResponse.match(/RowKey='(.*)'/);

    return {
      status: subResponseStatus,
      ...(rowKeyMatch?.length === 2 && { rowKey: rowKeyMatch[1] }),
      ...(etagMatch?.length === 2 && { etag: etagMatch[1] }),
    };
  });

  return {
    status,
    subResponses: responses,
    getResponseForEntity: (rowKey: string) => responses.find((r) => r.rowKey === rowKey),
  };
}

function handleBodyError(
  bodyAsText: string,
  statusCode: number,
  request: PipelineRequest,
  response: PipelineResponse,
): void {
  let parsedError;

  try {
    parsedError = JSON.parse(bodyAsText);
  } catch {
    parsedError = {};
  }

  let message = "Transaction Failed";
  let code: string | undefined;
  // Only transaction sub-responses return body
  if (parsedError && parsedError["odata.error"]) {
    const error: TableServiceErrorOdataError = parsedError["odata.error"];
    message = error.message?.value ?? message;
    code = error.code;
  }

  throw new RestError(message, {
    code,
    statusCode,
    request,
    response,
  });
}

/**
 * Prepares the transaction pipeline to intercept operations
 * @param pipeline - Client pipeline
 */
export function prepateTransactionPipeline(
  pipeline: Pipeline,
  bodyParts: string[],
  changesetId: string,
  isCosmos: boolean,
): void {
  // Fist, we need to clear all the existing policies to make sure we start
  // with a fresh state.
  const policies = pipeline.getOrderedPolicies();
  for (const policy of policies) {
    pipeline.removePolicy({
      name: policy.name,
    });
  }

  // With the clear state we now initialize the pipelines required for intercepting the requests.
  // Use transaction assemble policy to assemble request and intercept request from going to wire

  pipeline.addPolicy(serializationPolicy(), { phase: "Serialize" });
  pipeline.addPolicy(transactionHeaderFilterPolicy());
  pipeline.addPolicy(transactionRequestAssemblePolicy(bodyParts, changesetId));
  if (isCosmos) {
    pipeline.addPolicy(cosmosPatchPolicy(), {
      afterPolicies: [transactionHeaderFilterPolicyName],
      beforePolicies: [serializationPolicyName, transactionRequestAssemblePolicyName],
    });
  }
}
