import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common';
import { toast } from 'sonner';
import { useProfile } from './hooks/useProfile';
import PersonalInfoSection from './components/PersonalInfoSection';
import AddressSection from './components/AddressSection';
import SecuritySection from './components/SecuritySection';
import './Profile.css';

const Profile = () => {
  const { user, loading, error, updateProfile, updateAvatar } = useProfile();
  const [activeTab, setActiveTab] = useState('personal');

  if (loading) {
    return (
      <div className="profile-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <p>{error}</p>
      </div>
    );
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    await updateAvatar(file);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="avatar-wrapper">
            <img
              src={user.avatar || '/default-avatar.png'}
              alt={user.fullName}
              className="profile-avatar"
            />
            <label htmlFor="avatar-upload" className="avatar-upload-btn">
              <Camera size={20} />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          <div className="profile-info">
            <h1>{user.fullName}</h1>
            <p className="username">@{user.username}</p>
            <div className="profile-badges">
              {user.isVerified && (
                <span className="badge verified">✓ Verified</span>
              )}
              {user.role === 'admin' && (
                <span className="badge admin">Admin</span>
              )}
              {user.socialProvider && (
                <span className="badge social">
                  {user.socialProvider}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="profile-stats">
          <div className="stat-item">
            <Mail size={20} />
            <span>{user.email}</span>
          </div>
          {user.phone && (
            <div className="stat-item">
              <Phone size={20} />
              <span>{user.phone}</span>
            </div>
          )}
          <div className="stat-item">
            <MapPin size={20} />
            <span>Loyalty Points: {user.loyaltyPoints || 0}</span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <User size={18} />
            Personal Info
          </button>
          <button
            className={`tab-btn ${activeTab === 'address' ? 'active' : ''}`}
            onClick={() => setActiveTab('address')}
          >
            <MapPin size={18} />
            Addresses
          </button>
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Save size={18} />
            Security
          </button>
        </div>

        <div className="profile-tab-content">
          {activeTab === 'personal' && (
            <PersonalInfoSection user={user} onUpdate={updateProfile} />
          )}
          {activeTab === 'address' && (
            <AddressSection user={user} />
          )}
          {activeTab === 'security' && (
            <SecuritySection user={user} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
