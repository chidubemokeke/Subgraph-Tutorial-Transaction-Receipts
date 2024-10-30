# Understanding Transaction Receipts in Subgraphs

This repository is a simple guide to understanding and utilizing transaction receipts within subgraphs. We'll explore how transaction receipts can enhance how we interact with blockchain data, particularly within NFT smart contracts, using the CryptoKitties contract as an example.

By setting `receipt: true` in the manifest, we can access transaction logs to retrieve important data such as the sale amount from different event parameters and logIndex in the same transaction. Transaction receipts are also used to determine the type of transaction and assign an appropriate enum value to it.

## What Are Transaction Receipts?

A transaction receipt is a confirmation record created after a transaction is mined. It provides crucial details such as:

- Whether the transaction succeeded or failed.
- Gas used.
- Logs of events triggered during execution.
- Other important data relevant to the transaction.

These receipts are vital for developers because they allow deep insights into what occurred during the transaction, beyond just a confirmation of its success.

## Transaction Receipts

Transaction Receipts provide access to logs emitted by other contracts. These logs contain valuable information regarding events triggered during execution by other contracts.

For example, our subgraph tracks events from the CryptoKitty contract. However, to gather sale data from the exchanges, we need to identify the events/logs emitted by the exchange contracts.

The `key` is that we can listen for Transfer events on the CryptoCoven contract. By doing this, we can also check if sale-related events occurred within the same transaction. This allows us to aggregate data across multiple contracts effectively and obtain comprehensive insights into NFT transactions.

Understanding these transactions is crucial for developers and users alike, as it enables them to track and analyze the complete lifecycle of NFTs. By leveraging transaction receipts, developers can build more robust applications that provide users with detailed transaction histories, enhancing transparency and trust in the ecosystem.

## Why Use Transaction Receipts?

Transaction receipts can improve the functionality of your subgraph by allowing you to:

- Track Events: Log all contract events in a transaction (e.g., sales or transfers).
- Analyze Gas Usage: Optimize contract performance by analyzing how much gas was consumed.
- Debug Transactions: Find and fix transaction issues by reviewing logs and transaction outcomes.

## Data Source Configuration

Below is an example of the configuration used for enabling transaction receipts in the CryptoKitties subgraph:

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

- Owner: Represents a user or wallet that owns CryptoKitties.
- CryptoKitty: Represents a specific NFT (non-fungible token)
- Transaction: Represents a transaction where a CryptoKitty was transferred or sold.

The Transaction entity includes an enum for TransactionType to classify the type of transaction (Mint, Sale, or Failed).

```gql
# Enum representing different types of transactions
enum TransactionType {
  Mint # A new CryptoKitty was created/Birthed
  Sale # The CryptoKitty was sold in a successful transaction
  Failed # The transaction failed
  Unknown
}

# Represents a user or wallet that owns CryptoKitties
type Owner @entity {
  id: ID! # Unique address of the owner
  kitties: [CryptoKitty!]! @derivedFrom(field: "owner") # List of owned CryptoKitties
  kittiesCount: BigInt! # Number of CryptoKitties owned
  transactions: [Transaction!]! @derivedFrom(field: "participant") # All transactions involving this owner
}

# Represents a specific CryptoKitty NFT
type CryptoKitty @entity {
  id: ID! # Unique identifier for the CryptoKitty
  owner: Owner! # Owner of the CryptoKitty
  tokenId: BigInt! # Token ID of the CryptoKitty
  transactionCount: BigInt! # Number of transactions involving this CryptoKitty
  totalSold: BigInt! # Total amount the CryptoKitty was sold for
  txHash: Bytes! # Transaction hash
}

# Represents a transaction involving a CryptoKitty
type Transaction @entity {
  id: ID! # Unique identifier (transaction hash)
  participant: Owner! # The buyer or seller in the transaction
  kitty: CryptoKitty! # The CryptoKitty involved in the transaction
  transactionType: TransactionType! # Type of transaction (Mint, Sale, Failed)
  amountSold: BigInt! # Sale amount (only if transactionType is 'Sale')
  txHash: Bytes! # Transaction hash
}
```

## Decoding Functions

The following functions help decode event logs from transaction receipts, allowing us to extract useful data like the sale amount and determine the type of transaction.

### Example: getAuctionSaleAmount

The function below demonstrates how to retrieve the sale amount from an AuctionSuccessful event, which occurs before a Transfer event in the logs.

```typescript
export function getAuctionSaleAmount(event: ethereum.Event): BigInt | null {
  // Ensure the event has a receipt with logs to analyze
  if (!event.receipt) {
    return null; // No logs available, return null
  }

  const currentLogIndex = event.logIndex; // Get the index of the current Transfer event
  const logs = event.receipt!.logs; // Access all logs in the receipt

  // Loop through logs preceding the current event to find AuctionSuccessful
  for (let i = 0; i < logs.length; i++) {
    const currentLog = logs[i]; // Current log in the iteration

    // Stop if the log index exceeds the current event's index
    if (BigInt.fromI32(i) >= currentLogIndex) {
      break; // No need to check further logs
    }

    // Identify AuctionSuccessful events by checking their signature
    if (
      currentLog.topics.length > 0 &&
      currentLog.topics[0] == AUCTION_SUCCESS_SIG
    ) {
      // - We use `subarray(32, 64)` to slice out the second 32 bytes of data from the event log.
      // - Since Ethereum stores numeric values in a "uint256" format, we specify "uint256" in the decode function.
      // Decode the sale amount, which is the second parameter in the log data
      const saleAmount = ethereum
        .decode(
          "uint256", // Decode the data as a uint256
          Bytes.fromUint8Array(currentLog.data.subarray(32, 64)) // Extract second parameter
        )!
        .toBigInt(); // Convert the decoded value to BigInt for further use

      // Return the sale amount if decoding is successful, otherwise log a warning
      if (saleAmount) {
        return saleAmount;
      } else {
        log.warning(
          "[getAuctionSaleAmount] Failed to decode sale amount in tx {}",
          [event.transaction.hash.toHexString()]
        );
        return null;
      }
    }
  }

  // Return null if no matching AuctionSuccessful event is found before the Transfer event
  return null;
}
```

