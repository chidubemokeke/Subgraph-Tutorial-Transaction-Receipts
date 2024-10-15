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
  event: ethereum.Event,
  transactionHash: Bytes,
  amount: BigInt
): BigInt {
  let kittyAddress: Address = Address.fromString(
    "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d"
  );

  let price = BigInt.fromI32(0);

  // Check if the receipt is available
  if (!receipt) {
    log.debug("[decodeSaleAmount][{}] No receipt found", [
      transactionHash.toHexString(),
    ]);
    return price; // Return default price (0) if receipt is null
  }

  // Get logs from the transaction receipt
  let logs = receipt.logs;

  // Ensure the logs are present
  if (logs.length > 0) {
    // Loop through the logs to find the OrdersMatched event
    for (let i = 0; i < logs.length; ++i) {
      let logEntry = logs[i];

      // Define the signature for the OrdersMatched event
      let openseaSignature = crypto.keccak256(
        ByteArray.fromUTF8(
          "OrdersMatched(bytes32,bytes32,address,address,uint256,bytes32)"
        )
      );

      // Check if the log matches the signature and contract address (CryptoKitties)
      if (
        logEntry.topics.length > 0 &&
        logEntry.topics[0].equals(openseaSignature) &&
        logEntry.address.equals(kittyAddress) // Match the contract address
      ) {
        // Decode the sale amount (fifth parameter) from the event data
        let saleAmountDecoded = ethereum.decode("uint256", logEntry.data);

        // Check if the decoding was successful
        if (saleAmountDecoded) {
          let saleAmount = saleAmountDecoded.toBigInt();
          log.info("[decodeSaleAmount][{}] Sale amount: {}", [
            transactionHash.toHexString(),
            saleAmount.toString(),
          ]);

          // Return the sale amount
          return saleAmount;
        } else {
          log.warning("[decodeSaleAmount][{}] Could not decode sale amount", [
            transactionHash.toHexString(),
          ]);
        }
      }
    }
  } else {
    log.warning("[decodeSaleAmount][{}] No logs found", [
      transactionHash.toHexString(),
    ]);
  }

  // Return default price if no sale amount is found
  return price;
}

/**
 * Function to decode the buyer and seller addresses from the transaction receipt.
 * This function inspects the transaction logs to find the OrdersMatched event
 * and extracts the buyer and seller addresses involved in that event.
 *
 * @param receipt - The transaction receipt containing logs to check for the OrdersMatched event.
 * @param transactionHash - The hash of the transaction being processed, used for logging.
 * @returns An object containing the buyer and seller addresses as Bytes, or null if not found.
 
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

let receipt = event.receipt;**/
