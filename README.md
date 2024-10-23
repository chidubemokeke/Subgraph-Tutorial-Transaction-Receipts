# Understanding Transaction Receipts in Subgraphs

This repository is a simple guide to understanding and utilizing transaction receipts within subgraphs. We will explore how transaction receipts can enhance the way we interact with blockchain data and how they can be effectively utilized in the context of NFT smart contracts, specifically the CryptoKitties contract.

In this subgraph, by setting receipt to true in the manifest, we can access the transaction logs to retrieve the saleAmount from a different event parameters and logIndice in the same Transaction.

We also use transaction receipts to check the type of a transaction and assign an Enum value to it.

## What Are Transaction Receipts?

Transaction receipts are essential components in blockchain transactions, providing detailed information about the outcome of a transaction. Created after a transaction has been mined, a receipt provides the outcome of the transaction (whether it succeeded or failed), the gas used, logs all events triggered during its execution, and other crucial data. Understanding transaction receipts is fundamental for developers looking to build efficient and reliable subgraphs.

## Why Use Transaction Receipts?

Utilizing transaction receipts can significantly enhance your subgraph's functionality by allowing you to:

Track Events: Capture and log events emitted by smart contracts, which can be critical for monitoring contract interactions.
Analyze Performance: Assess the gas efficiency of transactions to optimize contract usage.
Debug Issues: Identify problems with transactions by examining the status and logs in the receipt.

## Data Source Configuration

```yaml
specVersion: 1.0.0
indexerHints:
  prune: auto
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: CryptoKitties
    network: mainnet
    source:
      address: "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d"
      abi: CryptoKitties
      startBlock: 4605167
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - Owner
        - CryptoKitty
        - Transaction
      abis:
        - name: CryptoKitties
          file: ./abis/CryptoKitties.json
      eventHandlers:
        - event: Transfer(address,address,uint256)
          handler: handleTransfer
          # Enable receipt processing to access additional data from the transaction logs to verify transaction details from logs
          receipt: true
      file: ./src/mappings/crypto-kitties.ts
```

## Schema Overview

- Owner
- CryptoKitty
- Transaction

```gql
# Enum representing different types of transactions (Mint, Sale, or Failed)
enum TransactionType {
  Mint # A new CryptoKitty was created/Birthed
  Sale # The CryptoKitty was sold in a successful transaction
  Failed # The transaction failed
  Unknown
}

# Represents a user or wallet that owns CryptoKitties
type Owner @entity {
  "Unique address of the user or wallet"
  id: ID!

  "List of CryptoKitties owned by this user"
  kitties: [CryptoKitty!]! @derivedFrom(field: "owner")

  "Number of CryptoKitties owned by this Owner" # Ordering by a derived field's length is not supported, which is why a separate count field.
  kittiesCount: BigInt!

  "All transactions involving this user, derived from the Transaction.participant field."
  transactions: [Transaction!]! @derivedFrom(field: "participant")
}

# Represents a specific CryptoKitty NFT and Transfer event
type CryptoKitty @entity {
  "Unique identifier for each CryptoKitty (token ID)"
  id: ID!

  "The owner of this CryptoKitty"
  owner: Owner!

  "The unique token ID of the CryptoKitty NFT"
  tokenId: BigInt!

  "Number of times this CryptoKitty was involved in a transaction"
  transactionCount: BigInt!

  "Total amount this CryptoKitty has been sold for"
  totalSold: BigInt!

  txHash: Bytes!
}

# Represents a transaction where a CryptoKitty was transferred or sold
type Transaction @entity {
  "Unique identifier for each transaction (transaction hash)"
  id: ID!

  "Reference to the buyer or seller involved in this transaction"
  participant: Owner!

  "The CryptoKitty involved in this transaction"
  kitty: CryptoKitty!

  "Type of transaction (Mint, Sale, or Failed)"
  transactionType: TransactionType!

  "Amount sold (only applicable if transactionType is 'Sale')"
  amountSold: BigInt!

  txHash: Bytes!
}
```

## Decoding Functions

The subgraph includes functions to decode event logs from transaction receipts. These functions enable the retrieval of relevant data, such as the sale amount and transaction type

### getAuctionSaleAmount(event: ethereum.Event)

