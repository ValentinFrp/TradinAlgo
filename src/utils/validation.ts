import { Strategy, StrategyParameter } from '../types/trading';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateStrategy(strategy: Strategy): void {
  if (!strategy.id) throw new ValidationError('Strategy ID is required');
  if (!strategy.name) throw new ValidationError('Strategy name is required');
  if (!strategy.parameters?.length) throw new ValidationError('Strategy must have parameters');

  strategy.parameters.forEach(validateParameter);
}

export function validateParameter(param: StrategyParameter): void {
  if (!param.name) throw new ValidationError('Parameter name is required');
  if (param.min >= param.max) throw new ValidationError('Min value must be less than max value');
  if (param.value < param.min || param.value > param.max) {
    throw new ValidationError(`Parameter ${param.name} value must be between ${param.min} and ${param.max}`);
  }
}

export function validateBacktestParams(
  startDate: Date,
  endDate: Date,
  initialBalance: number
): void {
  if (startDate >= endDate) {
    throw new ValidationError('Start date must be before end date');
  }
  if (initialBalance <= 0) {
    throw new ValidationError('Initial balance must be positive');
  }
  if (endDate > new Date()) {
    throw new ValidationError('End date cannot be in the future');
  }
}