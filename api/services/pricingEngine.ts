import { PricingModel } from '@prisma/client';

export interface PricingInput {
  priceModel: PricingModel;
  totalAmount: number;
  ratePerUnit?: number;
  unitCount?: number;
  milestones?: { cost: number }[];
}

export function calculateAndValidatePricing(input: PricingInput): number {
  if (input.totalAmount < 0) {
    throw new Error('Total pricing amount cannot be negative');
  }

  if (input.priceModel === PricingModel.MILESTONE_BASED) {
    if (!input.milestones || input.milestones.length === 0) {
      throw new Error('Milestones cost breakdown is required for milestone-based pricing');
    }
    const sum = input.milestones.reduce((acc, m) => acc + m.cost, 0);
    if (Math.abs(sum - input.totalAmount) > 0.01) {
      throw new Error(`Total amount (${input.totalAmount}) does not match the sum of milestones cost (${sum})`);
    }
    return sum;
  }

  if (input.priceModel === PricingModel.HOURLY && input.ratePerUnit && input.unitCount) {
    const calculated = input.ratePerUnit * input.unitCount;
    if (Math.abs(calculated - input.totalAmount) > 0.01) {
      throw new Error(`Total amount (${input.totalAmount}) does not match hourly rate calculation (${calculated})`);
    }
  }

  return input.totalAmount;
}
