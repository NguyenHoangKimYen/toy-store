// Mock user data for authentication
export const mockUsers = [
  {
    _id: 'user1',
    fullname: 'John Doe',
    email: 'john@example.com',
    phone: '0123456789',
    password: 'password123', // In real app, this would be hashed
    role: 'customer',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-11-10T14:30:00Z',
  },
  {
    _id: 'user2',
    fullname: 'Jane Smith',
    email: 'jane@example.com',
    phone: '0987654321',
    password: 'password123',
    role: 'customer',
    isActive: true,
    createdAt: '2024-02-20T08:00:00Z',
    updatedAt: '2024-11-12T09:15:00Z',
  },
  {
    _id: 'admin1',
    fullname: 'Admin User',
    email: 'admin@example.com',
    phone: '0111222333',
    password: 'admin123',
    role: 'admin',
    isActive: true,
    createdAt: '2023-12-01T10:00:00Z',
    updatedAt: '2024-11-15T16:45:00Z',
  },
];

// Helper function to find user by email
export const findUserByEmail = (email) => {
  return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
};

// Helper function to find user by id
export const findUserById = (id) => {
  return mockUsers.find(user => user._id === id);
};

// Helper function to validate credentials
export const validateCredentials = (email, password) => {
  const user = findUserByEmail(email);
  if (!user) {
    return { valid: false, error: 'User not found' };
  }
  if (!user.isActive) {
    return { valid: false, error: 'Account is inactive' };
  }
  if (user.password !== password) {
    return { valid: false, error: 'Invalid password' };
  }
  return { valid: true, user };
};

// Helper function to check if email exists
export const emailExists = (email) => {
  return mockUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
};

// Helper function to add new user
export const addUser = (userData) => {
  const newUser = {
    _id: `user${mockUsers.length + 1}`,
    fullname: userData.fullname,
    email: userData.email,
    phone: userData.phone,
    password: userData.password,
    role: 'customer',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockUsers.push(newUser);
  return newUser;
};
