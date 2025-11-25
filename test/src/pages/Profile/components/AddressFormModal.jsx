import { useState, useEffect } from 'react';
import { X, Save, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AddressAutocomplete from '@/components/common/AddressAutocomplete';
import { toast } from 'sonner';

const AddressFormModal = ({ address, isOpen, onClose, onSave, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    fullNameOfReceiver: '',
    email: '',
    phone: '',
    addressLine: '',
    city: '',
    postalCode: '',
    isDefault: false,
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (address && mode === 'edit') {
      setFormData({
        fullNameOfReceiver: address.fullNameOfReceiver || '',
        email: address.email || '',
        phone: address.phone || '',
        addressLine: address.addressLine || '',
        city: address.city || '',
        postalCode: address.postalCode || '',
        isDefault: address.isDefault || false,
      });
    } else {
      // Reset form for create mode
      setFormData({
        fullNameOfReceiver: '',
        email: '',
        phone: '',
        addressLine: '',
        city: '',
        postalCode: '',
        isDefault: false,
      });
    }
  }, [address, mode, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullNameOfReceiver.trim()) {
      newErrors.fullNameOfReceiver = 'Receiver name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/ /g, ''))) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    if (!formData.addressLine.trim()) {
      newErrors.addressLine = 'Address is required';
    } else if (formData.addressLine.trim().length < 10) {
      newErrors.addressLine = 'Address must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
      // Reset form after successful save
      setFormData({
        fullNameOfReceiver: '',
        email: '',
        phone: '',
        addressLine: '',
        city: '',
        postalCode: '',
        isDefault: false,
      });
      setErrors({});
    } catch (error) {
      // Error toast is handled in the parent component
      console.error('Form submission error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        <div className='sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
            {mode === 'create' ? 'Add New Address' : 'Edit Address'}
          </h2>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
            <X className='w-6 h-6' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Receiver Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2'>
              <MapPin className='w-5 h-5' />
              Receiver Information
            </h3>
            
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='fullNameOfReceiver'>Receiver Name *</Label>
                <Input
                  id='fullNameOfReceiver'
                  name='fullNameOfReceiver'
                  value={formData.fullNameOfReceiver}
                  onChange={handleInputChange}
                  placeholder='Enter receiver full name'
                />
                {errors.fullNameOfReceiver && (
                  <p className='text-red-500 text-sm mt-1'>{errors.fullNameOfReceiver}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor='email'>Email *</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder='example@email.com'
                />
                {errors.email && (
                  <p className='text-red-500 text-sm mt-1'>{errors.email}</p>
                )}
              </div>
            </div>
            
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='phone'>Phone Number *</Label>
                <Input
                  id='phone'
                  name='phone'
                  type='tel'
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder='0909999999'
                />
                {errors.phone && (
                  <p className='text-red-500 text-sm mt-1'>{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
              Address Details
            </h3>
            
            <div>
              <Label htmlFor='addressLine'>Full Address *</Label>
              <AddressAutocomplete
                id='addressLine'
                name='addressLine'
                value={formData.addressLine}
                onChange={handleInputChange}
                placeholder='e.g., 76/12 Bà Hom, Phường 13, Quận 6'
              />
              <p className='text-xs text-gray-500 mt-1'>
                Enter full address including street, ward, and district
              </p>
              {errors.addressLine && (
                <p className='text-red-500 text-sm mt-1'>{errors.addressLine}</p>
              )}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='city'>City</Label>
                <Input
                  id='city'
                  name='city'
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder='e.g., Ho Chi Minh'
                />
              </div>
              
              <div>
                <Label htmlFor='postalCode'>Postal Code</Label>
                <Input
                  id='postalCode'
                  name='postalCode'
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder='Optional'
                />
              </div>
            </div>
          </div>

          {/* Default Address Checkbox */}
          <div className='flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
            <input
              type='checkbox'
              id='isDefault'
              name='isDefault'
              checked={formData.isDefault}
              onChange={handleInputChange}
              className='w-4 h-4'
            />
            <Label htmlFor='isDefault' className='cursor-pointer'>
              Set as default address
            </Label>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
            <Button type='button' variant='outline' onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type='submit' disabled={saving} className='bg-blue-600 hover:bg-blue-700'>
              <Save className='w-4 h-4 mr-2' />
              {saving ? 'Saving...' : mode === 'create' ? 'Add Address' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressFormModal;
