import {
  Bytes,
  ethereum,
  log,
  crypto,
  ByteArray,
  BigInt,
} from "@graphprotocol/graph-ts";
import { OPENSEA_SIGNATURE } from "./consts";

/**
 * Helper function to decode the transaction amount from the OrdersMatched event logs.
 *
 * @param logs - The list of logs from the transaction receipt.
 * @param currentEventLogIndex - The log index of the current event being processed.
 * @returns - The decoded transaction amount (price) as BigInt, or null if not found.
 */
export function decodeSaleAmount(
  logs: Array<ethereum.Log>,
  currentEventLogIndex: BigInt // Ensure this is BigInt for compatibility
): BigInt | null {
  let foundIndex: i32 = -1;

  // Loop through all logs to find the log that matches the current event log index.
  for (let i = 0; i < logs.length; i++) {
    const currLog = logs.at(i); // Get the log at index `i`.

    if (currLog.logIndex.equals(currentEventLogIndex)) {
      // Use BigInt for comparison
      foundIndex = i; // Store the index of the current log.
      break; // Stop searching as we've found the matching log.
    }
  }

  // Ensure a valid index is found and there are enough logs after the current log to check for OrdersMatched events.
  if (foundIndex >= 0 && foundIndex + 1 < logs.length) {
    // Loop through the next logs to find any OrdersMatched events
    for (let i = foundIndex + 1; i < logs.length; i++) {
      const nextLog = logs.at(foundIndex + 1); // Get the next log entry.

      // Calculate the event signature for the OrdersMatched event.
      const ordersMatchedSig = crypto.keccak256(
        ByteArray.fromUTF8(
          "OrdersMatched(bytes32,bytes32,address,address,uint256,bytes32)"
        )
      );

      // Check if the first topic of this log matches the OrdersMatched event signature.
      if (
        nextLog.topics.length > 0 &&
        nextLog.topics.at(0).equals(ordersMatchedSig)
      ) {
        // Decode the transaction amount (fifth parameter - price) from the event data.
        // The price parameter starts at byte 128 and ends at byte 160.
        const priceStart = 128; // Start of the price parameter
        const priceEnd = 160; // End of the price parameter

        // Slice the data to get the price parameter and decode it as a uint256.
        const transactionAmountDecoded = ethereum.decode(
          "uint256",
          Bytes.fromUint8Array(nextLog.data.subarray(priceStart, priceEnd))
        );

        // Check if the decoding was successful.
        if (transactionAmountDecoded) {
          // Return the decoded price as BigInt.
          return transactionAmountDecoded.toBigInt();
        } else {
          log.warning("Could not decode transaction amount from log", [
            nextLog.transactionHash.toHexString(),
          ]);
        }
      }
    }
  }

  // Return null if no transaction amount is found or if the event is not matched.
  return null;
}
