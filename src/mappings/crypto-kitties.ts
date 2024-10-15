import {
  Transfer,
  Transfer as TransferEvent,
} from "../../generated/CryptoKitties/CryptoKitties";
import { Owner, CryptoKitty, Transaction } from "../../generated/schema";

export function handleTransfer(event: TransferEvent): void {
  let cryptoKitty = new Transfer(
    event.transaction.hash.toHex() + "-" + event.logIndex.toHex()
  );

  entity.from = event.params.from;
  entity.to = event.params.to;
  entity.tokenId = event.params.tokenId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
