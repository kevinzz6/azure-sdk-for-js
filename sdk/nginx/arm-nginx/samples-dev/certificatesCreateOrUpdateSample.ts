/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */
import type { NginxCertificate, CertificatesCreateOrUpdateOptionalParams } from "@azure/arm-nginx";
import { NginxManagementClient } from "@azure/arm-nginx";
import { DefaultAzureCredential } from "@azure/identity";
import "dotenv/config";

/**
 * This sample demonstrates how to Create or update the NGINX certificates for given NGINX deployment
 *
 * @summary Create or update the NGINX certificates for given NGINX deployment
 * x-ms-original-file: specification/nginx/resource-manager/NGINX.NGINXPLUS/preview/2024-01-01-preview/examples/Certificates_CreateOrUpdate.json
 */
async function certificatesCreateOrUpdate(): Promise<void> {
  const subscriptionId =
    process.env["NGINX_SUBSCRIPTION_ID"] || "00000000-0000-0000-0000-000000000000";
  const resourceGroupName = process.env["NGINX_RESOURCE_GROUP"] || "myResourceGroup";
  const deploymentName = "myDeployment";
  const certificateName = "default";
  const body: NginxCertificate = {
    properties: {
      certificateVirtualPath: "/src/cert/somePath.cert",
      keyVaultSecretId: "https://someKV.vault.azure.com/someSecretID",
      keyVirtualPath: "/src/cert/somekey.key",
    },
  };
  const options: CertificatesCreateOrUpdateOptionalParams = { body };
  const credential = new DefaultAzureCredential();
  const client = new NginxManagementClient(credential, subscriptionId);
  const result = await client.certificates.beginCreateOrUpdateAndWait(
    resourceGroupName,
    deploymentName,
    certificateName,
    options,
  );
  console.log(result);
}

async function main(): Promise<void> {
  await certificatesCreateOrUpdate();
}

main().catch(console.error);
