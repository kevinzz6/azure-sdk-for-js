/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import { PagedAsyncIterableIterator, PageSettings } from "@azure/core-paging";
import { setContinuationToken } from "../pagingHelper.js";
import { GitHubConnectorOperations } from "../operationsInterfaces/index.js";
import * as coreClient from "@azure/core-client";
import * as Mappers from "../models/mappers.js";
import * as Parameters from "../models/parameters.js";
import { MicrosoftSecurityDevOps } from "../microsoftSecurityDevOps.js";
import { PollerLike, PollOperationState, LroEngine } from "@azure/core-lro";
import { LroImpl } from "../lroImpl.js";
import {
  GitHubConnector,
  GitHubConnectorListByResourceGroupNextOptionalParams,
  GitHubConnectorListByResourceGroupOptionalParams,
  GitHubConnectorListByResourceGroupResponse,
  GitHubConnectorListBySubscriptionNextOptionalParams,
  GitHubConnectorListBySubscriptionOptionalParams,
  GitHubConnectorListBySubscriptionResponse,
  GitHubConnectorGetOptionalParams,
  GitHubConnectorGetResponse,
  GitHubConnectorCreateOrUpdateOptionalParams,
  GitHubConnectorCreateOrUpdateResponse,
  GitHubConnectorUpdateOptionalParams,
  GitHubConnectorUpdateResponse,
  GitHubConnectorDeleteOptionalParams,
  GitHubConnectorListByResourceGroupNextResponse,
  GitHubConnectorListBySubscriptionNextResponse
} from "../models/index.js";

