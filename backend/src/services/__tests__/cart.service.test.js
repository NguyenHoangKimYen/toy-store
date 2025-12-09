/**
 * Cart Service Unit Tests
 * Tests cart calculation and helper functions
 */

// Mock mongoose
jest.mock('mongoose', () => ({
  Types: {
    ObjectId: class ObjectId {
      constructor(id) {
        this.id = id;
      }
      toString() {
        return this.id;
      }
    }
  }
}));

// Helper function to test (extracted from cart.service.js)
const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (value.$numberDecimal) return parseFloat(value.$numberDecimal);
  if (typeof value.toString === 'function') return parseFloat(value.toString());
  return 0;
};

describe('Cart Service Helpers', () => {
  describe('toNumber', () => {
    it('should convert regular number', () => {
      expect(toNumber(100)).toBe(100);
      expect(toNumber(99.99)).toBe(99.99);
    });

    it('should convert Decimal128 format', () => {
      expect(toNumber({ $numberDecimal: '450000' })).toBe(450000);
      expect(toNumber({ $numberDecimal: '99.50' })).toBe(99.5);
    });

    it('should return 0 for null/undefined', () => {
      expect(toNumber(null)).toBe(0);
      expect(toNumber(undefined)).toBe(0);
    });

    it('should convert object with toString', () => {
      const obj = { toString: () => '500' };
      expect(toNumber(obj)).toBe(500);
    });
  });
});

describe('Cart Calculations', () => {
  // Mock cart items
  const mockCartItems = [
    { price: { $numberDecimal: '100000' }, quantity: 2 },
    { price: { $numberDecimal: '50000' }, quantity: 3 },
    { price: 75000, quantity: 1 },
  ];

  it('should calculate total price correctly', () => {
    let totalPrice = 0;
    let totalItems = 0;

    mockCartItems.forEach((item) => {
      const price = toNumber(item.price);
      totalPrice += price * item.quantity;
      totalItems += item.quantity;
    });

    expect(totalPrice).toBe(100000 * 2 + 50000 * 3 + 75000 * 1); // 425000
    expect(totalItems).toBe(6);
  });

  it('should handle empty cart', () => {
    const emptyCart = [];
    let totalPrice = 0;
    let totalItems = 0;

    emptyCart.forEach((item) => {
      const price = toNumber(item.price);
      totalPrice += price * item.quantity;
      totalItems += item.quantity;
    });

    expect(totalPrice).toBe(0);
    expect(totalItems).toBe(0);
  });

  it('should handle cart with null prices', () => {
    const cartWithNulls = [
      { price: null, quantity: 2 },
      { price: { $numberDecimal: '100000' }, quantity: 1 },
    ];

    let totalPrice = 0;
    cartWithNulls.forEach((item) => {
      const price = toNumber(item.price);
      totalPrice += price * item.quantity;
    });

    expect(totalPrice).toBe(100000);
  });
});
