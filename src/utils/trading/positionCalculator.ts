import { Position } from "../../types/trading";
import Decimal from "decimal.js";

export function calculatePositionPnL(position: Position): {
  pnl: Decimal;
  pnlPercentage: Decimal;
} {
  const pnl = new Decimal(position.currentPrice)
    .minus(position.entryPrice)
    .times(position.amount);

  const pnlPercentage = new Decimal(position.currentPrice)
    .minus(position.entryPrice)
    .div(position.entryPrice)
    .times(100);

  return { pnl, pnlPercentage };
}

export function calculateTotalExposure(positions: Position[]): Decimal {
  return positions.reduce(
    (total, pos) => total.plus(new Decimal(pos.amount).times(pos.currentPrice)),
    new Decimal(0),
  );
}

export function calculateMarginRequirement(
  positions: Position[],
  marginRate: number,
): Decimal {
  const totalExposure = calculateTotalExposure(positions);
  return totalExposure.times(marginRate);
}
