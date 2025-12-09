import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Loader2, Pencil, User, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

// Validation rules
const validateFullName = (name) => {
  if (!name || !name.trim()) return 'Full name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.trim().length > 50) return 'Name must be less than 50 characters';
  if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(name.trim())) return 'Name can only contain letters and spaces';
  return '';
};

const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
  return '';
};

const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return ''; // Phone is optional
  const phoneRegex = /^[0-9+\-\s()]{9,15}$/;
  if (!phoneRegex.test(phone.trim())) return 'Please enter a valid phone number';
  return '';
};

const FIELD_ICONS = {
  fullName: User,
  email: Mail,
  phone: Phone,
};

const PersonalInfoSection = ({ user, onUpdate, loading }) => {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Validate on change
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'fullName':
        return validateFullName(value);
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value);
      default:
        return '';
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate on change if field was touched
    if (touchedFields[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields((prev) => ({
      ...prev,
      [name]: true,
    }));
    setValidationErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const errors = {
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
    };

    setValidationErrors(errors);
    setTouchedFields({ fullName: true, email: true, phone: true });

    // Check for errors
    if (Object.values(errors).some((error) => error)) {
      toast.error('Please fix the errors before saving');
      return;
    }

    const success = await onUpdate(formData);
    if (success) {
      setIsEditing(false);
      setTouchedFields({});
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
    setTouchedFields({});
    setValidationErrors({});
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setTouchedFields({});
    setValidationErrors({});
  };

  const getFieldStatus = (fieldName) => {
    if (!touchedFields[fieldName]) return 'neutral';
    if (validationErrors[fieldName]) return 'error';
    return 'success';
  };

  const renderField = (name, label, type = 'text', placeholder = '', required = true) => {
    const status = getFieldStatus(name);
    const hasError = status === 'error';
    const isValid = status === 'success';
    const Icon = FIELD_ICONS[name];
    const isDisabled = !isEditing || loading;

    return (
      <div className="form-group">
        <Label htmlFor={name} className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {Icon && <Icon size={14} className="text-gray-500" />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="relative">
          <Input
            id={name}
            name={name}
            type={type}
            value={formData[name]}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={isDisabled}
            placeholder={placeholder}
            className={`pr-10 transition-all ${
              hasError
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                : isValid
                ? 'border-green-400 focus:border-green-400 focus:ring-green-400/20'
                : ''
            }`}
            required={required}
          />
          {touchedFields[name] && isEditing && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {hasError ? (
                <X className="w-5 h-5 text-red-500" />
              ) : isValid ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : null}
            </div>
          )}
        </div>
        {hasError && (
          <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
            <X className="w-3 h-3" />
            {validationErrors[name]}
          </p>
        )}
        {isValid && isEditing && (
          <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
            <Check className="w-3 h-3" />
            Looks good!
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <h3>Personal Information</h3>
        {!isEditing && (
          <Button onClick={handleStartEditing} variant="outline" size="sm">
            <Pencil size={16} className="mr-2" />
            Edit
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User size={14} className="text-gray-500" />
              Username
            </Label>
            <Input
              id="username"
              name="username"
              value={user?.username || ''}
              disabled
              className="disabled-input bg-gray-50"
            />
            <p className="input-hint text-xs text-gray-500 mt-1">Username cannot be changed</p>
          </div>

          {renderField('fullName', 'Full Name', 'text', 'Enter your full name')}
          {renderField('email', 'Email', 'email', 'Enter your email')}
          {renderField('phone', 'Phone', 'tel', 'Enter your phone number', false)}
        </div>

        {isEditing && (
          <div className="form-actions mt-6">
            <Button type="button" onClick={handleCancel} variant="outline" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PersonalInfoSection;
