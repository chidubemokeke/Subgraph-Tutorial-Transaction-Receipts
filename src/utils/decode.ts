import { Bytes, ethereum, log, BigInt } from "@graphprotocol/graph-ts";
import { AUCTION_CANCEL_SIG, AUCTION_SUCCESS_SIG } from "./consts";
import { TransactionType } from "./entities";

export function getAuctionSaleAmount(event: ethereum.Event): BigInt | null {
  // Check if the event has a transaction receipt. The receipt contains all logs from the transaction.
  if (!event.receipt) {
    return null; // If there's no receipt, we can't proceed with log analysis.
  }

  const currentLogIndex = event.logIndex; // Log index of the current event being processed (Transfer event).
  const logs = event.receipt!.logs; // Access all logs from the transaction receipt.

  // Loop through logs to find any AuctionSuccessful events that occur before the Transfer event.
  for (let i = 0; i < logs.length; i++) {
    const currentLog = logs[i]; // Current log in the loop.

    // Ensure that the log's index (from the logs array) is less than the current Transfer event's log index
    // Convert i to BigInt for comparison with currentLogIndex
    if (BigInt.fromI32(i) >= currentLogIndex) {
      // Stop searching since we have passed the logs that occurred before the Transfer event.
      break;
    }

    // Check if the log corresponds to the AuctionSuccessful event by comparing its signature (topic0) and the contract address.
    if (
      currentLog.topics.length > 0 &&
      currentLog.topics[0] == AUCTION_SUCCESS_SIG
    ) {
      // The `AuctionSuccessful` event data contains several fields. We are interested in the `totalPrice`,
      // which is the second parameter (a `uint256`), located in the data section of the log.
      // Extract and decode the `AuctionPrice` from the log's data.
      // The `AuctionPrice` is located from bytes 32 to 64 in the log's data (the second parameter in the AuctionSuccessful event structure).
      const saleAmount = ethereum
        .decode(
          "uint256",
          Bytes.fromUint8Array(currentLog.data.subarray(32, 64)) // Corresponds to the second parameter
        )!
        .toBigInt();

      if (saleAmount) {
        return saleAmount; // Return the sale amount if decoding succeeds
      } else {
        // If decoding fails, log a warning with the transaction hash.
        log.warning(
          "[getAuctionSaleAmount] Failed to decode sale amount in transaction {}",
          [event.transaction.hash.toHexString()]
        );
        return null; // Return null if decoding fails
      }
    }
  }

  // If no matching AuctionSuccessful event was found before the Transfer event, return null
  return null;
}

export function determineTransactionType(
  event: ethereum.Event
): TransactionType {
  // Check if the event has a transaction receipt. The receipt contains all logs from the transaction.
  if (!event.receipt) {
    return TransactionType.Failed; // If there's no receipt, mark the transaction as failed.
  }

  const logs = event.receipt!.logs; // Access all logs from the transaction receipt.

  // Loop through all logs in the transaction receipt.
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i]; // Current log in the loop.

    // Check if the log corresponds to the AuctionSuccessful event.
    if (log.topics.length > 0 && log.topics[0] == AUCTION_SUCCESS_SIG) {
      return TransactionType.Sale; // Return It's a sale transaction.
    }

    // Check if the log matches the AuctionCancelled signature.
    if (log.topics.length > 0 && log.topics[0] == AUCTION_CANCEL_SIG) {
      return TransactionType.Failed; // Auction was cancelled, so mark as failed.
    }
  }

  // Default to unknown if none of the conditions match.
  return TransactionType.Unknown;
}
