// Mock category data matching backend format
export const mockCategories = [
  {
    _id: 'cat1',
    name: 'Móc Khóa',
    slug: 'moc-khoa',
    description: 'Các loại móc khóa đa dạng và độc đáo',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    _id: 'cat2',
    name: 'Gấu Bông',
    slug: 'gau-bong',
    description: 'Gấu bông mềm mại và dễ thương',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    _id: 'cat3',
    name: 'Figures',
    slug: 'figures',
    description: 'Mô hình nhân vật và figure sưu tập',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    _id: 'cat4',
    name: 'Phụ Kiện',
    slug: 'phu-kien',
    description: 'Các loại phụ kiện đa dạng',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Helper to get category by ID (simulates populate)
export const getCategoryById = (id) => {
  return mockCategories.find(cat => cat._id === id);
};

// Helper to get multiple categories by IDs
export const getCategoriesByIds = (ids) => {
  if (!Array.isArray(ids)) return [];
  return ids.map(id => getCategoryById(id)).filter(Boolean);
};
