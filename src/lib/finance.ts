/**
 * Monetary utilities for ServiceQuotePro
 * Ensures accurate financial math using integer cents internally.
 */

/**
 * Converts a dollar value to integer cents.
 */
export const toCents = (value: number | string): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
};

/**
 * Converts integer cents back to a dollar value.
 */
export const toDollars = (cents: number): number => cents / 100;

/**
 * Safely adds monetary values avoiding floating-point errors.
 */
export const addMoney = (...values: (number | string)[]): number => {
  const totalCents = values.reduce((sum, v) => sum + toCents(v), 0);
  return toDollars(totalCents);
};

/**
 * Safely multiplies a monetary value by a numeric multiplier (e.g., quantity or tax rate).
 * Rounds to the nearest cent after multiplication.
 */
export const multiplyMoney = (value: number | string, multiplier: number | string): number => {
  const vCents = toCents(value);
  const m = typeof multiplier === 'string' ? parseFloat(multiplier) : multiplier;
  if (isNaN(m)) return 0;
  return toDollars(Math.round(vCents * m));
};

/**
 * Generic rounding utility for non-monetary values (e.g. dimensions, quantity).
 */
export const roundValue = (value: number | string, decimals: number = 2): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

/**
 * Standard USD Formatter for UI display.
 */
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatCurrency = (value: number): string => {
  return currencyFormatter.format(value);
};
