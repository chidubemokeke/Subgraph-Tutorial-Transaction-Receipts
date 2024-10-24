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
  let tokenId = event.params.tokenId;

  // Load or create a new owner entity for the 'to' address
  let buyer = Owner.load(toAccount.id);
  if (!buyer) {
    buyer = new Owner(toAccount.id);
    buyer.kittiesCount = BIGINT_ZERO; // Initialize kittiesCount for buyer
  }

  // Load or create a new owner entity for the 'from' address (seller)
  let seller = Owner.load(fromAccount.id);
  if (!seller) {
    seller = new Owner(fromAccount.id);
    seller.kittiesCount = BIGINT_ZERO; // Initialize kittiesCount for seller
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

  buyer.save();
  seller.save();

  // Create a unique ID for this transfer (could be tx hash + tokenId)
  let transactionId =
    event.transaction.hash.toHex() + "-" + event.logIndex.toHex();

  // Load or create a new Transaction entity
  let transaction = getOrCreateTransaction(transactionId);
  if (!transaction) {
    transaction = new Transaction(transactionId);
    transaction.participant = buyer.id; // Set the buyer as the participant
  }

  transaction.participant = buyer.id; // Set the buyer as the participant

  // Check if the transfer is a mint operation (from address is a zero address)
  if (event.params.from.equals(ZERO_ADDRESS)) {
    transaction.transactionType = getTransactionString(TransactionType.Mint); // Convert enum to string for storage
  } else {
    // Determine the transaction type using the receipt logs for other transfers
    const txType = determineTransactionType(event);
    transaction.transactionType = getTransactionString(txType); // Convert enum to string for storage
  }

  let kitty = getOrCreateKitty(tokenId);
  if (!kitty) {
    kitty = new CryptoKitty(tokenId.toHex());
  }

  kitty.owner = buyer.id;
  kitty.tokenId = tokenId;
  kitty.transactionCount = kitty.transactionCount.plus(BIGINT_ONE);

  // Update totalSold if the transaction was a sale
  if (
    transaction.transactionType === getTransactionString(TransactionType.Sale)
  ) {
    const amountSold = getAuctionSaleAmount(event);
    if (amountSold) {
      kitty.totalSold = kitty.totalSold.plus(amountSold); // Update the total sold amount
    }
  }

  // Save the CryptoKitty entity
  kitty.txHash = event.transaction.hash; // Store the transaction hash
  kitty.save();

  // Set the transaction's kitty reference
  transaction.kitty = kitty.id;

  kitty.txHash = event.transaction.hash;
  kitty.save();

  transaction.kitty = kitty.id;

  // Call decoded SaleAmount from the price params in th AuctionSuccessful event from the logs
  let amountSold = getAuctionSaleAmount(event);

  // Check if a valid amount was decoded, else assign a default value (0)
  transaction.amountSold = amountSold ? amountSold : BIGINT_ZERO;

  transaction.txHash = event.transaction.hash;

  // Save the transaction entity
  transaction.save();
}
