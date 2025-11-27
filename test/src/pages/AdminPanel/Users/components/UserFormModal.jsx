import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const UserFormModal = ({ user, isOpen, onClose, onSave, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    isVerified: false,
    avatar: '',
    loyaltyPoints: 0,
    socialProvider: '',
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        password: '',
        confirmPassword: '',
        role: user.role || 'customer',
        isVerified: user.isVerified || false,
        avatar: user.avatar || '',
        loyaltyPoints: user.loyaltyPoints || 0,
        socialProvider: user.socialProvider || '',
      });
    }
  }, [user, mode]);

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
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (mode === 'create') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.password) {
      // Only validate password if provided in edit mode
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
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
      // Remove password fields if empty in edit mode
      const dataToSave = { ...formData };
      if (mode === 'edit' && !dataToSave.password) {
        delete dataToSave.password;
        delete dataToSave.confirmPassword;
      }
      
      await onSave(dataToSave);
      toast.success(`User ${mode === 'create' ? 'created' : 'updated'} successfully`);
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4'>
      <div className='bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        <div className='sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>
            {mode === 'create' ? 'Add New User' : 'Edit User'}
          </h2>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
            <X className='w-6 h-6' />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          {/* Basic Info */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='fullName'>Full Name *</Label>
              <Input
                id='fullName'
                name='fullName'
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder='Enter full name'
              />
              {errors.fullName && <p className='text-red-500 text-sm mt-1'>{errors.fullName}</p>}
            </div>
            <div>
              <Label htmlFor='username'>Username *</Label>
              <Input
                id='username'
                name='username'
                value={formData.username}
                onChange={handleInputChange}
                placeholder='Enter username'
                disabled={mode === 'edit'}
              />
              {errors.username && <p className='text-red-500 text-sm mt-1'>{errors.username}</p>}
              {mode === 'edit' && <p className='text-xs text-gray-500 mt-1'>Username cannot be changed</p>}
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='email'>Email *</Label>
              <Input
                id='email'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleInputChange}
                placeholder='Enter email'
              />
              {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor='phone'>Phone</Label>
              <Input
                id='phone'
                name='phone'
                type='tel'
                value={formData.phone}
                onChange={handleInputChange}
                placeholder='Enter phone number'
              />
            </div>
          </div>

          {/* Password Fields */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='password'>
                Password {mode === 'create' ? '*' : '(leave blank to keep current)'}
              </Label>
              <Input
                id='password'
                name='password'
                type='password'
                value={formData.password}
                onChange={handleInputChange}
                placeholder='Enter password'
              />
              {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password}</p>}
            </div>
            <div>
              <Label htmlFor='confirmPassword'>
                Confirm Password {mode === 'create' ? '*' : ''}
              </Label>
              <Input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder='Confirm password'
              />
              {errors.confirmPassword && <p className='text-red-500 text-sm mt-1'>{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Role and Status */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='role'>Role *</Label>
              <select
                id='role'
                name='role'
                value={formData.role}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              >
                <option value='customer'>Customer</option>
                <option value='admin'>Admin</option>
              </select>
            </div>
            <div className='flex items-center gap-2 pt-8'>
              <input
                type='checkbox'
                id='isVerified'
                name='isVerified'
                checked={formData.isVerified}
                onChange={handleInputChange}
                className='w-4 h-4'
              />
              <Label htmlFor='isVerified'>Email Verified</Label>
            </div>
          </div>

          {/* Avatar URL */}
          <div>
            <Label htmlFor='avatar'>Avatar URL</Label>
            <Input
              id='avatar'
              name='avatar'
              value={formData.avatar}
              onChange={handleInputChange}
              placeholder='https://example.com/avatar.jpg'
            />
          </div>

          {/* Loyalty Points and Social Provider */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label htmlFor='loyaltyPoints'>Loyalty Points</Label>
              <Input
                id='loyaltyPoints'
                name='loyaltyPoints'
                type='number'
                value={formData.loyaltyPoints}
                onChange={handleInputChange}
                placeholder='0'
                min='0'
              />
            </div>
            <div>
              <Label htmlFor='socialProvider'>Social Provider</Label>
              <select
                id='socialProvider'
                name='socialProvider'
                value={formData.socialProvider}
                onChange={handleInputChange}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
              >
                <option value=''>None</option>
                <option value='google'>Google</option>
                <option value='facebook'>Facebook</option>
                <option value='github'>GitHub</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700'>
            <Button type='button' variant='outline' onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type='submit' disabled={saving} className='bg-blue-600 hover:bg-blue-700'>
              <Save className='w-4 h-4 mr-2' />
              {saving ? 'Saving...' : mode === 'create' ? 'Create User' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default UserFormModal;