/// <reference lib="esnext.asynciterable" />
/** Class containing GitHubConnectorOperations operations. */
export class GitHubConnectorOperationsImpl
  implements GitHubConnectorOperations {
  private readonly client: MicrosoftSecurityDevOps;

  /**
   * Initialize a new instance of the class GitHubConnectorOperations class.
   * @param client Reference to the service client
   */
  constructor(client: MicrosoftSecurityDevOps) {
    this.client = client;
  }

  /**
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param options The options parameters.
   */
  public listByResourceGroup(
    resourceGroupName: string,
    options?: GitHubConnectorListByResourceGroupOptionalParams
  ): PagedAsyncIterableIterator<GitHubConnector> {
    const iter = this.listByResourceGroupPagingAll(resourceGroupName, options);
    return {
      next() {
        return iter.next();
      },
      [Symbol.asyncIterator]() {
        return this;
      },
      byPage: (settings?: PageSettings) => {
        if (settings?.maxPageSize) {
          throw new Error("maxPageSize is not supported by this operation.");
        }
        return this.listByResourceGroupPagingPage(
          resourceGroupName,
          options,
          settings
        );
      }
    };
  }

  private async *listByResourceGroupPagingPage(
    resourceGroupName: string,
    options?: GitHubConnectorListByResourceGroupOptionalParams,
    settings?: PageSettings
  ): AsyncIterableIterator<GitHubConnector[]> {
    let result: GitHubConnectorListByResourceGroupResponse;
    let continuationToken = settings?.continuationToken;
    if (!continuationToken) {
      result = await this._listByResourceGroup(resourceGroupName, options);
      let page = result.value || [];
      continuationToken = result.nextLink;
      setContinuationToken(page, continuationToken);
      yield page;
    }
    while (continuationToken) {
      result = await this._listByResourceGroupNext(
        resourceGroupName,
        continuationToken,
        options
      );
      continuationToken = result.nextLink;
      let page = result.value || [];
      setContinuationToken(page, continuationToken);
      yield page;
    }
  }

  private async *listByResourceGroupPagingAll(
    resourceGroupName: string,
    options?: GitHubConnectorListByResourceGroupOptionalParams
  ): AsyncIterableIterator<GitHubConnector> {
    for await (const page of this.listByResourceGroupPagingPage(
      resourceGroupName,
      options
    )) {
      yield* page;
    }
  }

  /**
   * Returns a list of monitored GitHub Connectors.
   * @param options The options parameters.
   */
  public listBySubscription(
    options?: GitHubConnectorListBySubscriptionOptionalParams
  ): PagedAsyncIterableIterator<GitHubConnector> {
    const iter = this.listBySubscriptionPagingAll(options);
    return {
      next() {
        return iter.next();
      },
      [Symbol.asyncIterator]() {
        return this;
      },
      byPage: (settings?: PageSettings) => {
        if (settings?.maxPageSize) {
          throw new Error("maxPageSize is not supported by this operation.");
        }
        return this.listBySubscriptionPagingPage(options, settings);
      }
    };
  }

  private async *listBySubscriptionPagingPage(
    options?: GitHubConnectorListBySubscriptionOptionalParams,
    settings?: PageSettings
  ): AsyncIterableIterator<GitHubConnector[]> {
    let result: GitHubConnectorListBySubscriptionResponse;
    let continuationToken = settings?.continuationToken;
    if (!continuationToken) {
      result = await this._listBySubscription(options);
      let page = result.value || [];
      continuationToken = result.nextLink;
      setContinuationToken(page, continuationToken);
      yield page;
    }
    while (continuationToken) {
      result = await this._listBySubscriptionNext(continuationToken, options);
      continuationToken = result.nextLink;
      let page = result.value || [];
      setContinuationToken(page, continuationToken);
      yield page;
    }
  }

  private async *listBySubscriptionPagingAll(
    options?: GitHubConnectorListBySubscriptionOptionalParams
  ): AsyncIterableIterator<GitHubConnector> {
    for await (const page of this.listBySubscriptionPagingPage(options)) {
      yield* page;
    }
  }

  /**
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param options The options parameters.
   */
  private _listByResourceGroup(
    resourceGroupName: string,
    options?: GitHubConnectorListByResourceGroupOptionalParams
  ): Promise<GitHubConnectorListByResourceGroupResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, options },
      listByResourceGroupOperationSpec
    );
  }

  /**
   * Returns a monitored GitHub Connector resource for a given ID.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param gitHubConnectorName Name of the GitHub Connector.
   * @param options The options parameters.
   */
  get(
    resourceGroupName: string,
    gitHubConnectorName: string,
    options?: GitHubConnectorGetOptionalParams
  ): Promise<GitHubConnectorGetResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, gitHubConnectorName, options },
      getOperationSpec
    );
  }

  /**
   * Create or update a monitored GitHub Connector resource.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param gitHubConnectorName Name of the GitHub Connector.
   * @param gitHubConnector Connector resource payload.
   * @param options The options parameters.
   */
  async beginCreateOrUpdate(
    resourceGroupName: string,
    gitHubConnectorName: string,
    gitHubConnector: GitHubConnector,
    options?: GitHubConnectorCreateOrUpdateOptionalParams
  ): Promise<
    PollerLike<
      PollOperationState<GitHubConnectorCreateOrUpdateResponse>,
      GitHubConnectorCreateOrUpdateResponse
    >
  > {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec
    ): Promise<GitHubConnectorCreateOrUpdateResponse> => {
      return this.client.sendOperationRequest(args, spec);
    };
    const sendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec
    ) => {
      let currentRawResponse:
        | coreClient.FullOperationResponse
        | undefined = undefined;
      const providedCallback = args.options?.onResponse;
      const callback: coreClient.RawResponseCallback = (
        rawResponse: coreClient.FullOperationResponse,
        flatResponse: unknown
      ) => {
        currentRawResponse = rawResponse;
        providedCallback?.(rawResponse, flatResponse);
      };
      const updatedArgs = {
        ...args,
        options: {
          ...args.options,
          onResponse: callback
        }
      };
      const flatResponse = await directSendOperation(updatedArgs, spec);
      return {
        flatResponse,
        rawResponse: {
          statusCode: currentRawResponse!.status,
          body: currentRawResponse!.parsedBody,
          headers: currentRawResponse!.headers.toJSON()
        }
      };
    };

    const lro = new LroImpl(
      sendOperation,
      { resourceGroupName, gitHubConnectorName, gitHubConnector, options },
      createOrUpdateOperationSpec
    );
    const poller = new LroEngine(lro, {
      resumeFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs,
      lroResourceLocationConfig: "azure-async-operation"
    });
    await poller.poll();
    return poller;
  }

  /**
   * Create or update a monitored GitHub Connector resource.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param gitHubConnectorName Name of the GitHub Connector.
   * @param gitHubConnector Connector resource payload.
   * @param options The options parameters.
   */
  async beginCreateOrUpdateAndWait(
    resourceGroupName: string,
    gitHubConnectorName: string,
    gitHubConnector: GitHubConnector,
    options?: GitHubConnectorCreateOrUpdateOptionalParams
  ): Promise<GitHubConnectorCreateOrUpdateResponse> {
    const poller = await this.beginCreateOrUpdate(
      resourceGroupName,
      gitHubConnectorName,
      gitHubConnector,
      options
    );
    return poller.pollUntilDone();
  }

  /**
   * Update monitored GitHub Connector details.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param gitHubConnectorName Name of the GitHub Connector.
   * @param options The options parameters.
   */
  async beginUpdate(
    resourceGroupName: string,
    gitHubConnectorName: string,
    options?: GitHubConnectorUpdateOptionalParams
  ): Promise<
    PollerLike<
      PollOperationState<GitHubConnectorUpdateResponse>,
      GitHubConnectorUpdateResponse
    >
  > {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec
    ): Promise<GitHubConnectorUpdateResponse> => {
      return this.client.sendOperationRequest(args, spec);
    };
    const sendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec
    ) => {
      let currentRawResponse:
        | coreClient.FullOperationResponse
        | undefined = undefined;
      const providedCallback = args.options?.onResponse;
      const callback: coreClient.RawResponseCallback = (
        rawResponse: coreClient.FullOperationResponse,
        flatResponse: unknown
      ) => {
        currentRawResponse = rawResponse;
        providedCallback?.(rawResponse, flatResponse);
      };
      const updatedArgs = {
        ...args,
        options: {
          ...args.options,
          onResponse: callback
        }
      };
      const flatResponse = await directSendOperation(updatedArgs, spec);
      return {
        flatResponse,
        rawResponse: {
          statusCode: currentRawResponse!.status,
          body: currentRawResponse!.parsedBody,
          headers: currentRawResponse!.headers.toJSON()
        }
      };
    };

    const lro = new LroImpl(
      sendOperation,
      { resourceGroupName, gitHubConnectorName, options },
      updateOperationSpec
    );
    const poller = new LroEngine(lro, {
      resumeFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs
    });
    await poller.poll();
    return poller;
  }

  /**
   * Update monitored GitHub Connector details.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param gitHubConnectorName Name of the GitHub Connector.
   * @param options The options parameters.
   */
  async beginUpdateAndWait(
    resourceGroupName: string,
    gitHubConnectorName: string,
    options?: GitHubConnectorUpdateOptionalParams
  ): Promise<GitHubConnectorUpdateResponse> {
    const poller = await this.beginUpdate(
      resourceGroupName,
      gitHubConnectorName,
      options
    );
    return poller.pollUntilDone();
  }

  /**
   * Delete monitored GitHub Connector details.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param gitHubConnectorName Name of the GitHub Connector.
   * @param options The options parameters.
   */
  async beginDelete(
    resourceGroupName: string,
    gitHubConnectorName: string,
    options?: GitHubConnectorDeleteOptionalParams
  ): Promise<PollerLike<PollOperationState<void>, void>> {
    const directSendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec
    ): Promise<void> => {
      return this.client.sendOperationRequest(args, spec);
    };
    const sendOperation = async (
      args: coreClient.OperationArguments,
      spec: coreClient.OperationSpec
    ) => {
      let currentRawResponse:
        | coreClient.FullOperationResponse
        | undefined = undefined;
      const providedCallback = args.options?.onResponse;
      const callback: coreClient.RawResponseCallback = (
        rawResponse: coreClient.FullOperationResponse,
        flatResponse: unknown
      ) => {
        currentRawResponse = rawResponse;
        providedCallback?.(rawResponse, flatResponse);
      };
      const updatedArgs = {
        ...args,
        options: {
          ...args.options,
          onResponse: callback
        }
      };
      const flatResponse = await directSendOperation(updatedArgs, spec);
      return {
        flatResponse,
        rawResponse: {
          statusCode: currentRawResponse!.status,
          body: currentRawResponse!.parsedBody,
          headers: currentRawResponse!.headers.toJSON()
        }
      };
    };

    const lro = new LroImpl(
      sendOperation,
      { resourceGroupName, gitHubConnectorName, options },
      deleteOperationSpec
    );
    const poller = new LroEngine(lro, {
      resumeFrom: options?.resumeFrom,
      intervalInMs: options?.updateIntervalInMs
    });
    await poller.poll();
    return poller;
  }

  /**
   * Delete monitored GitHub Connector details.
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param gitHubConnectorName Name of the GitHub Connector.
   * @param options The options parameters.
   */
  async beginDeleteAndWait(
    resourceGroupName: string,
    gitHubConnectorName: string,
    options?: GitHubConnectorDeleteOptionalParams
  ): Promise<void> {
    const poller = await this.beginDelete(
      resourceGroupName,
      gitHubConnectorName,
      options
    );
    return poller.pollUntilDone();
  }

  /**
   * Returns a list of monitored GitHub Connectors.
   * @param options The options parameters.
   */
  private _listBySubscription(
    options?: GitHubConnectorListBySubscriptionOptionalParams
  ): Promise<GitHubConnectorListBySubscriptionResponse> {
    return this.client.sendOperationRequest(
      { options },
      listBySubscriptionOperationSpec
    );
  }

  /**
   * ListByResourceGroupNext
   * @param resourceGroupName The name of the resource group. The name is case insensitive.
   * @param nextLink The nextLink from the previous successful call to the ListByResourceGroup method.
   * @param options The options parameters.
   */
  private _listByResourceGroupNext(
    resourceGroupName: string,
    nextLink: string,
    options?: GitHubConnectorListByResourceGroupNextOptionalParams
  ): Promise<GitHubConnectorListByResourceGroupNextResponse> {
    return this.client.sendOperationRequest(
      { resourceGroupName, nextLink, options },
      listByResourceGroupNextOperationSpec
    );
  }

  /**
   * ListBySubscriptionNext
   * @param nextLink The nextLink from the previous successful call to the ListBySubscription method.
   * @param options The options parameters.
   */
  private _listBySubscriptionNext(
    nextLink: string,
    options?: GitHubConnectorListBySubscriptionNextOptionalParams
  ): Promise<GitHubConnectorListBySubscriptionNextResponse> {
    return this.client.sendOperationRequest(
      { nextLink, options },
      listBySubscriptionNextOperationSpec
    );
  }
}
// Operation Specifications
const serializer = coreClient.createSerializer(Mappers, /* isXml */ false);

const listByResourceGroupOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.SecurityDevOps/gitHubConnectors",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.GitHubConnectorListResponse
    },
    default: {
      bodyMapper: Mappers.ErrorResponse
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const getOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.SecurityDevOps/gitHubConnectors/{gitHubConnectorName}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.GitHubConnector
    },
    default: {
      bodyMapper: Mappers.ErrorResponse
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.gitHubConnectorName
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const createOrUpdateOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.SecurityDevOps/gitHubConnectors/{gitHubConnectorName}",
  httpMethod: "PUT",
  responses: {
    200: {
      bodyMapper: Mappers.GitHubConnector
    },
    201: {
      bodyMapper: Mappers.GitHubConnector
    },
    202: {
      bodyMapper: Mappers.GitHubConnector
    },
    204: {
      bodyMapper: Mappers.GitHubConnector
    },
    default: {
      bodyMapper: Mappers.ErrorResponse
    }
  },
  requestBody: Parameters.gitHubConnector,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.gitHubConnectorName
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const updateOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.SecurityDevOps/gitHubConnectors/{gitHubConnectorName}",
  httpMethod: "PATCH",
  responses: {
    200: {
      bodyMapper: Mappers.GitHubConnector
    },
    201: {
      bodyMapper: Mappers.GitHubConnector
    },
    202: {
      bodyMapper: Mappers.GitHubConnector
    },
    204: {
      bodyMapper: Mappers.GitHubConnector
    },
    default: {
      bodyMapper: Mappers.ErrorResponse
    }
  },
  requestBody: Parameters.gitHubConnector1,
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.gitHubConnectorName
  ],
  headerParameters: [Parameters.accept, Parameters.contentType],
  mediaType: "json",
  serializer
};
const deleteOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.SecurityDevOps/gitHubConnectors/{gitHubConnectorName}",
  httpMethod: "DELETE",
  responses: {
    200: {},
    201: {},
    202: {},
    204: {},
    default: {
      bodyMapper: Mappers.ErrorResponse
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.gitHubConnectorName
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const listBySubscriptionOperationSpec: coreClient.OperationSpec = {
  path:
    "/subscriptions/{subscriptionId}/providers/Microsoft.SecurityDevOps/gitHubConnectors",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.GitHubConnectorListResponse
    },
    default: {
      bodyMapper: Mappers.ErrorResponse
    }
  },
  queryParameters: [Parameters.apiVersion],
  urlParameters: [Parameters.$host, Parameters.subscriptionId],
  headerParameters: [Parameters.accept],
  serializer
};
const listByResourceGroupNextOperationSpec: coreClient.OperationSpec = {
  path: "{nextLink}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.GitHubConnectorListResponse
    },
    default: {
      bodyMapper: Mappers.ErrorResponse
    }
  },
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.resourceGroupName,
    Parameters.nextLink
  ],
  headerParameters: [Parameters.accept],
  serializer
};
const listBySubscriptionNextOperationSpec: coreClient.OperationSpec = {
  path: "{nextLink}",
  httpMethod: "GET",
  responses: {
    200: {
      bodyMapper: Mappers.GitHubConnectorListResponse
    },
    default: {
      bodyMapper: Mappers.ErrorResponse
    }
  },
  urlParameters: [
    Parameters.$host,
    Parameters.subscriptionId,
    Parameters.nextLink
  ],
  headerParameters: [Parameters.accept],
  serializer
};
