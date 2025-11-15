import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PersonalInfoSection = ({ user, onUpdate, loading }) => {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onUpdate(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <h3>Personal Information</h3>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            Edit
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={user?.username || ''}
              disabled
              className="disabled-input"
            />
            <p className="input-hint">Username cannot be changed</p>
          </div>

          <div className="form-group">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              disabled={!isEditing || loading}
              required
            />
          </div>

          <div className="form-group">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing || loading}
              required
            />
          </div>

          <div className="form-group">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing || loading}
            />
          </div>
        </div>

        {isEditing && (
          <div className="form-actions">
            <Button type="button" onClick={handleCancel} variant="outline" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PersonalInfoSection;
