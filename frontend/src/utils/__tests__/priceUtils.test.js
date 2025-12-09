import { describe, it, expect } from 'vitest';
import { parsePrice, calculateTotalStock, getPriceRange } from '../priceUtils';

describe('parsePrice', () => {
  it('should parse a regular number', () => {
    expect(parsePrice(100)).toBe(100);
    expect(parsePrice(99.99)).toBe(99.99);
  });

  it('should parse Decimal128 MongoDB format', () => {
    expect(parsePrice({ $numberDecimal: '450000' })).toBe(450000);
    expect(parsePrice({ $numberDecimal: '99.50' })).toBe(99.5);
  });

  it('should parse string prices', () => {
    expect(parsePrice('100')).toBe(100);
    expect(parsePrice('50.5')).toBe(50.5);
  });

  it('should return 0 for null/undefined', () => {
    expect(parsePrice(null)).toBe(0);
    expect(parsePrice(undefined)).toBe(0);
  });

  it('should return 0 for zero', () => {
    expect(parsePrice(0)).toBe(0);
  });

  it('should return 0 for invalid objects', () => {
    expect(parsePrice({})).toBe(0);
    expect(parsePrice({ foo: 'bar' })).toBe(0);
  });
});

describe('calculateTotalStock', () => {
  it('should calculate total stock from variants', () => {
    const variants = [
      { stockQuantity: 10 },
      { stockQuantity: 20 },
      { stockQuantity: 15 },
    ];
    expect(calculateTotalStock(variants)).toBe(45);
  });

  it('should return 0 for empty array', () => {
    expect(calculateTotalStock([])).toBe(0);
  });

  it('should return 0 for null/undefined', () => {
    expect(calculateTotalStock(null)).toBe(0);
    expect(calculateTotalStock(undefined)).toBe(0);
  });

  it('should handle variants with missing stockQuantity', () => {
    const variants = [
      { stockQuantity: 10 },
      { size: 'M' }, // no stockQuantity
      { stockQuantity: 5 },
    ];
    expect(calculateTotalStock(variants)).toBe(15);
  });

  it('should return 0 for non-array input', () => {
    expect(calculateTotalStock('not an array')).toBe(0);
    expect(calculateTotalStock(123)).toBe(0);
  });
});

describe('getPriceRange', () => {
  it('should return min and max prices from variants', () => {
    const variants = [
      { price: 100000 },
      { price: 200000 },
      { price: 150000 },
    ];
    expect(getPriceRange(variants)).toEqual({
      minPrice: 100000,
      maxPrice: 200000,
    });
  });

  it('should handle Decimal128 prices', () => {
    const variants = [
      { price: { $numberDecimal: '100000' } },
      { price: { $numberDecimal: '300000' } },
    ];
    expect(getPriceRange(variants)).toEqual({
      minPrice: 100000,
      maxPrice: 300000,
    });
  });

  it('should return zeros for empty array', () => {
    expect(getPriceRange([])).toEqual({ minPrice: 0, maxPrice: 0 });
  });

  it('should return zeros for null/undefined', () => {
    expect(getPriceRange(null)).toEqual({ minPrice: 0, maxPrice: 0 });
    expect(getPriceRange(undefined)).toEqual({ minPrice: 0, maxPrice: 0 });
  });

  it('should filter out zero prices', () => {
    const variants = [
      { price: 0 },
      { price: 100000 },
      { price: 200000 },
    ];
    expect(getPriceRange(variants)).toEqual({
      minPrice: 100000,
      maxPrice: 200000,
    });
  });
});
