// Mock reviews data matching Review schema
export const MOCK_REVIEWS = [
  // Reviews for Product 1 - Premium Keychain Set
  {
    _id: 'review-001',
    productId: '1',
    userId: 'user-001',
    userName: 'Sarah Johnson',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    content: 'Absolutely love this keychain set! The quality is outstanding and the design is so elegant. The metal feels sturdy and the leather accents add a premium touch. Worth every penny!',
    rating: 5,
    createdAt: new Date('2024-10-15').toISOString(),
  },
  {
    _id: 'review-002',
    productId: '1',
    userId: 'user-002',
    userName: 'Michael Chen',
    userAvatar: 'https://i.pravatar.cc/150?img=12',
    content: 'Great product overall. The craftsmanship is impressive, though I wish there were more color options available. Still very happy with my purchase.',
    rating: 4,
    createdAt: new Date('2024-10-20').toISOString(),
  },
  {
    _id: 'review-003',
    productId: '1',
    userId: null,
    userName: 'Anonymous',
    userAvatar: null,
    content: 'Perfect gift for my friend! She loved it. The packaging was also very nice.',
    rating: 5,
    createdAt: new Date('2024-11-01').toISOString(),
  },

  // Reviews for Product 2 - Cute Plush Bear
  {
    _id: 'review-004',
    productId: '2',
    userId: 'user-003',
    userName: 'Emily Rodriguez',
    userAvatar: 'https://i.pravatar.cc/150?img=5',
    content: 'This plush bear is incredibly soft and well-made! My daughter sleeps with it every night. The stitching is solid and it has held up perfectly after multiple washes.',
    rating: 5,
    createdAt: new Date('2024-09-25').toISOString(),
  },
  {
    _id: 'review-005',
    productId: '2',
    userId: 'user-004',
    userName: 'David Kim',
    userAvatar: 'https://i.pravatar.cc/150?img=14',
    content: 'Really cute and cuddly! Great quality for the price. Only giving 4 stars because I wish it came in a larger size option.',
    rating: 4,
    createdAt: new Date('2024-10-05').toISOString(),
  },
  {
    _id: 'review-006',
    productId: '2',
    userId: 'user-005',
    userName: 'Jessica Lee',
    userAvatar: 'https://i.pravatar.cc/150?img=9',
    content: 'Bought this as a gift and the recipient absolutely loved it! Super soft and adorable. Highly recommend!',
    rating: 5,
    createdAt: new Date('2024-11-10').toISOString(),
  },

  // Reviews for Product 3 - Anime Figure
  {
    _id: 'review-007',
    productId: '3',
    userId: 'user-006',
    userName: 'Alex Martinez',
    userAvatar: 'https://i.pravatar.cc/150?img=13',
    content: 'Amazing detail on this figure! The paint job is flawless and the pose is dynamic. A must-have for any collector. Shipped carefully with excellent packaging.',
    rating: 5,
    createdAt: new Date('2024-10-12').toISOString(),
  },
  {
    _id: 'review-008',
    productId: '3',
    userId: 'user-007',
    userName: 'Ryan Cooper',
    userAvatar: 'https://i.pravatar.cc/150?img=8',
    content: 'Great figure but slightly pricey. The quality justifies the cost though. Very happy with this addition to my collection.',
    rating: 4,
    createdAt: new Date('2024-10-28').toISOString(),
  },

  // Reviews for Product 4
  {
    _id: 'review-009',
    productId: '4',
    userId: 'user-008',
    userName: 'Sophia Anderson',
    userAvatar: 'https://i.pravatar.cc/150?img=10',
    content: 'Exactly what I was looking for! The quality exceeded my expectations. Will definitely buy again.',
    rating: 5,
    createdAt: new Date('2024-11-05').toISOString(),
  },
  {
    _id: 'review-010',
    productId: '4',
    userId: 'user-009',
    userName: 'James Wilson',
    userAvatar: 'https://i.pravatar.cc/150?img=11',
    content: 'Good product, fast shipping. No complaints!',
    rating: 4,
    createdAt: new Date('2024-11-08').toISOString(),
  },

  // Reviews for Product 5
  {
    _id: 'review-011',
    productId: '5',
    userId: 'user-010',
    userName: 'Olivia Brown',
    userAvatar: 'https://i.pravatar.cc/150?img=16',
    content: 'Love it! Exactly as described. The colors are vibrant and it looks great on my desk.',
    rating: 5,
    createdAt: new Date('2024-10-18').toISOString(),
  },

  // Reviews for Product 6
  {
    _id: 'review-012',
    productId: '6',
    userId: 'user-011',
    userName: 'Ethan Taylor',
    userAvatar: 'https://i.pravatar.cc/150?img=15',
    content: 'Pretty good quality. Not perfect but definitely worth the price. Would recommend to friends.',
    rating: 4,
    createdAt: new Date('2024-10-22').toISOString(),
  },
  {
    _id: 'review-013',
    productId: '6',
    userId: null,
    userName: 'Guest User',
    userAvatar: null,
    content: 'Nice product! Arrived on time and in perfect condition.',
    rating: 5,
    createdAt: new Date('2024-11-02').toISOString(),
  },

  // Reviews for Product 7
  {
    _id: 'review-014',
    productId: '7',
    userId: 'user-012',
    userName: 'Ava Martinez',
    userAvatar: 'https://i.pravatar.cc/150?img=20',
    content: 'Absolutely adorable! The details are incredible and it\'s so well made. My favorite purchase this year!',
    rating: 5,
    createdAt: new Date('2024-09-30').toISOString(),
  },

  // Reviews for Product 8
  {
    _id: 'review-015',
    productId: '8',
    userId: 'user-013',
    userName: 'William Davis',
    userAvatar: 'https://i.pravatar.cc/150?img=18',
    content: 'Great value for money. Quality is solid and shipping was quick. Happy customer!',
    rating: 4,
    createdAt: new Date('2024-11-07').toISOString(),
  },

  // Reviews for Product 9
  {
    _id: 'review-016',
    productId: '9',
    userId: 'user-014',
    userName: 'Isabella Garcia',
    userAvatar: 'https://i.pravatar.cc/150?img=25',
    content: 'Beautiful craftsmanship! This exceeded all my expectations. The attention to detail is remarkable.',
    rating: 5,
    createdAt: new Date('2024-10-25').toISOString(),
  },
  {
    _id: 'review-017',
    productId: '9',
    userId: 'user-015',
    userName: 'Noah Johnson',
    userAvatar: 'https://i.pravatar.cc/150?img=33',
    content: 'Good product but took a while to arrive. Quality is nice though, so worth the wait.',
    rating: 4,
    createdAt: new Date('2024-11-09').toISOString(),
  },

  // Reviews for Product 10
  {
    _id: 'review-018',
    productId: '10',
    userId: 'user-016',
    userName: 'Mia Thompson',
    userAvatar: 'https://i.pravatar.cc/150?img=21',
    content: 'Perfect! Exactly what I wanted. The quality is top-notch and it looks amazing!',
    rating: 5,
    createdAt: new Date('2024-11-03').toISOString(),
  },
];

// Export as mockReviews for backward compatibility
export const mockReviews = MOCK_REVIEWS;

// Helper function to get reviews by product ID
export const getReviewsByProductId = (productId) => {
  return MOCK_REVIEWS.filter(review => review.productId === productId);
};

// Helper function to calculate average rating for a product
export const calculateAverageRating = (productId) => {
  const reviews = getReviewsByProductId(productId);
  if (reviews.length === 0) return 0;
  
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.length).toFixed(1);
};

// Helper function to get review count for a product
export const getReviewCount = (productId) => {
  return getReviewsByProductId(productId).length;
};
