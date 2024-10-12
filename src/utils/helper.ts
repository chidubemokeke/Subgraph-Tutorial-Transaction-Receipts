import { BigInt, Address, Bytes } from "@graphprotocol/graph-ts";
import { Owner } from "../../generated/schema";
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
