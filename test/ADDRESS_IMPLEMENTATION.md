# Address Management Implementation

## Overview
Complete implementation of Address functionality across the frontend, including Profile management and Checkout flow.

## Backend API Reference

### Address Model
```javascript
{
  userId: ObjectId (required) - Reference to User
  fullNameOfReceiver: String (required) - Receiver's full name
  phone: String (required) - Contact phone number
  addressLine: String (required) - Full address (verified by VietMap)
  city: String (optional) - City name
  postalCode: String (optional) - Postal/ZIP code
  lat: Number (optional) - Latitude (auto-filled by VietMap)
  lng: Number (optional) - Longitude (auto-filled by VietMap)
  isDefault: Boolean (default: false) - Default address flag
}
```

### Backend Endpoints

#### GET `/api/addresses`
- Get all addresses (admin only, with filters)
- Query params: `userId`, `page`, `limit`, `sortBy`, `sortOrder`

#### GET `/api/addresses/user/:userId`
- Get all addresses for a specific user
- Returns array of addresses

#### GET `/api/addresses/:id`
- Get a single address by ID

#### GET `/api/addresses/default/:userId`
- Get default address for a user
- Requires authentication

#### POST `/api/addresses`
- Create new address
- Body: `{ userId, fullNameOfReceiver, phone, addressLine, city?, postalCode?, isDefault? }`
- Backend automatically verifies address via VietMap API
- Returns formatted address with lat/lng coordinates

#### PUT `/api/addresses/:id`
- Update existing address
- Body: Same as create (partial updates supported)
- Backend re-verifies address if addressLine changed

#### PATCH `/api/addresses/:userId/default/:addressId`
- Set an address as default for a user
- Automatically unsets previous default address

#### DELETE `/api/addresses/:id`
- Delete an address

#### GET `/api/addresses/suggest?text=<query>`
- Get address suggestions from VietMap API
- Requires at least 2 characters
- Returns array of address suggestions for autocomplete

## Frontend Implementation

### Files Created

1. **`services/addresses.service.js`**
   - Complete API client for address operations
   - Functions: getAllAddresses, getAddressesByUserId, getAddressById, getDefaultAddress, createAddress, updateAddress, setDefaultAddress, deleteAddress, getAddressSuggestions

2. **`pages/Profile/hooks/useAddresses.js`**
   - React hook for managing addresses
   - CRUD operations with loading/error states
   - Auto-refresh after mutations
   - Toast notifications

3. **`pages/Profile/components/AddressFormModal.jsx`**
   - Modal form for creating/editing addresses
   - Dual mode: create/edit
   - Form validation (name, phone, address)
   - VietMap address autocomplete integration
   - Default address checkbox

4. **`pages/Profile/components/AddressSection.jsx`**
   - Updated to use real API data
   - Display all user addresses
   - CRUD operations (add, edit, delete, set default)
   - Empty state handling
   - Default address badge

5. **`pages/Checkout/components/AddressSelector.jsx`**
   - Address selection component for checkout
   - Radio-style selection UI
   - Auto-selects default address
   - Add new address from checkout
   - Empty state with add button

6. **`components/common/AddressAutocomplete.jsx`**
   - Autocomplete input with VietMap API integration
   - Debounced search (500ms)
   - Dropdown suggestions
   - Loading indicator
   - Click outside to close

7. **`hooks/useAuth.js`**
   - Authentication context and hook
   - User state management
   - Login/logout/updateUser functions

### Files Modified

1. **`pages/Profile/components/AddressSection.jsx`**
   - Replaced mock data with real API calls
   - Integrated useAddresses hook
   - Added AddressFormModal

2. **`pages/Checkout/components/ShippingForm.jsx`**
   - Replaced manual form fields with AddressSelector
   - Simplified to just address selection

3. **`pages/Checkout/index.jsx`**
   - Added selectedAddressId state
   - Pass addressId to order submission
   - Disable checkout if no address selected

4. **`services/index.js`**
   - Export addresses service

5. **`components/common/index.js`**
   - Export AddressAutocomplete component

## User Flows

### Profile - Manage Addresses

1. **View Addresses**
   - Navigate to Profile → Addresses tab
   - See all saved addresses
   - Default address marked with badge

2. **Add New Address**
   - Click "Add Address" button
   - Fill in receiver name, phone
   - Enter address (autocomplete suggestions appear)
   - Optionally set city, postal code
   - Check "Set as default" if desired
   - Click "Add Address"
   - Address verified by backend via VietMap
   - Success toast shown, list refreshes

3. **Edit Address**
   - Click "Edit" on address card
   - Modal opens with pre-filled data
   - Modify any field
   - Click "Save Changes"
   - Backend re-verifies if address changed
   - Success toast shown, list refreshes

4. **Delete Address**
   - Click "Delete" on address card
   - Confirmation dialog appears
   - Confirm deletion
   - Success toast shown, address removed from list

5. **Set Default Address**
   - Click "Set as Default" on address card
   - Default badge moves to selected address
   - Success toast shown

### Checkout - Select Delivery Address

1. **With Saved Addresses**
   - Default address auto-selected
   - Click any address card to select
   - Selected address highlighted with blue border
   - Can add new address from checkout

2. **Without Saved Addresses**
   - Empty state displayed
   - "Add Address" button prominent
   - Must add address before proceeding

3. **Add New Address During Checkout**
   - Click "Add New" button
   - AddressFormModal opens
   - Fill in address details
   - Newly created address auto-selected
   - Can proceed with checkout

