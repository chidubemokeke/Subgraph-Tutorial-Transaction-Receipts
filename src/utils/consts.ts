import { crypto, BigInt, Address, ByteArray } from "@graphprotocol/graph-ts";

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

// Constant representing the address of the CryptoKitty Auction Contract.
export const KITTIES_AUCTION_ADDRESS =
  "0xb1690c08e213a35ed9bab7b318de14420fb57d8c";

// Convert the string address to the Address type.
export const KITTY_AUCTION: Address = Address.fromString(
  KITTIES_AUCTION_ADDRESS
);

// Ethereum does not store the full human-readable event signature (e.g.,"Transfer(address,address,uint256)")
// It stores the Keccak-256 hash of the event signature in topic 0
// It uniquely identifies the event type in the transaction logs
// Hash the AuctionSuccessful event signature using the Keccak-256 hashing algorithm

// Hash the event signature using keccak256 (to match against logs.)
export const AUCTION_SUCCESS_SIG = crypto.keccak256(
  ByteArray.fromUTF8("AuctionSuccessful(uint256,uint256,address)")
);

export const AUCTION_CANCEL_SIG = crypto.keccak256(
  ByteArray.fromUTF8("AuctionCancelled(uint256)")
);

export const AIRDROP_SIG = crypto.keccak256(
  ByteArray.fromUTF8("Birth(address,uint256,uint256,uint256,uint256)")
);

export const TRANSFER_EVENT_SIG = crypto.keccak256(
  ByteArray.fromUTF8("Transfer(address,address,uint256)")
);

// Constant representing the address of the Seaport contract (To match sales)
export const SEAPORT_ADDRESS = "0x0000000000000068F116a894984e2DB1123eB395";
// Convert the string address to the Address type.
export const SEAPORT: Address = Address.fromString(SEAPORT_ADDRESS);

// Hash the OrderFulfilled event signature using the Keccak-256 hashing algorithm
export const SEAPORT_SIGNATURE = crypto.keccak256(
  ByteArray.fromUTF8(
    "OrderFulfilled(bytes32,address,address,address,tuple[],tuple[])"
  )
);

/**struct ConsiderationItem {
    ItemType itemType;
    address token;
    uint256 identifierOrCriteria;
    uint256 startAmount;
    uint256 endAmount;
    address payable recipient;
} */
