import { addMoney, multiplyMoney, roundValue } from './finance';

/**
 * Professional Quote Engine
 * Centralized logic for all quote-related calculations.
 */

export interface CalculationInput {
  items: Array<{ quantity: number; unitPrice: number }>;
  laborHours: number;
  laborRate: number;
  materialCosts: number;
  taxRate: number;
}

export interface CalculationOutput {
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
}

/**
 * Recalculates all pricing for a quote using safe monetary math.
 * Ensures that subtotal + tax always reconciles to grandTotal.
 */
export function calculateQuoteTotals(input: CalculationInput): CalculationOutput {
  const { items, laborHours, laborRate, materialCosts, taxRate } = input;

  // 1. Calculate Items Total (sum of individual line item totals)
  const itemsTotal = items.reduce((acc, item) => {
    const itemTotal = multiplyMoney(item.unitPrice, item.quantity);
    return addMoney(acc, itemTotal);
  }, 0);

  // 2. Calculate Labor Subtotal
  const laborTotal = multiplyMoney(laborRate, laborHours);

  // 3. Subtotal (Items + Labor + Materials)
  const subtotal = addMoney(itemsTotal, laborTotal, materialCosts);

  // 4. Tax (Subtotal * Tax Rate %)
  // taxRate is passed as a percentage (e.g. 8.25), so we divide by 100
  const taxTotal = multiplyMoney(subtotal, (Number(taxRate) || 0) / 100);

  // 5. Grand Total (Subtotal + Tax)
  const grandTotal = addMoney(subtotal, taxTotal);

  return {
    subtotal,
    taxTotal,
    grandTotal
  };
}

/**
 * Rounds a number to exactly two decimal places.
 * Maintained for backward compatibility but uses safe rounding logic.
 */
export function roundToCent(val: number | string): number {
  return roundValue(val, 2);
}
