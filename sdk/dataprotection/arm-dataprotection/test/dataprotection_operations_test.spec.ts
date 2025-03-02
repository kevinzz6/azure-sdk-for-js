/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import type { RecorderStartOptions } from "@azure-tools/test-recorder";
import { env, Recorder, isPlaybackMode } from "@azure-tools/test-recorder";
import { createTestCredential } from "@azure-tools/test-credential";
import { DataProtectionClient } from "../src/dataProtectionClient.js";
import { describe, it, assert, beforeEach, afterEach } from "vitest";

const replaceableVariables: Record<string, string> = {
  SUBSCRIPTION_ID: "88888888-8888-8888-8888-888888888888",
};

const recorderOptions: RecorderStartOptions = {
  envSetupForPlayback: replaceableVariables,
  removeCentralSanitizers: [
    "AZSDK3493", // .name in the body is not a secret and is listed below in the beforeEach section
    "AZSDK3430", // .id in the body is not a secret and is listed below in the beforeEach section
  ],
};

export const testPollingOptions = {
  updateIntervalInMs: isPlaybackMode() ? 0 : undefined,
};

describe("DataProtection test", () => {
  let recorder: Recorder;
  let subscriptionId: string;
  let client: DataProtectionClient;
  let location: string;
  let resourceGroup: string;
  let vaultName: string;

  beforeEach(async (ctx) => {
    recorder = new Recorder(ctx);
    await recorder.start(recorderOptions);
    subscriptionId = env.SUBSCRIPTION_ID || "";
    // This is an example of how the environment variables are used
    const credential = createTestCredential();
    client = new DataProtectionClient(
      credential,
      subscriptionId,
      recorder.configureClientOptions({}),
    );
    location = "eastus";
    resourceGroup = "myjstest";
    vaultName = "swaggerExample";
  });

  afterEach(async () => {
    await recorder.stop();
  });
  // no operation list api for dataprotection
  it("backupVaults create test", async () => {
    const res = await client.backupVaults.beginCreateOrUpdateAndWait(
      resourceGroup,
      vaultName,
      {
        // identity: { type: "None" },
        location,
        properties: {
          monitoringSettings: {
            azureMonitorAlertSettings: { alertsForAllJobFailures: "Enabled" },
          },
          storageSettings: [{ type: "LocallyRedundant", datastoreType: "VaultStore" }],
        },
        tags: { key1: "val1" },
      },
      testPollingOptions,
    );
    assert.equal(res.name, vaultName);
  });

  it("backupVaults get test", async () => {
    const res = await client.backupVaults.get(resourceGroup, vaultName);
    assert.equal(res.name, vaultName);
  });

  it("backupVaults list test", async () => {
    const resArray = new Array();
    for await (const item of client.backupVaults.listInResourceGroup(resourceGroup)) {
      resArray.push(item);
    }
    assert.equal(resArray.length, 1);
  });

  it("backupVaults delete test", async () => {
    const resArray = new Array();
    await client.backupVaults.beginDeleteAndWait(resourceGroup, vaultName, testPollingOptions);
    for await (const item of client.backupVaults.listInResourceGroup(resourceGroup)) {
      resArray.push(item);
    }
    assert.equal(resArray.length, 0);
  });
});