### Example: determineTransactionType

This function determines the type of transaction based on the logs, identifying it as a Mint, Sale, or Failed transaction.

```typescript
export function determineTransactionType(
  event: ethereum.Event
): TransactionType {
  // Ensure the event has a receipt with logs to analyze
  if (!event.receipt) {
    return TransactionType.Failed; // No receipt, consider the transaction failed
  }

  const logs = event.receipt!.logs; // Access all logs in the receipt

  // Loop through all logs to determine the transaction type
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i]; // Current log in the iteration

    // Identify AuctionSuccessful events
    if (log.topics.length > 0 && log.topics[0] == AUCTION_SUCCESS_SIG) {
      return TransactionType.Sale; // It's a sale transaction
    }

    // Identify AuctionCancelled events
    if (log.topics.length > 0 && log.topics[0] == AUCTION_CANCEL_SIG) {
      return TransactionType.Failed; // Transaction failed due to auction cancellation
    }
  }

  // Default to Unknown if no matching events are found
  return TransactionType.Unknown;
}
```

## Step-by-Step Guide for Decoding Event Logs

### 1. Understand the Log Structure

- topics[0]: The event signature identifying the event emitted.
- Other topics: Indexed parameters (e.g., addresses, token IDs).
- data: ABI-encoded non-indexed parameters (e.g., sale amount).

## 2. Decode the Logs

- topics[0]: This is the event signature, which identifies which event was emitted.

- Other _topics_: These are indexed parameters like addresses, token IDs, or other primary fields.

- data: Contains the rest of the parameters, encoded as ABI-encoded data.

## Sample Queries

## Query 1: Retrieve Top Owner by Kitty Count

In this query, Transaction Receipts help identify owners with the most active sales across various transaction types (e.g., successful sales, failed transfers). The transactions field includes sale-type transactions decoded from Transaction Receipts, enabling detailed tracking of sales associated with each owner.

```gql
{
  owners(first: 1, orderBy: kittiesCount, orderDirection: desc) {
    id
    kittiesCount
    transactions(where: { transactionType: Sale }) {
      id
    }
    kitties(first: 1, orderBy: transactionCount, orderDirection: desc) {
      transactionCount
    }
  }
}
```

## Returns

```gql
{
  "data": {
    "owners": [
      {
        "id": "0xb1690c08e213a35ed9bab7b318de14420fb57d8c",
        "kittiesCount": "207927",
        "transactions": [],
        "kitties": [
          {
            "transactionCount": "118"
          }
        ]
      }
    ]
  }
}
```

## Query 2: Retrieve Failed Transactions for High-Activity CryptoKitties

This query uses Transaction Receipts to capture transactions marked as "Failed," which are decoded and tagged in logs from both the NFT contract and marketplace contracts. By using these receipts, we can include both transaction statuses and transaction counts in the query, allowing users to quickly identify CryptoKitties that frequently experience failed transactions.

```gql
{
  transactions(
    where: { transactionType: Failed, kitty_: { transactionCount_gte: "46" } }
    first: 1
  ) {
    kitty {
      id
      tokenId
      transactionCount
      owner {
        id
      }
    }
    transactionType
    txHash
  }
}
```

## Returns2

```gql
{
  "data": {
    "transactions": [
      {
        "kitty": {
          "id": "0x1896fa",
          "tokenId": "1611514",
          "transactionCount": "49",
          "owner": {
            "id": "0xb1690c08e213a35ed9bab7b318de14420fb57d8c"
          }
        },
        "transactionType": "Failed",
        "txHash": "0x0033917ad2eeaa7183262d47bd4bab071857e21b53a7bd744afebc0002d95cf0"
      }
    ]
  }
}
```

## Query 3: Retrieving CryptoKittiy with Maximum Transactions and Sales

Here, Transaction Receipts enable the tracking of total sale amounts (totalSold) and transaction counts (transactionCount) across marketplaces, using receipts to decode sale-related logs. This provides a straightforward way to query the most traded or valuable CryptoKitties based on cumulative transaction data.

This query retrieves the first transaction of type "Failed" for CryptoKitties that have a transaction count of 46 or more

```gql
{
  cryptoKitties(
    where: { transactionCount_gte: "50" }
    orderBy: transactionCount
    orderDirection: desc
    first: 1
  ) {
    id
    tokenId
    transactionCount
    totalSold
    owner {
      id
    }
  }
}
```

## Return3

```gql
{
  "data": {
    "cryptoKitties": [
      {
        "id": "0xfd679",
        "tokenId": "1037945",
        "transactionCount": "1746",
        "totalSold": "40731620370370370",
        "owner": {
          "id": "0x6e13c7e25c2cda6f5c8c4e431bee480bfb312c28"
        }
      }
    ]
  }
}
```
