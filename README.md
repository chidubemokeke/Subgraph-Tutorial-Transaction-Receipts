# Understanding Transaction Receipts in Subgraphs

This repository serves as a comprehensive guide to understanding and utilizing transaction receipts within subgraphs. We will explore how transaction receipts can enhance the way we interact with blockchain data and how they can be effectively utilized in the context of NFT smart contracts, specifically the CryptoCoven contract.

## What Are Transaction Receipts?

Transaction receipts are essential components in blockchain transactions, providing detailed information about the outcome of a transaction. Created after a transaction has been mined, a receipt provides the outcome of the transaction (whether it succeeded or failed), the gas used, logs all events triggered during its execution, and other crucial data. Understanding transaction receipts is fundamental for developers looking to build efficient and reliable subgraphs.

## Why Use Transaction Receipts?

Utilizing transaction receipts can significantly enhance your subgraph's functionality by allowing you to:

Track Events: Capture and log events emitted by smart contracts, which can be critical for monitoring contract interactions.
Analyze Performance: Assess the gas efficiency of transactions to optimize contract usage.
Debug Issues: Identify problems with transactions by examining the status and logs in the receipt.

## Step-by-Step Guide for Decoding Event Logs

### 1 - Understand Log Structure

Each event in the Ethereum blockchain is encoded into a log with the following key fields:

- topics: A list of indexed event parameters (including the event signature as the first topic)

- data: Non-indexed parameters, encoded in the same way as function arguments.

## How to Decode Event Logs

- topics[0]: This is the event signature, which identifies which event was emitted.

- Other _topics_: These are indexed parameters like addresses, token IDs, or other primary fields.

- data: Contains the rest of the parameters, encoded as ABI-encoded data.
