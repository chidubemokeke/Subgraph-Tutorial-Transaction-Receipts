import { CryptoKitty, Owner, Transaction } from "../../generated/schema";
import {
  determineTransactionType,
  getAuctionSaleAmount,
} from "../utils/decode";
import { Transfer as TransferEvent } from "../../generated/CryptoKitties/CryptoKitties";
import {
  getOrCreateAccount,
  getOrCreateKitty,
  getOrCreateTransaction,
  TransactionType,
} from "../utils/entities";
import { BIGINT_ONE, BIGINT_ZERO, ZERO_ADDRESS } from "../utils/consts";
import { getTransactionString } from "../utils/logic";

// Function to handle the Transfer event of a CryptoKitty NFT
export function handleTransfer(event: TransferEvent): void {
  // Get or create account entities for 'from' and 'to' addresses
  let fromAccount = getOrCreateAccount(event.params.from);
  let toAccount = getOrCreateAccount(event.params.to);
  let tokenId = event.params.tokenId; // Get the token ID of the transferred CryptoKitty

  // Load or create a new owner entity for the 'to' address (buyer)
  let buyer = Owner.load(toAccount.id);
  if (!buyer) {
    buyer = new Owner(toAccount.id);
    buyer.kittiesCount = BIGINT_ZERO;
  }

  // Load or create a new owner entity for the 'from' address (seller)
  let seller = Owner.load(fromAccount.id);
  if (!seller) {
    seller = new Owner(fromAccount.id);
    seller.kittiesCount = BIGINT_ZERO;
  }

  // Handle mint operation (from address is a zero address)
  if (event.params.from.equals(ZERO_ADDRESS)) {
    // If it's a mint, we don't decrement the seller's count
    seller.kittiesCount = BIGINT_ZERO; // Explicitly set to zero for minting
  } else {
    // For regular transfers, decrement the seller's kittiesCount if greater than zero
    if (seller.kittiesCount.gt(BIGINT_ZERO)) {
      seller.kittiesCount = seller.kittiesCount.minus(BIGINT_ONE); // Decrement the count
    }
  }

  // Increment kittiesCount for the buyer since they are receiving an NFT
  buyer.kittiesCount = buyer.kittiesCount.plus(BIGINT_ONE);

  // Persist changes to buyer and seller entities
  buyer.save();
  seller.save();

  // Create a unique ID for this transfer (could be tx hash + log index)
  let transactionId =
    event.transaction.hash.toHex() + "-" + event.logIndex.toHex();

  // Load or create a new Transaction entity
  let transaction = getOrCreateTransaction(transactionId); // Retrieve or create the transaction entity

  if (!transaction) {
    transaction = new Transaction(transactionId);
    transaction.participant = buyer.id; // Set the buyer as the participant
  }

  // Check if the transfer is a mint operation (from address is a zero address)
  if (event.params.from.equals(ZERO_ADDRESS)) {
    transaction.transactionType = getTransactionString(TransactionType.Mint); // Set transaction type as Mint
  } else {
    // Determine the transaction type using the receipt logs for other transfers
    const txType = determineTransactionType(event); // Decode transaction type from logs
    transaction.transactionType = getTransactionString(txType); // Convert enum to string for storage
  }

  // Retrieve or create a CryptoKitty entity based on the tokenId
  let kitty = getOrCreateKitty(tokenId);
  if (!kitty) {
    kitty = new CryptoKitty(tokenId.toHex()); // Create a new CryptoKitty entity if it doesn't exist
  }

  // Update the ownership and transaction details of the CryptoKitty
  kitty.owner = buyer.id;
  kitty.tokenId = tokenId;
  kitty.transactionCount = kitty.transactionCount.plus(BIGINT_ONE); // Increment transaction count

  // Update totalSold if the transaction was a sale
  if (
    transaction.transactionType === getTransactionString(TransactionType.Sale)
  ) {
    const amountSold = getAuctionSaleAmount(event); // Decode the sale amount from event logs
    if (amountSold) {
      kitty.totalSold = kitty.totalSold.plus(amountSold); // Update the total sold amount
    }
  }

  // Save the updated CryptoKitty entity
  kitty.txHash = event.transaction.hash; // Store the transaction hash for the CryptoKitty
  kitty.save(); // Persist changes

  // Set the transaction's kitty reference
  transaction.kitty = kitty.id; // Link the transaction to the corresponding CryptoKitty

  // Call decoded SaleAmount from the price params in the AuctionSuccessful event from the logs
  let amountSold = getAuctionSaleAmount(event);

  // Check if a valid amount was decoded, else assign a default value (0)
  transaction.amountSold = amountSold ? amountSold : BIGINT_ZERO;

  transaction.txHash = event.transaction.hash; // Store the transaction hash for the transaction entity

  // Save the transaction entity
  transaction.save(); // Persist changes to the transaction entity
}
