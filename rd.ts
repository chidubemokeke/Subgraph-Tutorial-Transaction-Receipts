/**import { Transfer } from "../generated/CryptoKitties/CryptoKitties"; // Adjust the path based on your project structure
import { Transaction, Owner } from "../generated/schema"; // Import your entities
import { decodeBuyerAndSeller } from "./yourHelpers"; // Import your helper function
import { BigInt, Bytes, log } from "@graphprotocol/graph-ts";

// Event handler for processing the Transfer event
export function handleTransfer(event: Transfer): void {
  let receipt = event.receipt; // Get the transaction receipt from the event
  let transactionHash = event.transaction.hash;

  // Decode buyer and seller addresses from the transaction receipt
  let buyerAndSeller = decodeBuyerAndSeller(receipt, transactionHash);

  if (buyerAndSeller === null) {
    log.warning("[handleTransfer][{}] Failed to decode buyer and seller", [
      transactionHash.toHexString(),
    ]);
    return; // Exit if we couldn't decode the addresses
  }

  let buyer = buyerAndSeller.buyer;
  let seller = buyerAndSeller.seller;

  // Create a new Transaction entity
  let transaction = new Transaction(transactionHash.toHexString()); // Use the transaction hash as the entity ID
  transaction.owner = buyer; // You can link the owner based on business logic
  transaction.seller = Bytes.fromHexString(seller);
  transaction.buyer = Bytes.fromHexString(buyer);

  // Populate other relevant fields for the transaction entity
  transaction.id = transactionHash.toHexString(); // Unique ID for the transaction
  transaction.status = Status.Success; // Assuming success for this example; adjust based on your logic

  // Save the entity to the store
  transaction.save();

  log.info("[handleTransfer][{}] Transaction saved: Seller: {}, Buyer: {}", [
    transactionHash.toHexString(),
    seller,
    buyer,
  ]);
}



  /**
 * Function to decode the marketplace from the transaction receipt.
 * This function checks the logs of the transaction receipt to determine which marketplace processed the transaction.
 * @param receipt - The transaction receipt to check logs for marketplace addresses.
 * @param transactionHash - The hash of the transaction for logging purposes.
 * @returns The name of the marketplace as a string.
 
export function decodeMarketplace(
  receipt: ethereum.TransactionReceipt | null,
  transactionHash: Bytes
): string {
  // Check if the receipt exists; if not, log a warning and return 'Unknown'
  if (!receipt) {
    log.warning("No receipt found, TxHash: {}", [
      transactionHash.toHexString(),
    ]);
    return "Unknown"; // No receipt means we can't determine the marketplace
  }

  // Retrieve the logs from the receipt
  let logs = receipt.logs;
  // If there are no logs in the receipt, log a warning and return 'Unknown'
  if (!logs || logs.length === 0) {
    log.warning("No logs found in receipt, TxHash: {}", [
      transactionHash.toHexString(),
    ]);
    return "Unknown"; // Without logs, we cannot find the marketplace address
  }

  // Loop through each log to check for known marketplace addresses
  for (let i = 0; i < logs.length; i++) {
    let logEntry = logs[i]; // Get the current log entry

    // Check if the current log's address matches OpenSeaV1
    if (logEntry.address.equals(OPENSEAV1)) {
      return "OpenSeaV1"; // If matched, return the string name of the marketplace
    }

    // Check if the current log's address matches OpenSeaV2
    if (logEntry.address.equals(OPENSEAV2)) {
      return "OpenSeaV2"; // If matched, return the string name of the marketplace
    }

    // Check if the current log's address matches Seaport
    if (logEntry.address.equals(SEAPORT)) {
      return "Seaport"; // If matched, return the string name of the marketplace
    }
  }

  // If no known marketplace address was found after checking all logs, log a warning and return 'Unknown'
  log.warning("Unknown Marketplace, TxHash: {}", [
    transactionHash.toHexString(),
  ]);
  return "Unknown"; // Return 'Unknown' if no recognized marketplace address is found
}**

  // If no valid OrdersMatched event is found, return null addresses
  log.warning("No matching OrdersMatched event found, TxHash: {}", [
    transactionHash.toHexString(),
  ]);
  return { buyer: null, seller: null };
}**/

/**Counter for how many times this NFT was involved in OpenseaV1 transactions";
 totalCountOpenseaV1: BigInt!;

 ("Counter for how many times this NFT was involved in OpenseaV2 transactions");
 totalCountOpenseaV2: BigInt!;

 ("Counter for how many times this NFT was involved in a Seaport transactions");
 totalCountSeaport: BigInt!;**/

/**
 * Function to determine the status of a CryptoKitty transfer transaction.
 * It checks if the receipt and logs are present and verifies if the transfer event occurred successfully.
 * @param receipt - The transaction receipt to check logs for the transfer event.
 * @returns The status of the transaction as TransactionStatus (Success or Failed).
 
export function decodeStatus(
  receipt: ethereum.TransactionReceipt | null,
  transactionHash: Bytes
): Status {
  // If there's no receipt, log the txHash for inspection.
  if (!receipt) {
    log.warning("No receipt found TxHash: {}", [transactionHash.toHexString()]);
    return Status.Failed;
  }

  // Check if the logs exist in the receipt
  let logs = receipt.logs;
  if (!logs) {
    log.warning(" No logs found in receipt, TxHash: {}", [
      transactionHash.toHexString(),
    ]);
    return Status.Failed;
  }

  // Loop through the logs to find the Transfer event matching the CryptoKitties signature
  for (let i = 0; i < logs.length; ++i) {
    let logEntry = logs[i];

    let kittySignature = crypto.keccak256(
      ByteArray.fromUTF8("Transfer(address,address,uint256)")
    );

    // The first topic in the log should match the transfer event signature (kittySignature)
    if (
      logEntry.topics.length > 0 &&
      logEntry.topics[0].equals(kittySignature)
    ) {
      log.info("Transfer event found, Success", []);
      return Status.Success;
    }
  }

  /**  If no valid transfer event is found, the transaction is considered Failed.
  log.warning("No matching Transfer event found, TxHash: {}", [
    transactionHash.toHexString(),
  ]);
  return Status.Failed;
**/
