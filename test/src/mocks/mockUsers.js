// Mock user data for authentication
export const mockUsers = [
  {
    _id: 'user1',
    fullname: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    phone: '0123456789',
    password: 'password123', // In real app, this would be hashed
    role: 'customer',
    isActive: true,
    isVerified: true,
    socialProvider: null,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-11-10T14:30:00Z',
  },
  {
    _id: 'user2',
    fullname: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@example.com',
    phone: '0987654321',
    password: 'password123',
    role: 'customer',
    isActive: true,
    isVerified: true,
    socialProvider: 'google',
    createdAt: '2024-02-20T08:00:00Z',
    updatedAt: '2024-11-12T09:15:00Z',
  },
  {
    _id: 'admin1',
    fullname: 'Admin User',
    username: 'admin',
    email: 'admin@example.com',
    phone: '0111222333',
    password: 'admin123',
    role: 'admin',
    isActive: true,
    isVerified: true,
    socialProvider: null,
    createdAt: '2023-12-01T10:00:00Z',
    updatedAt: '2024-11-15T16:45:00Z',
  },
  {
    _id: 'user3',
    fullname: 'Bob Johnson',
    username: 'bobjohnson',
    email: 'bob@example.com',
    phone: '0222333444',
    password: 'password123',
    role: 'customer',
    isActive: true,
    isVerified: false,
    socialProvider: null,
    createdAt: '2024-03-10T12:00:00Z',
    updatedAt: '2024-10-20T10:00:00Z',
  },
  {
    _id: 'user4',
    fullname: 'Alice Brown',
    username: 'alicebrown',
    email: 'alice@example.com',
    phone: '0333444555',
    password: 'password123',
    role: 'customer',
    isActive: true,
    isVerified: true,
    socialProvider: 'facebook',
    createdAt: '2024-04-05T09:30:00Z',
    updatedAt: '2024-11-05T14:00:00Z',
  },
  {
    _id: 'user5',
    fullname: 'Charlie Wilson',
    username: 'charliewilson',
    email: 'charlie@example.com',
    phone: '0444555666',
    password: 'password123',
    role: 'customer',
    isActive: true,
    isVerified: false,
    socialProvider: 'google',
    createdAt: '2024-05-12T11:45:00Z',
    updatedAt: '2024-09-30T16:20:00Z',
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
