# Milky Bloom Toy Store - Features Summary

## Tech Stack
- **Frontend:** React 18 + Vite, React Router v6, TailwindCSS, Sonner (toast)
- **Backend:** Node.js + Express.js, MongoDB + Mongoose
- **Payment:** ZaloPay, MoMo, VietQR
- **Real-time:** Socket.IO
- **Auth:** JWT, Google OAuth 2.0

---

## 1. Authentication & User Management

| Feature | Tech/Logic |
|---------|------------|
| Login/Register | JWT token, bcrypt password hashing |
| Google OAuth | Passport.js, OAuth 2.0 redirect flow |
| Token refresh | Auto-refresh on 401, localStorage persistence |
| Role-based access | `user`, `admin` roles in JWT payload |
| Profile management | CRUD user info, avatar upload |

---

## 2. Product Management

| Feature | Tech/Logic |
|---------|------------|
| Product listing | Pagination, MongoDB aggregation |
| Search | Text index search, regex matching |
| Filter by category | Query params, category ObjectId lookup |
| Sort (price, date) | MongoDB sort pipeline |
| Product variants | Nested schema (size, color, stock, price) |
| Image gallery | Multiple imageUrls array, lazy loading |
| Stock tracking | Per-variant stock, auto-decrement on order |

---

## 3. Shopping Cart

| Feature | Tech/Logic |
|---------|------------|
| Guest cart | Session-based (`x-guest-session-id` header) |
| User cart | userId reference, merge on login |
| Add/Remove items | Optimistic UI update, debounced API sync |
| Quantity update | 150ms debounce, server reconciliation |
| Cross-tab sync | BroadcastChannel API |
| Cart persistence | MongoDB cart collection |

---

## 4. Checkout & Orders

| Feature | Tech/Logic |
|---------|------------|
| Address management | CRUD addresses, default address flag |
| Shipping calculation | Base fee + distance + region + weather fee |
| Weather-based pricing | OpenWeatherMap API integration |
| Discount codes | Percentage/fixed, min order, usage limits |
| Loyalty points | Earn on purchase, redeem as discount |
| Order creation | Transaction-based, stock validation |
| Order history | User-filtered queries, status timeline |
| Guest checkout | Session-based order creation |

---

## 5. Payment Integration

| Feature | Tech/Logic |
|---------|------------|
| ZaloPay | REST API, HMAC-SHA256 signature, callback/IPN |
| MoMo | REST API, RSA signature, redirect flow |
| VietQR | QR code generation, manual confirmation |
| COD | Cash on delivery, auto-confirm |
| Payment retry | Re-generate payment link for pending orders |
| Payment status | Webhook callbacks, polling fallback |

---

## 6. Reviews & Ratings

| Feature | Tech/Logic |
|---------|------------|
| Product reviews | Star rating (1-5), text comment |
| Review filtering | By rating, verified purchase |
| Review polling | 30s interval polling for new reviews |
| Admin moderation | Approve/reject reviews |

---

## 7. Admin Panel

| Feature | Tech/Logic |
|---------|------------|
| Dashboard | Aggregation queries, revenue stats |
| Product CRUD | Form validation, image upload |
| Category CRUD | Slug generation, nested categories |
| Order management | Status update, timeline history |
| User management | Role assignment, ban/unban |
| Discount management | Create/edit/delete codes |
| VietQR verification | Manual payment confirmation |

---

## 8. Real-time Features

| Feature | Tech/Logic |
|---------|------------|
| Stock updates | Socket.IO broadcast on purchase |
| Order notifications | Socket event to admin on new order |
| Review updates | Socket broadcast on new review |

---

## 9. Security & Performance

| Feature | Tech/Logic |
|---------|------------|
| Rate limiting | express-rate-limit, per-IP/per-user |
| CORS | Whitelist origins, credentials support |
| Input validation | Joi/express-validator |
| XSS protection | Helmet.js middleware |
| Request timeout | 15s timeout, AbortController |
| API caching | In-memory cache for categories (5min TTL) |
| Error handling | Global error handler, structured responses |

---

## 10. UI/UX Features

| Feature | Tech/Logic |
|---------|------------|
| Responsive design | TailwindCSS breakpoints, mobile menu |
| Loading states | Skeleton loaders, spinners |
| Toast notifications | Sonner library |
| Image lazy loading | `loading="lazy"` attribute |
| Scroll behavior | Hide/show navbar on scroll |
| Error boundaries | React ErrorBoundary component |
