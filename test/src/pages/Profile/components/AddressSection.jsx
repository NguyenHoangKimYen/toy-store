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
    try {
      if (formMode === 'create') {
        await createAddress(addressData);
      } else {
        await updateAddress(selectedAddress._id, addressData);
      }
      // Close modal after successful save and refresh
      setIsFormModalOpen(false);
    } catch (error) {
      // Error is already handled in useAddresses hook
      // Keep modal open so user can fix errors
      console.error('Save address error:', error);
      throw error; // Re-throw to prevent modal from closing
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
      <div className="section-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Delivery Addresses</h3>
        <Button 
          onClick={handleAddAddress} 
          className='bg-blue-600 hover:bg-blue-700 w-full sm:w-auto min-h-[44px] sm:min-h-[40px]'
        >
          <Plus className='w-4 h-4 mr-2' />
          <span>Add Address</span>
        </Button>
      </div>

      <div className="address-list space-y-3 sm:space-y-4">
        {addresses.length === 0 ? (
          <Card className='p-6 sm:p-8 text-center'>
            <MapPin className='w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3 sm:mb-4' />
            <p className='text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-2 font-medium'>No addresses saved yet</p>
            <p className='text-sm text-gray-500 dark:text-gray-500 mb-4'>
              Add your first delivery address to make checkout faster
            </p>
            <Button 
              onClick={handleAddAddress} 
              variant='outline'
              className='min-h-[44px] w-full sm:w-auto'
            >
              <Plus className='w-4 h-4 mr-2' />
              Add Your First Address
            </Button>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card key={address._id} className='p-4 sm:p-5'>
              <div className='flex flex-col sm:flex-row sm:justify-between items-start gap-3 sm:gap-4'>
                {/* Address Content */}
                <div className='flex-1 w-full sm:w-auto'>
                  <div className='flex items-center flex-wrap gap-2 mb-2'>
                    <h4 className='font-semibold text-base sm:text-lg text-gray-900 dark:text-white'>
                      {address.fullNameOfReceiver}
                    </h4>
                    {address.isDefault && (
                      <span className='inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full dark:bg-green-900 dark:text-green-200'>
                        <CheckCircle className='w-3 h-3' />
                        Default
                      </span>
                    )}
                  </div>
                  <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-1'>
                    {address.phone}
                  </p>
                  <p className='text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed'>
                    {address.addressLine}
                  </p>
                  {address.city && (
                    <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
                      {address.city}{address.postalCode && `, ${address.postalCode}`}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className='flex sm:flex-col gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap'>
                  {!address.isDefault && (
                    <Button
                      onClick={() => handleSetDefault(address._id)}
                      variant='outline'
                      size='sm'
                      className='text-xs flex-1 sm:flex-none min-h-[44px] sm:min-h-[36px] whitespace-nowrap'
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    onClick={() => handleEditAddress(address)}
                    variant='ghost'
                    size='sm'
                    className='text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-1 sm:flex-none min-h-[44px] sm:min-h-[36px]'
                  >
                    <Edit className='w-4 h-4 mr-1' />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDeleteAddress(address._id)}
                    variant='ghost'
                    size='sm'
                    className='text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 flex-1 sm:flex-none min-h-[44px] sm:min-h-[36px]'
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
