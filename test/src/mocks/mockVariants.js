import { productImages } from '../assets/assets';

// Mock variants data - matches Variant schema
export const mockVariants = [
  // Variants for Product 1 - Premium Keychain Set
  {
    _id: 'var1-1',
    productId: '1',
    sku: 'KEY-001-SM-SLV',
    attributes: [
      { name: 'Material', value: 'Metal' },
      { name: 'Color', value: 'Silver' },
    ],
    price: { $numberDecimal: '625000' },
    stockQuantity: 45,
    weight: 50,
    imageUrls: [productImages.plush1],
    unitsSold: 120,
    isActive: true,
    createdAt: '2024-10-15T10:00:00Z',
    updatedAt: '2024-11-10T15:30:00Z',
  },
  {
    _id: 'var1-2',
    productId: '1',
    sku: 'KEY-001-SM-GLD',
    attributes: [
      { name: 'Material', value: 'Metal' },
      { name: 'Color', value: 'Gold' },
    ],
    price: { $numberDecimal: '750000' },
    stockQuantity: 32,
    weight: 50,
    imageUrls: [productImages.plush1],
    unitsSold: 85,
    isActive: true,
    createdAt: '2024-10-15T10:00:00Z',
    updatedAt: '2024-11-10T15:30:00Z',
  },
  {
    _id: 'var1-3',
    productId: '1',
    sku: 'KEY-001-LTH-BLK',
    attributes: [
      { name: 'Material', value: 'Leather' },
      { name: 'Color', value: 'Black' },
    ],
    price: { $numberDecimal: '650000' },
    stockQuantity: 28,
    weight: 40,
    imageUrls: [productImages.plush1],
    unitsSold: 40,
    isActive: true,
    createdAt: '2024-10-15T10:00:00Z',
    updatedAt: '2024-11-10T15:30:00Z',
  },

  // Variants for Product 2 - Cute Plush Bear
  {
    _id: 'var2-1',
    productId: '2',
    sku: 'PLUSH-002-M-BRN',
    attributes: [
      { name: 'Size', value: 'Medium' },
      { name: 'Color', value: 'Brown' },
    ],
    price: { $numberDecimal: '1150000' },
    stockQuantity: 55,
    weight: 500,
    imageUrls: [productImages.plush2],
    unitsSold: 95,
    isActive: true,
    createdAt: '2024-09-20T14:30:00Z',
    updatedAt: '2024-11-12T09:15:00Z',
  },
  {
    _id: 'var2-2',
    productId: '2',
    sku: 'PLUSH-002-M-PNK',
    attributes: [
      { name: 'Size', value: 'Medium' },
      { name: 'Color', value: 'Pink' },
    ],
    price: { $numberDecimal: '1150000' },
    stockQuantity: 42,
    weight: 500,
    imageUrls: [productImages.plush2],
    unitsSold: 94,
    isActive: true,
    createdAt: '2024-09-20T14:30:00Z',
    updatedAt: '2024-11-12T09:15:00Z',
  },

  // Variants for Product 3 - Anime Figure
  {
    _id: 'var3-1',
    productId: '3',
    sku: 'FIG-003-15-LE',
    attributes: [
      { name: 'Height', value: '15cm' },
      { name: 'Series', value: 'Limited Edition' },
    ],
    price: { $numberDecimal: '2250000' },
    stockQuantity: 18,
    weight: 350,
    imageUrls: [productImages.plush3],
    unitsSold: 182,
    isActive: true,
    createdAt: '2024-11-01T08:00:00Z',
    updatedAt: '2024-11-14T16:45:00Z',
  },
  {
    _id: 'var3-2',
    productId: '3',
    sku: 'FIG-003-15-STD',
    attributes: [
      { name: 'Height', value: '15cm' },
      { name: 'Series', value: 'Standard' },
    ],
    price: { $numberDecimal: '1950000' },
    stockQuantity: 35,
    weight: 350,
    imageUrls: [productImages.plush3],
    unitsSold: 130,
    isActive: true,
    createdAt: '2024-11-01T08:00:00Z',
    updatedAt: '2024-11-14T16:45:00Z',
  },

  // Variants for Product 4 - Phone Accessories
  {
    _id: 'var4-1',
    productId: '4',
    sku: 'ACC-004-IPH-CLR',
    attributes: [
      { name: 'Compatible', value: 'iPhone' },
      { name: 'Color', value: 'Clear' },
    ],
    price: { $numberDecimal: '625000' },
    stockQuantity: 68,
    weight: 100,
    imageUrls: [productImages.plush4],
    unitsSold: 245,
    isActive: true,
    createdAt: '2024-08-10T12:00:00Z',
    updatedAt: '2024-11-13T11:20:00Z',
  },
  {
    _id: 'var4-2',
    productId: '4',
    sku: 'ACC-004-SAM-BLK',
    attributes: [
      { name: 'Compatible', value: 'Samsung' },
      { name: 'Color', value: 'Black' },
    ],
    price: { $numberDecimal: '625000' },
    stockQuantity: 52,
    weight: 100,
    imageUrls: [productImages.plush4],
    unitsSold: 233,
    isActive: true,
    createdAt: '2024-08-10T12:00:00Z',
    updatedAt: '2024-11-13T11:20:00Z',
  },

  // Variants for Product 5 - Lucky Cat Keychain
  {
    _id: 'var5-1',
    productId: '5',
    sku: 'KEY-005-WHT-S',
    attributes: [
      { name: 'Color', value: 'White' },
      { name: 'Size', value: 'Small' },
    ],
    price: { $numberDecimal: '500000' },
    stockQuantity: 125,
    weight: 45,
    imageUrls: [productImages.plush5],
    unitsSold: 312,
    isActive: true,
    createdAt: '2024-07-05T09:00:00Z',
    updatedAt: '2024-11-15T14:00:00Z',
  },
  {
    _id: 'var5-2',
    productId: '5',
    sku: 'KEY-005-GLD-M',
    attributes: [
      { name: 'Color', value: 'Gold' },
      { name: 'Size', value: 'Medium' },
    ],
    price: { $numberDecimal: '650000' },
    stockQuantity: 88,
    weight: 60,
    imageUrls: [productImages.plush5],
    unitsSold: 278,
    isActive: true,
    createdAt: '2024-07-05T09:00:00Z',
    updatedAt: '2024-11-15T14:00:00Z',
  },

  // Variants for Product 6 - Sparkle Accessories
  {
    _id: 'var6-1',
    productId: '6',
    sku: 'ACC-006-SLV-STD',
    attributes: [
      { name: 'Material', value: 'Silver Plated' },
      { name: 'Type', value: 'Bracelet' },
    ],
    price: { $numberDecimal: '875000' },
    stockQuantity: 45,
    weight: 80,
    imageUrls: [productImages.plush1],
    unitsSold: 156,
    isActive: true,
    createdAt: '2024-06-12T13:00:00Z',
    updatedAt: '2024-11-11T10:30:00Z',
  },
  {
    _id: 'var6-2',
    productId: '6',
    sku: 'ACC-006-GLD-NKLS',
    attributes: [
      { name: 'Material', value: 'Gold Plated' },
      { name: 'Type', value: 'Necklace' },
    ],
    price: { $numberDecimal: '1125000' },
    stockQuantity: 32,
    weight: 65,
    imageUrls: [productImages.plush1],
    unitsSold: 134,
    isActive: true,
    createdAt: '2024-06-12T13:00:00Z',
    updatedAt: '2024-11-11T10:30:00Z',
  },

  // Variants for Product 7 - Mini Plush Collection
  {
    _id: 'var7-1',
    productId: '7',
    sku: 'PLUSH-007-S-DOG',
    attributes: [
      { name: 'Size', value: 'Small' },
      { name: 'Animal', value: 'Dog' },
    ],
    price: { $numberDecimal: '375000' },
    stockQuantity: 95,
    weight: 150,
    imageUrls: [productImages.plush2],
    unitsSold: 445,
    isActive: true,
    createdAt: '2024-05-18T11:00:00Z',
    updatedAt: '2024-11-14T13:45:00Z',
  },
  {
    _id: 'var7-2',
    productId: '7',
    sku: 'PLUSH-007-S-CAT',
    attributes: [
      { name: 'Size', value: 'Small' },
      { name: 'Animal', value: 'Cat' },
    ],
    price: { $numberDecimal: '375000' },
    stockQuantity: 87,
    weight: 150,
    imageUrls: [productImages.plush2],
    unitsSold: 423,
    isActive: true,
    createdAt: '2024-05-18T11:00:00Z',
    updatedAt: '2024-11-14T13:45:00Z',
  },
  {
    _id: 'var7-3',
    productId: '7',
    sku: 'PLUSH-007-S-BNY',
    attributes: [
      { name: 'Size', value: 'Small' },
      { name: 'Animal', value: 'Bunny' },
    ],
    price: { $numberDecimal: '375000' },
    stockQuantity: 72,
    weight: 150,
    imageUrls: [productImages.plush2],
    unitsSold: 389,
    isActive: true,
    createdAt: '2024-05-18T11:00:00Z',
    updatedAt: '2024-11-14T13:45:00Z',
  },

  // Variants for Product 8 - LED Light Keychain
  {
    _id: 'var8-1',
    productId: '8',
    sku: 'KEY-008-BLU-LED',
    attributes: [
      { name: 'Color', value: 'Blue' },
      { name: 'Light Type', value: 'LED' },
    ],
    price: { $numberDecimal: '425000' },
    stockQuantity: 0,
    weight: 55,
    imageUrls: [productImages.plush4],
    unitsSold: 267,
    isActive: true,
    createdAt: '2024-04-22T10:00:00Z',
    updatedAt: '2024-11-10T09:00:00Z',
  },
  {
    _id: 'var8-2',
    productId: '8',
    sku: 'KEY-008-RED-LED',
    attributes: [
      { name: 'Color', value: 'Red' },
      { name: 'Light Type', value: 'LED' },
    ],
    price: { $numberDecimal: '425000' },
    stockQuantity: 38,
    weight: 55,
    imageUrls: [productImages.plush4],
    unitsSold: 201,
    isActive: true,
    createdAt: '2024-04-22T10:00:00Z',
    updatedAt: '2024-11-10T09:00:00Z',
  },
];

// Helper function to get variants for a specific product
export const getVariantsByProductId = (productId) => {
  return mockVariants.filter(variant => variant.productId === productId);
};

// Helper function to get a specific variant
export const getVariantById = (variantId) => {
  return mockVariants.find(variant => variant._id === variantId);
};

// Helper function to calculate total stock for a product
export const getTotalStockForProduct = (productId) => {
  const variants = getVariantsByProductId(productId);
  return variants.reduce((total, variant) => total + variant.stockQuantity, 0);
};

// Helper function to check if product has any stock
export const hasStock = (productId) => {
  return getTotalStockForProduct(productId) > 0;
};
