import { describe, it, expect } from 'vitest';
import { formatPrice, formatPriceNumber, parsePrice } from '../formatPrice';

describe('formatPrice', () => {
  it('should format a number as VND currency', () => {
    // Use regex to match the format (handles different space characters)
    expect(formatPrice(100000)).toMatch(/100[.,]000.*₫/);
    expect(formatPrice(1500000)).toMatch(/1[.,]500[.,]000.*₫/);
    expect(formatPrice(50000)).toMatch(/50[.,]000.*₫/);
  });

  it('should handle Decimal128 MongoDB format', () => {
    const decimal128 = { $numberDecimal: '450000' };
    expect(formatPrice(decimal128)).toMatch(/450[.,]000.*₫/);
  });

  it('should return "0₫" for null or undefined', () => {
    expect(formatPrice(null)).toMatch(/0.*₫/);
    expect(formatPrice(undefined)).toMatch(/0.*₫/);
  });

  it('should return "0₫" for NaN', () => {
    expect(formatPrice(NaN)).toMatch(/0.*₫/);
    expect(formatPrice('not a number')).toMatch(/0.*₫/);
  });

  it('should handle zero', () => {
    expect(formatPrice(0)).toMatch(/0.*₫/);
  });

  it('should handle large numbers', () => {
    expect(formatPrice(999999999)).toMatch(/999[.,]999[.,]999.*₫/);
  });
});

describe('formatPriceNumber', () => {
  it('should format number without currency symbol', () => {
    expect(formatPriceNumber(100000)).toBe('100.000');
    expect(formatPriceNumber(1500000)).toBe('1.500.000');
  });

  it('should return "0" for null or undefined', () => {
    expect(formatPriceNumber(null)).toBe('0');
    expect(formatPriceNumber(undefined)).toBe('0');
  });

  it('should handle zero', () => {
    expect(formatPriceNumber(0)).toBe('0');
  });
});

describe('parsePrice', () => {
  it('should parse formatted price string to number', () => {
    expect(parsePrice('100.000 ₫')).toBe(100000);
    expect(parsePrice('1.500.000 ₫')).toBe(1500000);
  });

  it('should handle plain numbers as strings', () => {
    expect(parsePrice('50000')).toBe(50000);
  });

  it('should return 0 for empty or null input', () => {
    expect(parsePrice('')).toBe(0);
    expect(parsePrice(null)).toBe(0);
    expect(parsePrice(undefined)).toBe(0);
  });
});
