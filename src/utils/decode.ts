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
 * Function to decode the sale amount from the transaction receipt.
 * This function inspects the transaction logs to find the OrdersMatched event
 * and extracts the sale amount involved in that event.
 * @param receipt - The transaction receipt containing logs to check for the OrdersMatched event.
 * @param transactionHash - The hash of the transaction being processed, used for logging.
 * @returns The sale amount as a BigInt, or null if not found.
 */
/**
 * Function to decode the sale amount from the transaction receipt.
 * Inspects the transaction logs to find the OrdersMatched event
 * and extracts the sale amount involved.
 *
 * @param receipt - The transaction receipt containing logs to check for the OrdersMatched event.
 * @param transactionHash - The hash of the transaction being processed, used for logging.
 * @returns The sale amount as a BigInt, or null if not found.
 */
export function decodeSaleAmount(
  receipt: ethereum.TransactionReceipt | null,
  transactionHash: Bytes
): BigInt | null {
  // Ensure the receipt is provided, else log and return null
  if (!receipt) {
    log.debug("[decodeSaleAmount][{}] No receipt found", [
      transactionHash.toHexString(),
    ]);
    return null;
  }

  // Get logs from the receipt and ensure they exist
  let logs = receipt.logs;
  if (!logs || logs.length === 0) {
    log.debug("[decodeSaleAmount][{}] No logs found", [
      transactionHash.toHexString(),
    ]);
    return null;
  }

  // Define the OrdersMatched event signature using Keccak-256 hash
  let topicSignature = crypto.keccak256(
    ByteArray.fromUTF8(
      "OrdersMatched(bytes32,bytes32,address,address,uint256,bytes32)"
    )
  );

  // Iterate through the logs to find the matching OrdersMatched event
  for (let i = 0; i < logs.length; i++) {
    let currentLog = logs[i];

    // Check if the log's first topic matches the OrdersMatched event signature
    if (
      currentLog.topics.length > 0 &&
      currentLog.topics[0].equals(topicSignature)
    ) {
      // Verify that the log has enough topics to extract the sale amount
      if (currentLog.topics.length >= 5) {
        let saleAmount = ethereum.decode("uint256", currentLog.data); // Decode sale amount

        // If the sale amount is successfully decoded, log and return it
        if (saleAmount) {
          log.info("[decodeSaleAmount][{}] Sale Amount: {}", [
            transactionHash.toHexString(),
            saleAmount.toString(),
          ]);
          return saleAmount.toBigInt();
        } else {
          log.warning("[decodeSaleAmount][{}] Failed to decode sale amount", [
            transactionHash.toHexString(),
          ]);
        }
      } else {
        log.warning(
          "[decodeSaleAmount][{}] Not enough topics to decode sale amount",
          [transactionHash.toHexString()]
        );
      }
    }
  }

  // Log a warning if no OrdersMatched event was found and return null
  log.warning("[decodeSaleAmount][{}] No matching OrdersMatched event found", [
    transactionHash.toHexString(),
  ]);
  return null;
}

/**
 * Function to decode the buyer and seller addresses from the transaction receipt.
 * This function inspects the transaction logs to find the OrdersMatched event
 * and extracts the buyer and seller addresses involved in that event.
 *
 * @param receipt - The transaction receipt containing logs to check for the OrdersMatched event.
 * @param transactionHash - The hash of the transaction being processed, used for logging.
 * @returns An object containing the buyer and seller addresses as Bytes, or null if not found.
 */
export function decodeBuyerAndSeller(
  receipt: ethereum.TransactionReceipt | null,
  transactionHash: Bytes
): { buyer: Bytes | null; seller: Bytes | null } {
  // Ensure receipt is provided; else log a warning and return null values
  if (!receipt) {
    log.warning("[decodeBuyerAndSeller][{}] No receipt found", [
      transactionHash.toHexString(),
    ]);
    return { buyer: null, seller: null };
  }

  // Get the logs from the receipt and ensure they exist
  let logs = receipt.logs;
  if (!logs || logs.length === 0) {
    log.warning("[decodeBuyerAndSeller][{}] No logs found", [
      transactionHash.toHexString(),
    ]);
    return { buyer: null, seller: null };
  }

  // Define the OrdersMatched event signature for comparison
  // Define the OrdersMatched event signature using Keccak-256 hash
  let topicSignature = crypto.keccak256(
    ByteArray.fromUTF8(
      "OrdersMatched(bytes32,bytes32,address,address,uint256,bytes32)"
    )
  );

  // Iterate through the logs to find the matching OrdersMatched event
  for (let i = 0; i < logs.length; i++) {
    let currentLog = logs[i];

    // Check if the log matches the OrdersMatched event signature
    if (
      currentLog.topics.length > 0 &&
      currentLog.topics[0].equals(topicSignature)
    ) {
      let decodedData = currentLog.data;

      // Ensure the data is long enough to contain both buyer and seller addresses (96 bytes)
      if (decodedData.length >= 96) {
        // Extract the seller and buyer addresses from the data
        let seller = Bytes.fromByteArray(decodedData.subarray(32, 64)); // Seller address
        let buyer = Bytes.fromByteArray(decodedData.subarray(64, 96)); // Buyer address

        log.info("[decodeBuyerAndSeller][{}] Buyer: {}, Seller: {}", [
          transactionHash.toHexString(),
          buyer.toHexString(),
          seller.toHexString(),
        ]);

        // Return the decoded buyer and seller addresses
        return { buyer, seller };
      } else {
        log.warning(
          "[decodeBuyerAndSeller][{}] Insufficient data to decode buyer and seller",
          [transactionHash.toHexString()]
        );
      }
    }
  }

  // If no OrdersMatched event was found or data was insufficient, return null values
  log.warning(
    "[decodeBuyerAndSeller][{}] No matching OrdersMatched event found",
    [transactionHash.toHexString()]
  );
  return { buyer: null, seller: null };
}

let receipt = event.receipt;
