import React, { useState, lazy, Suspense } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common';
import { toast } from 'sonner';
import { useProfile } from './hooks/useProfile';
import './Profile.css';

const PersonalInfoSection = lazy(() => import('./components/PersonalInfoSection'));
const AddressSection = lazy(() => import('./components/AddressSection'));
const SecuritySection = lazy(() => import('./components/SecuritySection'));
const LoyaltySection = lazy(() => import('./components/LoyaltySection'));

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

  if (error || !user) {
    return (
      <div className="profile-error">
        <div className="error-content">
          <User size={48} className="error-icon" />
          <h2>An error occurred</h2>
          <p>{error || 'Failed to load profile'}</p>
          {error && (error.includes('404') || error.includes('not found')) && (
            <p className="error-hint">Your session may have expired. Redirecting to login...</p>
          )}
        </div>
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
              {user.loyaltyRank && user.loyaltyRank !== 'none' && (
                <span className={`badge tier tier-${user.loyaltyRank}`}>
                  <Crown size={12} /> {user.loyaltyRank.charAt(0).toUpperCase() + user.loyaltyRank.slice(1)}
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
            <Crown size={20} />
            <span>{(user.loyaltyPoints || 0).toLocaleString()} Coins</span>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            <User size={18} />
            Personal Info
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'address' ? 'active' : ''}`}
            onClick={() => setActiveTab('address')}
          >
            <MapPin size={18} />
            Addresses
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Save size={18} />
            Security
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'loyalty' ? 'active' : ''}`}
            onClick={() => setActiveTab('loyalty')}
          >
            <Crown size={18} />
            Loyalty
          </button>
        </div>

        <div className="profile-tab-content">
          <Suspense fallback={<LoadingSpinner />}>
            {activeTab === 'personal' && (
              <PersonalInfoSection user={user} onUpdate={updateProfile} />
            )}
            {activeTab === 'address' && (
              <AddressSection user={user} />
            )}
            {activeTab === 'security' && (
              <SecuritySection user={user} />
            )}
            {activeTab === 'loyalty' && (
              <LoyaltySection user={user} />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Profile;
