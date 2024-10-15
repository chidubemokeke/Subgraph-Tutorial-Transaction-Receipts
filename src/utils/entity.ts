import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { CryptoKitty, Owner, Transaction } from "../../generated/schema";
import { BIGINT_ZERO } from "./consts";
//import { decodeStatus } from "./decode";

export enum Status {
  Success,
  Failed,
}

export enum MarketPlace {
  OpenSeaV1,
  OpenSeaV2,
  Seaport,
  Unknown,
}

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

// Function to get or create a CryptoKitty entity based on the tokenId
export function getOrCreateKitty(tokenId: BigInt): CryptoKitty {
  // Use the tokenId as the unique identifier for CryptoKitty
  let kittyId = tokenId.toHex();
  let kitty = CryptoKitty.load(kittyId);

  // If CryptoKitty does not exist, create a new one
  if (kitty == null) {
    kitty = new CryptoKitty(kittyId);
    kitty.transactionCount = BIGINT_ZERO; // Initialize transaction count
    kitty.totalSold = BIGINT_ZERO; // Initialize total sold

    // Save the newly created CryptoKitty entity
    kitty.save();
  }

  // Return the CryptoKitty entity, either the existing one or the newly created one
  return kitty as CryptoKitty;
}

// Function to get or create a Transaction entity based on the transaction ID
export function getOrCreateTransaction(transactionId: Bytes): Transaction {
  // Attempt to load the existing Transaction entity using the provided transaction ID
  let transaction = Transaction.load(transactionId.toHex());

  // If the transaction entity does not exist, create a new one
  if (transaction == null) {
    transaction = new Transaction(transactionId.toHex());

    // Initialize fields with default values
    transaction.seller = Bytes.empty(); // Initialize to an empty Bytes
    transaction.buyer = Bytes.empty(); // Initialize to an empty Bytes
    transaction.referenceId = BIGINT_ZERO; // Initialize to zero
    transaction.status = Status.Success; // Default status can be adjusted as needed
    transaction.isMint = false; // Default to false
    transaction.marketPlace = MarketPlace.Unknown; // Default to unknown marketplace
    transaction.amountSold = BIGINT_ZERO; // Initialize to zero
    transaction.txHash = Bytes.empty(); // Initialize to an empty Bytes
  }

  // Return the Transaction entity, either existing or newly created
  return transaction as Transaction;
}
