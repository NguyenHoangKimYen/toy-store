# Address Feature Implementation Summary

## Overview
Completed full implementation of address management features in the frontend, matching the backend API structure.

## Backend API Structure
All endpoints return standardized response format:
```javascript
{
  success: boolean,
  data: object | array,
  message?: string
}
```

## Frontend Components Updated

### 1. **useAddresses Hook** (`src/pages/Profile/hooks/useAddresses.js`)
- **Updated Methods:**
  - `fetchAddresses()`: Extracts addresses from `response.data`
  - `createAddress()`: Returns created address object from `response.data`
  - `updateAddress()`: Returns updated address object from `response.data`
  - `deleteAddress()`: Handles backend response structure
  - `setAsDefault()`: Updates default address via backend
  - `getAddressSuggestions()`: Returns VietMap suggestions from `response.data`

- **Error Handling:**
  - Uses `err.response?.data?.message` for error messages
  - Consistent toast notifications for all operations

### 2. **AddressAutocomplete Component** (`src/components/common/AddressAutocomplete.jsx`)
- **Fixed for VietMap API format:**
  - Backend returns: `{ name, address, lat, lng }`
  - Displays `suggestion.name` as primary text
  - Shows `suggestion.address` as secondary text
- **Added:** LoadingSpinner import for loading state

### 3. **AddressSelector Component** (`src/pages/Checkout/components/AddressSelector.jsx`)
- **Fixed Response Handling:**
  - Changed from `newAddress.data._id` to `newAddress._id`
  - Matches updated useAddresses hook return format

### 4. **Existing Components** (No changes needed)
- `AddressFormModal.jsx`: Form fields match backend model
- `AddressSection.jsx`: Properly uses useAddresses hook
- All order-related components already use `addressId` populated object

## Backend Integration

### Address Model Fields
```javascript
{
  userId: ObjectId,           // Reference to User
  fullNameOfReceiver: String, // Required
  phone: String,              // Required
  addressLine: String,        // Required, validated by VietMap
  city: String,               // Optional
  postalCode: String,         // Optional
  lat: Number,                // From VietMap
  lng: Number,                // From VietMap
  isDefault: Boolean          // Default address flag
}
```

### VietMap API Integration
- **Verification:** Validates addresses during create/update
- **Suggestions:** Provides autocomplete with formatted addresses
- **Format:** Returns `{ name, address, lat, lng }` for suggestions

## API Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/addresses/user/:userId` | Get all addresses for user |
| POST | `/addresses` | Create new address |
| PUT | `/addresses/:id` | Update existing address |
| DELETE | `/addresses/:id` | Delete address |
| PATCH | `/addresses/:userId/default/:addressId` | Set default address |
| GET | `/addresses/suggest?text=` | Get address suggestions |

## Features Implemented

### Address Management
- ✅ List all user addresses
- ✅ Create new address with VietMap validation
- ✅ Edit existing addresses
- ✅ Delete addresses
- ✅ Set default address
- ✅ Address autocomplete with VietMap suggestions

### Integration Points
- ✅ Checkout process (AddressSelector)
- ✅ User profile (AddressSection)
- ✅ Order details (displays populated addressId)
- ✅ Order history (shows delivery address)
- ✅ Admin panel orders (shows order addresses)

## Commits Made

1. `feat: update useAddresses hook to handle backend response structure`
   - Updated all useAddresses methods
   - Fixed AddressAutocomplete component
   - Added proper error handling

2. `fix: update AddressSelector to handle backend response format correctly`
   - Fixed newAddress response extraction
   - Ensures proper address selection after creation

## Testing Checklist

### Address CRUD Operations
- [ ] Create new address with autocomplete
- [ ] Edit existing address
- [ ] Delete address
- [ ] Set address as default
- [ ] View all addresses in profile

### Checkout Flow
- [ ] Select existing address
- [ ] Create new address during checkout
- [ ] Auto-select default address
- [ ] Complete order with selected address

### VietMap Integration
- [ ] Autocomplete shows suggestions
- [ ] Selected suggestion populates form
- [ ] Address validation on create
- [ ] Coordinates saved with address

### Error Handling
- [ ] Invalid address shows error
- [ ] Network errors display properly
- [ ] Toast notifications work
- [ ] Loading states display correctly

## Notes

- Backend automatically verifies addresses using VietMap API on create/update
- Default address logic managed in backend (updates user's `defaultAddressId`)
- All address operations require authentication
- Coordinates (lat/lng) automatically populated by VietMap
- Address format standardized by VietMap helper

## Dependencies

- **Frontend:**
  - `@/services/addresses.service.js`: API client
  - `@/components/common/AddressAutocomplete.jsx`: Autocomplete component
  - `@/components/ui/*`: UI components (Button, Card, Input, Label)
  - `sonner`: Toast notifications
  - `lucide-react`: Icons

- **Backend:**
  - VietMap API for address validation
  - MongoDB for storage
  - Mongoose for data modeling
