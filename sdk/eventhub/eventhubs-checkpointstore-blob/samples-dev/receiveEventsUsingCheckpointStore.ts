// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * @summary Demonstrates how to use the EventHubConsumerClient to process events from all partitions
 * of a consumer group in an Event Hubs instance, as well as checkpointing along the way.
 *
 * Checkpointing using a durable store allows your application to be more resilient. When you restart
 * your application after a crash (or an intentional stop), your application can continue consuming
 * events from where it last checkpointed.
 */

import { DefaultAzureCredential } from "@azure/identity";
import { EventHubConsumerClient } from "@azure/event-hubs";
import { BlobCheckpointStore } from "@azure/eventhubs-checkpointstore-blob";
import { BlobServiceClient } from "@azure/storage-blob";
import "dotenv/config";

const fullyQualifiedNamespace = process.env["EVENTHUB_FQDN"] || "<fully qualified namespace>";
const eventHubName = process.env["EVENTHUB_NAME"] || "<eventHubName>";
const consumerGroup =
  process.env["EVENTHUB_CONSUMER_GROUP_NAME"] || EventHubConsumerClient.defaultConsumerGroupName;
const storageEndpoint =
  process.env["STORAGE_ENDPOINT"] || "https://<storageaccount>.blob.core.windows.net";

export async function main(): Promise<void> {
  const credential = new DefaultAzureCredential();
  // This client will be used by our eventhubs-checkpointstore-blob, which
  // persists any checkpoints from this session in Azure Storage
  const storageClient = new BlobServiceClient(storageEndpoint, credential);
  const containerClient = storageClient.getContainerClient("checkpointstore");

  if (!(await containerClient.exists())) {
    await containerClient.create();
  }

  const checkpointStore = new BlobCheckpointStore(containerClient);

  const consumerClient = new EventHubConsumerClient(
    consumerGroup,
    fullyQualifiedNamespace,
    eventHubName,
    credential,
    checkpointStore,
  );

  // The below code will set up your program to listen to events from your Event Hub instance.
  // If your Event Hub instance doesn't have any events, then please run "sendEvents.ts" from the event-hubs project
  // located here: https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/eventhub/event-hubs/samples/sendEvents.ts

  const subscription = consumerClient.subscribe({
    processEvents: async (events, context) => {
      if (events.length === 0) {
        // If the wait time expires (configured via options in maxWaitTimeInSeconds) Event Hubs
        // will pass you an empty array.
        return;
      }

      for (const event of events) {
        console.log(
          `Received event: '${event.body}' from partition: '${context.partitionId}' and consumer group: '${context.consumerGroup}'`,
        );
      }

      try {
        // save a checkpoint for the last event now that we've processed this batch.
        await context.updateCheckpoint(events[events.length - 1]);
      } catch (err: any) {
        console.log(`Error when checkpointing on partition ${context.partitionId}: `, err);
        throw err;
      }

      console.log(
        `Successfully checkpointed event with sequence number: ${
          events[events.length - 1].sequenceNumber
        } from partition: 'partitionContext.partitionId'`,
      );
    },
    processError: async (err, context) => {
      console.log(`Error on partition "${context.partitionId}": ${err}`);
    },
  });

  // after 30 seconds, stop processing
  await new Promise<void>((resolve) => {
    setTimeout(async () => {
      await subscription.close();
      await consumerClient.close();
      resolve();
    }, 30000);
  });
}

main().catch((err) => {
  console.log("Error occurred: ", err);
});
