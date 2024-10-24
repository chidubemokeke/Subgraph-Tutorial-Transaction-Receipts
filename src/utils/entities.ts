import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { CryptoKitty, Owner, Transaction } from "../../generated/schema";
import { BIGINT_ZERO } from "./consts";

export enum TransactionType {
  Mint,
  Sale,
  Failed,
  Unknown,
}

// Retrieves or creates an Owner entity based on an Ethereum address
export function getOrCreateAccount(address: Address): Owner {
  let accountId = address.toHex(); // Use the address as a unique ID

  let account = Owner.load(accountId); // Try to load the entity

  // If no existing entity, create and initialize it
  if (!account) {
    account = new Owner(accountId);
    account.kittiesCount = BIGINT_ZERO; // Start with zero owned CryptoKitties
    account.save(); // Save to persist changes
  }

  return account as Owner; // Return the existing or new entity
}

// Retrieves or creates a CryptoKitty entity based on the tokenId
export function getOrCreateKitty(tokenId: BigInt): CryptoKitty {
  let kittyId = tokenId.toHex(); // Use the tokenId as a unique ID
  let kitty = CryptoKitty.load(kittyId); // Try to load the entity

  // If no existing entity, create and initialize it
  if (!kitty) {
    kitty = new CryptoKitty(kittyId);
    kitty.transactionCount = BIGINT_ZERO; // Initialize number of transactions
    kitty.totalSold = BIGINT_ZERO; // Initialize total sales amount
    kitty.txHash = Bytes.empty(); // Empty transaction hash
  }

  return kitty as CryptoKitty; // Return the existing or new entity
}

// Retrieves or creates a Transaction entity based on the transactionId
export function getOrCreateTransaction(transactionId: string): Transaction {
  let transaction = Transaction.load(transactionId); // Try to load the entity

  // If no existing entity, create and initialize it
  if (transaction == null) {
    transaction = new Transaction(transactionId);
    transaction.amountSold = BIGINT_ZERO; // Initialize sale amount
    transaction.txHash = Bytes.empty(); // Empty transaction hash
  }

  return transaction as Transaction; // Return the existing or new entity
}
