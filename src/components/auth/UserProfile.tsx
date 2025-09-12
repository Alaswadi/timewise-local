import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfileProps {
  onClose?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, logout, logoutAll, updateProfile, isLoading, error, clearError } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: user?.email || '',
    username: user?.username || '',
  });

  if (!user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (error) clearError();
  };

  const handleSave = async () => {
    const updates: { email?: string; username?: string } = {};
    
    if (formData.email !== user.email) {
      updates.email = formData.email;
    }
    
    if (formData.username !== user.username) {
      updates.username = formData.username;
    }

    if (Object.keys(updates).length === 0) {
      setIsEditing(false);
      return;
    }

    const success = await updateProfile(updates);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      email: user.email,
      username: user.username,
    });
    setIsEditing(false);
    clearError();
  };

  const handleLogout = async () => {
    await logout();
    onClose?.();
  };

  const handleLogoutAll = async () => {
    if (window.confirm('This will log you out from all devices. Continue?')) {
      await logoutAll();
      onClose?.();
    }
  };

  return (
    <div className="bg-[#1f2937] rounded-lg shadow-xl p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">User Profile</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* User Avatar */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-[#38e07b] rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[#374151] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#38e07b] focus:border-transparent"
              disabled={isLoading}
            />
          ) : (
            <p className="text-white bg-[#374151] px-3 py-2 rounded-lg">{user.email}</p>
          )}
        </div>

        {/* Username Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Username
          </label>
          {isEditing ? (
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-[#374151] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#38e07b] focus:border-transparent"
              disabled={isLoading}
            />
          ) : (
            <p className="text-white bg-[#374151] px-3 py-2 rounded-lg">{user.username}</p>
          )}
        </div>

        {/* Member Since */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Member Since
          </label>
          <p className="text-white bg-[#374151] px-3 py-2 rounded-lg">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-red-400 mr-2">error</span>
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 bg-[#38e07b] hover:bg-[#2dd46f] disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined mr-1 text-sm">save</span>
                    Save
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined mr-1 text-sm">cancel</span>
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined mr-2">edit</span>
              Edit Profile
            </button>
          )}

          <button
            onClick={handleLogoutAll}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined mr-2">devices</span>
            Logout All Devices
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined mr-2">logout</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
