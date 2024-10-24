import { Bytes, ethereum, log, BigInt } from "@graphprotocol/graph-ts";
import { AUCTION_CANCEL_SIG, AUCTION_SUCCESS_SIG } from "./consts";
import { TransactionType } from "./entities";

// Extracts the sale amount from an AuctionSuccessful event that occurs before the Transfer event
export function getAuctionSaleAmount(event: ethereum.Event): BigInt | null {
  // Ensure the event has a receipt with logs to analyze
  if (!event.receipt) {
    return null; // No logs available, return null
  }

  const currentLogIndex = event.logIndex; // Get the index of the current Transfer event
  const logs = event.receipt!.logs; // Access all logs in the receipt

  // Loop through logs preceding the current event to find AuctionSuccessful
  for (let i = 0; i < logs.length; i++) {
    const currentLog = logs[i]; // Current log in the iteration

    // Stop if the log index exceeds the current event's index
    if (BigInt.fromI32(i) >= currentLogIndex) {
      break; // No need to check further logs
    }

    // Identify AuctionSuccessful events by checking their signature
    if (
      currentLog.topics.length > 0 &&
      currentLog.topics[0] == AUCTION_SUCCESS_SIG
    ) {
      // Decode the sale amount, which is the second parameter in the log data
      const saleAmount = ethereum
        .decode(
          "uint256", // Decode the data as a uint256
          Bytes.fromUint8Array(currentLog.data.subarray(32, 64)) // Extract second parameter
        )!
        .toBigInt(); // Convert the decoded value to BigInt for further use

      // Return the sale amount if decoding is successful, otherwise log a warning
      if (saleAmount) {
        return saleAmount;
      } else {
        log.warning(
          "[getAuctionSaleAmount] Failed to decode sale amount in tx {}",
          [event.transaction.hash.toHexString()]
        );
        return null;
      }
    }
  }

  // Return null if no matching AuctionSuccessful event is found before the Transfer event
  return null;
}

// Determines the transaction type based on logs in the transaction receipt
export function determineTransactionType(
  event: ethereum.Event
): TransactionType {
  // Ensure the event has a receipt with logs to analyze
  if (!event.receipt) {
    return TransactionType.Failed; // No receipt, consider the transaction failed
  }

  const logs = event.receipt!.logs; // Access all logs in the receipt

  // Loop through all logs to determine the transaction type
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i]; // Current log in the iteration

    // Identify AuctionSuccessful events
    if (log.topics.length > 0 && log.topics[0] == AUCTION_SUCCESS_SIG) {
      return TransactionType.Sale; // It's a sale transaction
    }

    // Identify AuctionCancelled events
    if (log.topics.length > 0 && log.topics[0] == AUCTION_CANCEL_SIG) {
      return TransactionType.Failed; // Transaction failed due to auction cancellation
    }
  }

  // Default to Unknown if no matching events are found
  return TransactionType.Unknown;
}