Extracts the sale amount from an AuctionSuccessful event that occurs before the Transfer event in the logs. This function iterates through the logs, checks for the correct signature, and decodes the sale amount

```typescript
export function getAuctionSaleAmount(event: ethereum.Event): BigInt | null {
  // Check if the event has a transaction receipt. The receipt contains all logs from the transaction.
  if (!event.receipt) {
    return null; // If there's no receipt, we can't proceed with log analysis.
  }

  const currentLogIndex = event.logIndex; // Log index of the current event being processed (Transfer event).
  const logs = event.receipt!.logs; // Access all logs from the transaction receipt.

  // Loop through logs to find any AuctionSuccessful events that occur before the Transfer event.
  for (let i = 0; i < logs.length; i++) {
    const currentLog = logs[i]; // Current log in the loop.

    // Ensure that the log's index (from the logs array) is less than the current Transfer event's log index
    // Convert i to BigInt for comparison with currentLogIndex
    if (BigInt.fromI32(i) >= currentLogIndex) {
      // Stop searching since we have passed the logs that occurred before the Transfer event.
      break;
    }

    // Check if the log corresponds to the AuctionSuccessful event by comparing its signature (topic0) and the contract address.
    if (
      currentLog.topics.length > 0 &&
      currentLog.topics[0] == AUCTION_SUCCESS_SIG
    ) {
      // The `AuctionSuccessful` event data contains several fields. We are interested in the `totalPrice`,
      // which is the second parameter (a `uint256`), located in the data section of the log.
      // Extract and decode the `AuctionPrice` from the log's data.
      // The `AuctionPrice` is located from bytes 32 to 64 in the log's data (the second parameter in the AuctionSuccessful event structure).
      const saleAmount = ethereum
        .decode(
          "uint256",
          Bytes.fromUint8Array(currentLog.data.subarray(32, 64)) // Corresponds to the second parameter
        )!
        .toBigInt();

      if (saleAmount) {
        return saleAmount; // Return the sale amount if decoding succeeds
      } else {
        // If decoding fails, log a warning with the transaction hash.
        log.warning(
          "[getAuctionSaleAmount] Failed to decode sale amount in transaction {}",
          [event.transaction.hash.toHexString()]
        );
        return null; // Return null if decoding fails
      }
    }
  }

  // If no matching AuctionSuccessful event was found before the Transfer event, return null
  return null;
}
```

### determineTransactionType(event: ethereum.Event)

Determines the transaction type (Mint, Sale, or Failed) based on the event logs. It checks for the presence of relevant event signatures and returns the corresponding transaction type.

```typescript
export function determineTransactionType(
  event: ethereum.Event
): TransactionType {
  // Check if the event has a transaction receipt. The receipt contains all logs from the transaction.
  if (!event.receipt) {
    return TransactionType.Failed; // If there's no receipt, mark the transaction as failed.
  }

  const logs = event.receipt!.logs; // Access all logs from the transaction receipt.

  // Loop through all logs in the transaction receipt.
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i]; // Current log in the loop.

    // Check if the log corresponds to the AuctionSuccessful event.
    if (log.topics.length > 0 && log.topics[0] == AUCTION_SUCCESS_SIG) {
      return TransactionType.Sale; // Return It's a sale transaction.
    }

    // Check if the log matches the AuctionCancelled signature.
    if (log.topics.length > 0 && log.topics[0] == AUCTION_CANCEL_SIG) {
      return TransactionType.Failed; // Auction was cancelled, so mark as failed.
    }
  }

  // Default to unknown if none of the conditions match.
  return TransactionType.Unknown;
}
```

## Step-by-Step Guide for Decoding Event Logs

### 1 - Understand Log Structure

Each event in the Ethereum blockchain is encoded into a log with the following key fields:

- topics: A list of indexed event parameters (including the event signature as the first topic)

- data: Non-indexed parameters, encoded in the same way as function arguments.

## How to Decode Event Logs

- topics[0]: This is the event signature, which identifies which event was emitted.

- Other _topics_: These are indexed parameters like addresses, token IDs, or other primary fields.

- data: Contains the rest of the parameters, encoded as ABI-encoded data.

## Example Queries
