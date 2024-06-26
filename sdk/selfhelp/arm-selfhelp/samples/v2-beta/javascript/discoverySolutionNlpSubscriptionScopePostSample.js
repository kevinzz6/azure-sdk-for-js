/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const { HelpRP } = require("@azure/arm-selfhelp");
const { DefaultAzureCredential } = require("@azure/identity");
require("dotenv").config();

/**
 * This sample demonstrates how to Search for relevant Azure Diagnostics, Solutions and Troubleshooters using a natural language issue summary and subscription.
 *
 * @summary Search for relevant Azure Diagnostics, Solutions and Troubleshooters using a natural language issue summary and subscription.
 * x-ms-original-file: specification/help/resource-manager/Microsoft.Help/preview/2024-03-01-preview/examples/DiscoverSolutionsAtSubscriptionScope.json
 */
async function discoverySolutionsUsingIssueSummaryAndServiceId() {
  const subscriptionId = "0d0fcd2e-c4fd-4349-8497-200edb3923c6";
  const discoverSolutionRequest = {
    issueSummary: "how to retrieve certs from deleted keyvault.",
    resourceId:
      "subscriptions/0d0fcd2e-c4fd-4349-8497-200edb3923c6/resourceGroups/myresourceGroup/providers/Microsoft.KeyVault/vaults/test-keyvault-non-read",
    serviceId: "0d0fcd2e-c4fd-4349-8497-200edb39s3ca",
  };
  const options = {
    discoverSolutionRequest,
  };
  const credential = new DefaultAzureCredential();
  const client = new HelpRP(credential);
  const result = await client.discoverySolutionNLPSubscriptionScope.post(subscriptionId, options);
  console.log(result);
}

async function main() {
  discoverySolutionsUsingIssueSummaryAndServiceId();
}

main().catch(console.error);
