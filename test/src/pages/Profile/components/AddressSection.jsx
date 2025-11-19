import { useState } from 'react';
import { MapPin, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAddresses } from '../hooks/useAddresses';
import AddressFormModal from './AddressFormModal';
import { LoadingSpinner } from '@/components/common';

const AddressSection = ({ user }) => {
  const {
    addresses,
    loading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    setAsDefault,
  } = useAddresses(user?._id);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [formMode, setFormMode] = useState('create');

  const handleAddAddress = () => {
    setSelectedAddress(null);
    setFormMode('create');
    setIsFormModalOpen(true);
  };

  const handleEditAddress = (address) => {
    setSelectedAddress(address);
    setFormMode('edit');
    setIsFormModalOpen(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      await deleteAddress(addressId);
    }
  };

  const handleSetDefault = async (addressId) => {
    await setAsDefault(addressId);
  };

  const handleSaveAddress = async (addressData) => {
    if (formMode === 'create') {
      await createAddress(addressData);
    } else {
      await updateAddress(selectedAddress._id, addressData);
    }
  };

  if (loading) {
    return (
      <div className="profile-section">
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-section">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <div className="section-header">
        <h3>Delivery Addresses</h3>
        <Button onClick={handleAddAddress} className='bg-blue-600 hover:bg-blue-700'>
          <Plus className='w-4 h-4 mr-2' />
          Add Address
        </Button>
      </div>

      <div className="address-list space-y-4">
        {addresses.length === 0 ? (
          <Card className='p-8 text-center'>
            <MapPin className='w-12 h-12 mx-auto text-gray-400 mb-4' />
            <p className='text-gray-600 dark:text-gray-400 mb-2'>No addresses saved yet</p>
            <p className='text-sm text-gray-500 dark:text-gray-500 mb-4'>
              Add your first delivery address to make checkout faster
            </p>
            <Button onClick={handleAddAddress} variant='outline'>
              <Plus className='w-4 h-4 mr-2' />
              Add Your First Address
            </Button>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card key={address._id} className='p-4'>
              <div className='flex justify-between items-start gap-4'>
                {/* Address Content */}
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-2'>
                    <h4 className='font-semibold text-gray-900 dark:text-white'>
                      {address.fullNameOfReceiver}
                    </h4>
                    {address.isDefault && (
                      <span className='inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full dark:bg-green-900 dark:text-green-200'>
                        <CheckCircle className='w-3 h-3' />
                        Default
                      </span>
                    )}
                  </div>
                  <p className='text-sm text-gray-600 dark:text-gray-400 mb-1'>
                    {address.phone}
                  </p>
                  <p className='text-sm text-gray-700 dark:text-gray-300'>
                    {address.addressLine}
                  </p>
                  {address.city && (
                    <p className='text-sm text-gray-600 dark:text-gray-400'>
                      {address.city}{address.postalCode && `, ${address.postalCode}`}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className='flex flex-col gap-2'>
                  {!address.isDefault && (
                    <Button
                      onClick={() => handleSetDefault(address._id)}
                      variant='outline'
                      size='sm'
                      className='text-xs'
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    onClick={() => handleEditAddress(address)}
                    variant='ghost'
                    size='sm'
                    className='text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                  >
                    <Edit className='w-4 h-4 mr-1' />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteAddress(address._id)}
                    variant='ghost'
                    size='sm'
                    className='text-red-600 hover:text-red-700 hover:bg-red-50'
                  >
                    <Trash2 className='w-4 h-4 mr-1' />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Address Form Modal */}
      <AddressFormModal
        address={selectedAddress}
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveAddress}
        mode={formMode}
      />
    </div>
  );
};

export default AddressSection;
