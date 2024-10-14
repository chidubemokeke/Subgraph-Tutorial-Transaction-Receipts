import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import { Owner, Transaction } from "../../generated/schema";
import { BIGINT_ZERO } from "./consts";

// Function to get or create an Account entity based on an Ethereum address
export function getOrCreateAccount(address: Bytes): Owner {
  // Convert the provided Ethereum address to a hexadecimal string for use as the unique ID for the Account entity
  let accountId = address.toHex();

  // Try to load the account entity from the store using the accountId
  let account = Owner.load(accountId);

  // Check if the account entity exists in the store
  if (account == null) {
    // If the account does not exist, create a new Account entity
    account = new Owner(accountId); // Use accountId as the unique identifier

    // Save the newly created account entity to the store to persist its state
    account.save();
  }
  // Return the account entity, which will be either the existing one or the newly created one
  return account as Owner;
}

// Helper function to create or load a Transaction entity
export function createOrLoadTransaction(transactionId: Bytes): Transaction {
  // Attempt to load the existing Transaction entity
  let transaction = Transaction.load(transactionId.toHex());

  // If it doesn't exist, create a new Transaction entity
  if (transaction == null) {
    transaction = new Transaction(transactionId.toHex());
    transaction.seller = Bytes.empty(); // Initialize to an empty Bytes
    transaction.buyer = Bytes.empty(); // Initialize to an empty Bytes
    transaction.referenceId = BIGINT_ZERO; // Initialize to zero
    transaction.marketPlace = ""; // Initialize to zero
    transaction.amountSold = BIGINT_ZERO; // Initialize to zero
    transaction.totalSoldOpenseaV1 = BIGINT_ZERO; // Initialize to zero
    transaction.totalSoldOpenseaV2 = BIGINT_ZERO; // Initialize to zero
    transaction.totalSoldSeaport = BIGINT_ZERO; // Initialize to zero
    transaction.totalSoldOpenseaV2 = BIGINT_ZERO; // Initialize to zero
    transaction.transactionCount = BIGINT_ZERO; // Initialize to zero
    transaction.totalSold = BIGINT_ZERO; // Initialize to zero
    transaction.txHash = Bytes.empty(); // Initialize to an empty Bytes
  }

  return transaction;
}
