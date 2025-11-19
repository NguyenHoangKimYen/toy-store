export * from './products.service';
export * from './users.service';
export * from './orders.service';
export * from './cart.service';
export * from './reviews.service';
export * from './discountCodes.service';
export * from './categories.service';
export * from './addresses.service';
export * from './config';
export * from '../utils/apiHelpers';
export * from '../utils/authHelpers';

// Organize by module
import * as productsService from './products.service';
import * as usersService from './users.service';
import * as ordersService from './orders.service';
import * as cartService from './cart.service';
import * as reviewsService from './reviews.service';
import * as discountCodesService from './discountCodes.service';
import * as categoriesService from './categories.service';
import * as addressesService from './addresses.service';

export default {
  products: productsService,
  users: usersService,
  orders: ordersService,
  cart: cartService,
  reviews: reviewsService,
  discountCodes: discountCodesService,
  categories: categoriesService,
  addresses: addressesService,
};
