
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
 * Rounds a number to exactly two decimal places.
 */
export function roundToCent(val: number | string): number {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return 0;
  return Math.round(num * 100) / 100;
}

/**
 * Recalculates all pricing for a quote.
 * This is the single source of truth for business logic.
 */
export function calculateQuoteTotals(input: CalculationInput): CalculationOutput {
  const { items, laborHours, laborRate, materialCosts, taxRate } = input;

  // 1. Calculate Items Total
  const itemsTotal = items.reduce((acc, item) => {
    return acc + (roundToCent(item.quantity) * roundToCent(item.unitPrice));
  }, 0);

  // 2. Calculate Labor
  const laborTotal = roundToCent(laborHours) * roundToCent(laborRate);

  // 3. Subtotal
  const subtotal = roundToCent(itemsTotal + laborTotal + roundToCent(materialCosts));

  // 4. Tax
  const taxTotal = roundToCent(subtotal * (roundToCent(taxRate) / 100));

  // 5. Grand Total
  const grandTotal = roundToCent(subtotal + taxTotal);

  return {
    subtotal: roundToCent(subtotal),
    taxTotal: roundToCent(taxTotal),
    grandTotal: roundToCent(grandTotal)
  };
}
