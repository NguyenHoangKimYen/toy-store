export * from './products.service';
export * from './users.service';
export * from './orders.service';
export * from './config';
export * from '../utils/apiHelpers';
export * from './utils/authHelpers';

// Organize by module
import * as productsService from './products.service';
import * as usersService from './users.service';
import * as ordersService from './orders.service';

export default {
  products: productsService,
  users: usersService,
  orders: ordersService,
};
