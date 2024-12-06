import { Position } from "../../types/trading";
import Decimal from "decimal.js";

export function validateOrder(
  type: "buy" | "sell",
  amount: number,
  price: number,
  balance: number,
  positions: Position[],
): { isValid: boolean; error?: string } {
  if (amount <= 0) {
    return { isValid: false, error: "Amount must be greater than 0" };
  }

  if (price <= 0) {
    return { isValid: false, error: "Price must be greater than 0" };
  }

  const total = new Decimal(amount).times(price);

  if (type === "buy") {
    if (total.greaterThan(balance)) {
      return { isValid: false, error: "Insufficient balance" };
    }
  } else {
    const position = positions.find((p) => p.amount >= amount);
    if (!position) {
      return { isValid: false, error: "Insufficient position size" };
    }
  }

  return { isValid: true };
}
