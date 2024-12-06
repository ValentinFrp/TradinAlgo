import { Position, Trade } from "../../types/trading";
import Decimal from "decimal.js";

export function calculateMaxDrawdown(trades: Trade[]): Decimal {
  let peak = new Decimal(0);
  let maxDrawdown = new Decimal(0);
  let runningPnL = new Decimal(0);

  trades.forEach((trade) => {
    const tradePnL = new Decimal(trade.price)
      .times(trade.amount)
      .times(trade.type === "buy" ? -1 : 1);

    runningPnL = runningPnL.plus(tradePnL);

    if (runningPnL.greaterThan(peak)) {
      peak = runningPnL;
    }

    const drawdown = peak.minus(runningPnL).div(peak);
    if (drawdown.greaterThan(maxDrawdown)) {
      maxDrawdown = drawdown;
    }
  });

  return maxDrawdown;
}

export function calculatePositionRisk(
  position: Position,
  stopLoss: number,
): {
  riskAmount: Decimal;
  riskPercentage: Decimal;
} {
  const riskAmount = new Decimal(position.currentPrice)
    .minus(stopLoss)
    .abs()
    .times(position.amount);

  const riskPercentage = riskAmount
    .div(position.currentPrice * position.amount)
    .times(100);

  return { riskAmount, riskPercentage };
}

export function calculatePortfolioRisk(
  positions: Position[],
  correlationMatrix: Record<string, Record<string, number>>,
): Decimal {
  // Implement portfolio risk calculation using correlation matrix
  // This is a simplified version
  const individualRisks = positions.map((pos) =>
    new Decimal(pos.currentPrice)
      .minus(pos.entryPrice)
      .abs()
      .div(pos.entryPrice),
  );

  // Calculate weighted average of risks
  return positions.reduce(
    (total, pos, i) =>
      total.plus(individualRisks[i].times(pos.amount * pos.currentPrice)),
    new Decimal(0),
  );
}
