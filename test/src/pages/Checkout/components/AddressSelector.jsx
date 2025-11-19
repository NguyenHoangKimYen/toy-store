import { useState, useEffect } from 'react';
import { MapPin, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAddresses } from '@/pages/Profile/hooks/useAddresses';
import { LoadingSpinner } from '@/components/common';
import AddressFormModal from '@/pages/Profile/components/AddressFormModal';

const AddressSelector = ({ userId, selectedAddressId, onSelectAddress }) => {
  const {
    addresses,
    defaultAddress,
    loading,
    error,
    createAddress,
  } = useAddresses(userId);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Auto-select default address if no address is selected
  useEffect(() => {
    if (!selectedAddressId && defaultAddress) {
      onSelectAddress(defaultAddress._id);
    }
  }, [selectedAddressId, defaultAddress, onSelectAddress]);

  const handleAddAddress = () => {
    setIsFormModalOpen(true);
  };

  const handleSaveAddress = async (addressData) => {
    const newAddress = await createAddress(addressData);
    // Auto-select the newly created address
    if (newAddress && newAddress.data) {
      onSelectAddress(newAddress.data._id);
    }
  };

  if (loading) {
    return (
      <Card className='p-6'>
        <div className='flex justify-center py-4'>
          <LoadingSpinner />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='p-6'>
        <div className='bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg'>
          Error loading addresses: {error}
        </div>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
          <MapPin className='w-5 h-5' />
          Select Delivery Address
        </h3>
        <Button onClick={handleAddAddress} variant='outline' size='sm'>
          <Plus className='w-4 h-4 mr-2' />
          Add New
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className='p-8 text-center'>
          <MapPin className='w-12 h-12 mx-auto text-gray-400 mb-4' />
          <p className='text-gray-600 dark:text-gray-400 mb-2'>No saved addresses</p>
          <p className='text-sm text-gray-500 dark:text-gray-500 mb-4'>
            Add a delivery address to continue
          </p>
          <Button onClick={handleAddAddress}>
            <Plus className='w-4 h-4 mr-2' />
            Add Address
          </Button>
        </Card>
      ) : (
        <div className='space-y-3'>
          {addresses.map((address) => (
            <Card
              key={address._id}
              className={`p-4 cursor-pointer transition-all ${
                selectedAddressId === address._id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:border-gray-400'
              }`}
              onClick={() => onSelectAddress(address._id)}
            >
              <div className='flex items-start gap-3'>
                {/* Radio/Check Indicator */}
                <div className='flex-shrink-0 mt-1'>
                  {selectedAddressId === address._id ? (
                    <div className='w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center'>
                      <Check className='w-3 h-3 text-white' />
                    </div>
                  ) : (
                    <div className='w-5 h-5 rounded-full border-2 border-gray-300' />
                  )}
                </div>

                {/* Address Content */}
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <h4 className='font-semibold text-gray-900 dark:text-white'>
                      {address.fullNameOfReceiver}
                    </h4>
                    {address.isDefault && (
                      <span className='px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded dark:bg-green-900 dark:text-green-200'>
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
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                      {address.city}{address.postalCode && `, ${address.postalCode}`}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      <AddressFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveAddress}
        mode='create'
      />
    </div>
  );
};

export default AddressSelector;