4. **Complete Order**
   - Select address
   - Choose payment method
   - Click "Place Order"
   - Order submitted with selectedAddressId

## Form Validation

### Address Form
- **Receiver Name**: Required
- **Phone Number**: Required, 10-11 digits
- **Address Line**: Required, minimum 10 characters
- **City**: Optional
- **Postal Code**: Optional

### Backend Validation
- Address line verified via VietMap API
- Invalid addresses rejected with error message
- Lat/lng coordinates auto-populated
- Formatted address returned

## VietMap API Integration

### Address Suggestions
- Endpoint: `/api/addresses/suggest?text=<query>`
- Minimum 2 characters required
- Returns array of suggestions with:
  - `display` or `name`: Full address string
  - `address`: Additional details

### Address Verification
- Automatically called on create/update
- Backend: `verifyAddress(addressLine)`
- Returns:
  - `valid`: Boolean
  - `formatted`: Cleaned address string
  - `lat`: Latitude coordinate
  - `lng`: Longitude coordinate
- Invalid addresses prevent creation/update

## Component Props

### AddressFormModal
```javascript
{
  address: Object | null,        // Address to edit (null for create)
  isOpen: Boolean,               // Modal visibility
  onClose: Function,             // Close handler
  onSave: Function(addressData), // Save handler
  mode: 'create' | 'edit'        // Form mode
}
```

### AddressSelector
```javascript
{
  userId: String,                        // User ID
  selectedAddressId: String | null,      // Currently selected address
  onSelectAddress: Function(addressId)   // Selection handler
}
```

### AddressAutocomplete
```javascript
{
  value: String,                 // Current input value
  onChange: Function(e),         // Change handler
  placeholder: String,           // Input placeholder
  name: String,                  // Input name
  id: String                     // Input ID
}
```

## State Management

### useAddresses Hook
```javascript
const {
  addresses,           // Array of addresses
  defaultAddress,      // Default address object
  loading,             // Loading state
  error,               // Error message
  createAddress,       // Function(addressData)
  updateAddress,       // Function(addressId, addressData)
  deleteAddress,       // Function(addressId)
  setAsDefault,        // Function(addressId)
  refreshAddresses,    // Function() - manual refresh
  getAddressSuggestions // Function(text) - autocomplete
} = useAddresses(userId);
```

### useAuth Hook
```javascript
const {
  user,          // Current user object
  loading,       // Auth loading state
  login,         // Function(userData, token)
  logout,        // Function()
  updateUser     // Function(userData)
} = useAuth();
```

## Error Handling

### Frontend
- Form validation errors shown inline
- API errors displayed via toast notifications
- Loading states prevent duplicate submissions
- Empty states guide users

### Backend
- VietMap verification failures return 400 with error message
- Invalid ObjectIds return 400
- Missing addresses return 404
- Server errors return 500

## Styling

### Address Cards
- Gray border (default)
- Blue border + blue background when selected
- Default badge: green with checkmark icon
- Hover effects on buttons

### Form Modal
- Full-screen overlay
- Centered modal (max-width: 2xl)
- Scrollable content (max-height: 90vh)
- Sticky header with close button

### Empty States
- Centered icon + text
- Gray muted colors
- Clear call-to-action button

## Testing Recommendations

1. **Profile Address Management**
   - Add address with valid data
   - Add address with invalid phone number
   - Add address with short address line
   - Edit existing address
   - Delete non-default address
   - Delete default address (should work)
   - Set different address as default
   - Create address and set as default immediately

2. **Checkout Flow**
   - Checkout with default address auto-selected
   - Change selected address
   - Add new address during checkout
   - Checkout without any saved addresses
   - Complete order with selected address

3. **Autocomplete**
   - Type 1 character (no suggestions)
   - Type 2+ characters (suggestions appear)
   - Select suggestion from dropdown
   - Click outside to close
   - Loading state during fetch

4. **VietMap Integration**
   - Valid Vietnamese address
   - Invalid/malformed address
   - Address with special characters
   - Very long address line

## Future Enhancements

1. **Map Integration**
   - Display address on map using lat/lng
   - Allow pin-drop address selection
   - Show delivery area coverage

2. **Address Validation**
   - Real-time validation while typing
   - Suggest corrections for invalid addresses
   - Verify deliverability before checkout

3. **Multiple Receivers**
   - Save multiple contacts per address
   - Select receiver during checkout

4. **Address Labels**
   - Home, Work, Other labels
   - Custom icons for each type

5. **Recent Addresses**
   - Track recently used addresses
   - Quick select from history

6. **Address Templates**
   - Save partial addresses (e.g., company building)
   - Complete with unit/floor numbers

## Dependencies

- **UI Components**: Button, Input, Label, Card (shadcn/ui)
- **Icons**: lucide-react (MapPin, Plus, Edit, Trash2, CheckCircle, etc.)
- **Notifications**: sonner (toast)
- **API Client**: addresses.service.js
- **VietMap API**: Address verification and suggestions

## Notes

- Backend automatically verifies all addresses via VietMap
- Invalid addresses are rejected (cannot be created/updated)
- Lat/lng coordinates stored for future map features
- Setting new default address automatically unsets previous default
- Deleting default address does NOT auto-promote another
- Address suggestions require minimum 2 characters
- Autocomplete debounced at 500ms to reduce API calls
- All CRUD operations show toast notifications
- Empty states encourage users to add addresses
