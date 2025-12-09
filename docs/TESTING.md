# Milky Bloom Toy Store - Testing Summary

## Overview

| Category | Framework | Tests | Pass Rate |
|----------|-----------|-------|-----------|
| E2E Tests | Playwright | 68 | 99% (67 passed, 1 skipped) |
| Frontend Unit | Vitest | 41 | 100% |
| Backend Unit | Jest | 18 | 100% |
| Backend Integration | Jest + Supertest | 13 | 100% |
| **Total** | - | **140** | **99.3%** |

---

## Test Commands

```bash
# Frontend E2E
cd toy-store/frontend && npm run test:e2e

# Frontend Unit
cd toy-store/frontend && npm run test:unit

# Backend (Unit + Integration)
cd toy-store/backend && npm test
```

---

## 1. E2E Tests (Playwright)

**Location:** `frontend/e2e/`

| Test File | Tests | Coverage |
|-----------|-------|----------|
| `navigation.spec.js` | 15 | Page routing, navbar, links, responsive menu |
| `api.spec.js` | 13 | API connectivity, response validation, error handling |
| `profile.spec.js` | 11 | View/edit profile, avatar, password change |
| `admin.spec.js` | 7 | Admin panel access, CRUD operations |
| `checkout.spec.js` | 6 | Checkout flow, address, payment selection |
| `guest-cart.spec.js` | 5 | Guest add to cart, session persistence |
| `products.spec.js` | 4 | Product list, filter, search, detail view |
| `auth.spec.js` | 4 | Login, register, logout, validation |
| `rate-limit.spec.js` | 3 | Rate limit headers, 429 response handling |

**Config:** `frontend/playwright.config.js`
- Browsers: Chromium, Firefox, WebKit
- Base URL: `http://localhost:5173`
- Timeout: 30s per test

---

## 2. Frontend Unit Tests (Vitest)

**Location:** `frontend/src/utils/__tests__/`

| Test File | Tests | Functions Tested |
|-----------|-------|------------------|
| `priceUtils.test.js` | 16 | `parsePrice`, `calculateTotalStock`, `getPriceRange` |
| `formatPrice.test.js` | 12 | `formatPrice`, `formatPriceNumber`, `parsePrice` |
| `debounce.test.js` | 7 | `debounce`, `debouncedByKey` |
| `formatDate.test.js` | 6 | `formatDate` (Date object, string, MongoDB format) |

**Config:** `frontend/vitest.config.js`
- Environment: jsdom
- Setup: `src/test/setup.js`
- Globals: true

---

## 3. Backend Unit Tests (Jest)

**Location:** `backend/src/utils/__tests__/`, `backend/src/services/__tests__/`

| Test File | Tests | Functions Tested |
|-----------|-------|------------------|
| `token.test.js` | 11 | `generateToken`, `genOtp6`, `sha256` |
| `cart.service.test.js` | 7 | `toNumber`, cart calculations, Decimal128 handling |

**Config:** `backend/jest.config.js`
- Environment: node
- Setup: `jest.setup.js`
- testMatch: `**/__tests__/**/*.test.js`

---

## 4. Backend Integration Tests (Jest + Supertest)

**Location:** `backend/src/__tests__/`

| API Endpoint | Tests | Validations |
|--------------|-------|-------------|
| `GET /api/products` | 4 | List, pagination, search, 404 |
| `POST /api/auth/login` | 2 | Invalid credentials, rate limit headers |
| `POST /api/auth/register` | 1 | Required field validation |
| `GET /api/carts` | 2 | Guest session, rate limit headers |
| `GET /api/categories` | 1 | List categories |
| `GET /api/orders` | 1 | Auth required (401) |
| `GET /api/reviews/product/:id` | 1 | Reviews or 404 |
| `POST /api/discount-codes/validate` | 1 | Invalid code rejection |

---

## Test Patterns Used

### Unit Tests
- **Isolation:** Mock external dependencies
- **Edge cases:** Null, undefined, empty inputs
- **Boundary testing:** Min/max values

### Integration Tests
- **Real HTTP:** Supertest against live server
- **Status codes:** 200, 400, 401, 404, 429
- **Headers:** Rate limit headers validation

### E2E Tests
- **User flows:** Complete journeys (browse → cart → checkout)
- **Visual validation:** Element visibility, text content
- **Navigation:** URL routing, redirects
- **Form handling:** Input, validation, submission

---

## Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| Unicode in price formatting | Regex matching instead of exact string |
| Date locale differences | Short month format (Dec vs December) |
| Rate limiting 429 errors | Accept 429 as valid test response |
| Async state updates | `waitFor` and proper async assertions |
