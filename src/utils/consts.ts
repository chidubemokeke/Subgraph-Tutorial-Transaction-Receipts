import { BigInt, Address, ByteArray, crypto } from "@graphprotocol/graph-ts";

// Define a constant representing the value zero as a BigInt object.
export const BIGINT_ZERO = BigInt.fromI32(0);

// Define a constant representing the value one as a BigInt object.
export const BIGINT_ONE = BigInt.fromI32(1);

// Define a constant representing the zero address (all zeros).
export const ZERO_ADDRESS: Address = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);

// Constant representing the address of the CryptoKitty contract.
export const CRYPTOKITTIES_ADDRESS =
  "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d";
// Convert the string address to the Address type.
export const CRYPTOKITTY: Address = Address.fromString(CRYPTOKITTIES_ADDRESS);

// Ethereum does not store the full human-readable event signature (e.g.,"Transfer(address,address,uint256)")
// It stores the Keccak-256 hash of the event signature in topic 0
// It uniquely identifies the event type in the transaction logs
// Hash the Transfer event signature using the Keccak-256 hashing algorithm
export const KITTY_SIGNATURE = crypto.keccak256(
  ByteArray.fromUTF8("Transfer(address,address,uint256)")
);

// List of some Marketplaces the CryptoKitties NFT is listed/Traded

// Constant representing the address of the OpenSeaV1 contract.
export const OPENSEAV1_ADDRESS = "0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b";
// Convert the string address to the Address type.
export const OPENSEAV1: Address = Address.fromString(OPENSEAV1_ADDRESS);
// Hash the OrdersMatched event signature using the Keccak-256 hashing algorithm.
export const OPENSEA_SIGNATURE = crypto.keccak256(
  ByteArray.fromUTF8(
    "OrdersMatched(bytes32,bytes32,address,address,uint256,bytes32)"
  )
);

// Constant representing the address of the OpenSeaV2 contract.
export const OPENSEAV2_ADDRESS = "0x7f268357A8c2552623316e2562D90e642bB538E5";
// Convert the string address to the Address type.
export const OPENSEAV2: Address = Address.fromString(OPENSEAV2_ADDRESS);

// Constant representing the address of the Seaport contract.
export const SEAPORT_ADDRESS = "0x0000000000000068F116a894984e2DB1123eB395";
// Convert the string address to the Address type.
export const SEAPORT: Address = Address.fromString(SEAPORT_ADDRESS);

// Hash the OrderFulfilled event signature using the Keccak-256 hashing algorithm
export const SEAPORT_SIGNATURE = crypto.keccak256(
  ByteArray.fromUTF8(
    "OrderFulfilled(bytes32,address,address,address,tuple[],tuple[])"
  )
);
