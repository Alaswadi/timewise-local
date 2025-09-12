import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

export type FirstDayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

interface UserPreferences {
  firstDayOfWeek: FirstDayOfWeek;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  setFirstDayOfWeek: (day: FirstDayOfWeek) => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: UserPreferences = {
  firstDayOfWeek: 'monday'
};

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  // Get storage key for current user
  const getStorageKey = useCallback(() => {
    return user ? `userPreferences_${user.id}` : 'userPreferences_guest';
  }, [user]);

  // Load preferences from localStorage
  const loadPreferences = useCallback(() => {
    try {
      const storageKey = getStorageKey();
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedPreferences = JSON.parse(saved);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsedPreferences });
      } else {
        setPreferences(DEFAULT_PREFERENCES);
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      setPreferences(DEFAULT_PREFERENCES);
    }
  }, [getStorageKey]);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences: UserPreferences) => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(newPreferences));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }, [getStorageKey]);

  // Load preferences when user changes or component mounts
  useEffect(() => {
    if (isAuthenticated) {
      loadPreferences();
    }
  }, [isAuthenticated, loadPreferences]);

  // Set first day of week
  const setFirstDayOfWeek = useCallback((day: FirstDayOfWeek) => {
    const newPreferences = { ...preferences, firstDayOfWeek: day };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  const value: UserPreferencesContextType = {
    preferences,
    setFirstDayOfWeek,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = (): UserPreferencesContextType => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};
