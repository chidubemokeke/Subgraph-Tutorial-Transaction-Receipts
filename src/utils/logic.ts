import { TransactionType } from "./entities";

export function getTransactionString(transactionType: TransactionType): string {
  // Using if-else statements to map the enum values to a string
  if (transactionType === TransactionType.Mint) {
    return "Mint"; // If theTransactionType is Mint, return its string representation
  } else if (transactionType === TransactionType.Sale) {
    return "Sale"; // If theTransactionType is Sale, return its string representation
  } else if (transactionType === TransactionType.Failed) {
    return "Failed"; // If theTransaction Failed, return its string representation
  } else {
    return "Unknown";
  }
}
