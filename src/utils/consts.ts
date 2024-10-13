import { BigInt, Address } from "@graphprotocol/graph-ts";

// Define a constant representing the value zero as a BigInt object.
export const BIGINT_ZERO = BigInt.fromI32(0);

// Define a constant representing the value one as a BigInt object.
export const BIGINT_ONE = BigInt.fromI32(1);

// Define a constant representing the zero address (all zeros).
export const ZERO_ADDRESS: Address = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);

// List of some Marketplaces the CryptoKitties NFT is listed/Traded

// Constant representing the address of the OpenSeaV1 contract.
export const OPENSEAV1_ADDRESS = "0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b";
// Convert the string address to the Address type.
export const OPENSEAV1: Address = Address.fromString(OPENSEAV1_ADDRESS);

// Constant representing the address of the OpenSeaV2 contract.
export const OPENSEAV2_ADDRESS = "0x7f268357A8c2552623316e2562D90e642bB538E5";
// Convert the string address to the Address type.
export const OPENSEAV2: Address = Address.fromString(OPENSEAV2_ADDRESS);

// Constant representing the address of the Seaport contract.
export const SEAPORT_ADDRESS = "0x0000000000000068F116a894984e2DB1123eB395";
// Convert the string address to the Address type.
export const SEAPORT: Address = Address.fromString(SEAPORT_ADDRESS);
