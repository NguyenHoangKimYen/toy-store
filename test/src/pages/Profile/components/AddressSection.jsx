import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const AddressSection = () => {
  const [addresses] = useState([
    {
      _id: '1',
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      isDefault: true,
    },
    {
      _id: '2',
      street: '456 Park Avenue',
      city: 'Brooklyn',
      state: 'NY',
      zipCode: '11201',
      country: 'USA',
      isDefault: false,
    },
  ]);

  const handleAddAddress = () => {
    // TODO: Implement add address
    console.log('Add new address');
  };

  const handleEditAddress = (addressId) => {
    // TODO: Implement edit address
    console.log('Edit address:', addressId);
  };

  const handleDeleteAddress = (addressId) => {
    // TODO: Implement delete address
    console.log('Delete address:', addressId);
  };

  const handleSetDefault = (addressId) => {
    // TODO: Implement set default address
    console.log('Set default address:', addressId);
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <h3>Addresses</h3>
        <Button onClick={handleAddAddress} variant="outline">
          Add Address
        </Button>
      </div>

      <div className="address-list">
        {addresses.length === 0 ? (
          <p className="empty-state">No addresses saved yet</p>
        ) : (
          addresses.map((address) => (
            <Card key={address._id} className="address-card">
              <div className="address-content">
                <div className="address-header">
                  <div>
                    {address.isDefault && (
                      <span className="default-badge">Default</span>
                    )}
                  </div>
                  <div className="address-actions">
                    {!address.isDefault && (
                      <Button
                        onClick={() => handleSetDefault(address._id)}
                        variant="ghost"
                        size="sm"
                      >
                        Set as Default
                      </Button>
                    )}
                    <Button
                      onClick={() => handleEditAddress(address._id)}
                      variant="ghost"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteAddress(address._id)}
                      variant="ghost"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="address-details">
                  <p>{address.street}</p>
                  <p>
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p>{address.country}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AddressSection;
