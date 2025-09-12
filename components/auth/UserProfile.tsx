import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfileProps {
  onClose?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, logout, logoutAll } = useAuth();

  if (!user) return null;

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

        {/* User Info */}
        <div className="text-center space-y-2">
          <h4 className="text-lg font-semibold text-white">{user.username}</h4>
          <p className="text-gray-400 text-sm">{user.email}</p>
          <p className="text-gray-500 text-xs">
            Member since {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
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
