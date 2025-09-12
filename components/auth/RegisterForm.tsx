import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSelector from '../common/LanguageSelector';

// Simple validation functions for the frontend
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase());
};

const validateUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

const validatePassword = (password: string, t: (key: string) => string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push(t('auth.register.errors.passwordMinLength'));
  }

  if (!/[A-Z]/.test(password)) {
    errors.push(t('auth.register.errors.passwordUppercase'));
  }

  if (!/[a-z]/.test(password)) {
    errors.push(t('auth.register.errors.passwordLowercase'));
  }

  if (!/\d/.test(password)) {
    errors.push(t('auth.register.errors.passwordNumber'));
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onSuccess }) => {
  const { register, isLoading, error, clearError } = useAuth();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors when user starts typing
    if (error) clearError();
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Required fields
    if (!formData.email.trim()) {
      errors.push(t('auth.register.errors.emailRequired'));
    } else if (!validateEmail(formData.email)) {
      errors.push(t('auth.register.errors.emailInvalid'));
    }

    if (!formData.username.trim()) {
      errors.push(t('auth.register.errors.usernameRequired'));
    } else if (!validateUsername(formData.username)) {
      errors.push(t('auth.register.errors.usernameInvalid'));
    }

    if (!formData.password) {
      errors.push(t('auth.register.errors.passwordRequired'));
    } else {
      const passwordValidation = validatePassword(formData.password, t);
      if (!passwordValidation.isValid) {
        errors.push(...passwordValidation.errors);
      }
    }

    if (!formData.confirmPassword) {
      errors.push(t('auth.register.errors.confirmPasswordRequired'));
    } else if (formData.password !== formData.confirmPassword) {
      errors.push(t('auth.register.errors.passwordMismatch'));
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const success = await register(
      formData.email.trim(),
      formData.username.trim(),
      formData.password,
      formData.confirmPassword
    );
    
    if (success) {
      onSuccess?.();
    }
  };

  const allErrors = [...validationErrors, ...(error ? [error] : [])];

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#1f2937] rounded-lg shadow-xl p-8">
        {/* Language Selector */}
        <div className="flex justify-end mb-6">
          <LanguageSelector variant="compact" />
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">{t('auth.register.title')}</h2>
          <p className="text-gray-400">{t('auth.register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth.register.email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-[#374151] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#38e07b] focus:border-transparent transition-colors"
              placeholder={t('auth.register.emailPlaceholder')}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth.register.username')}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-[#374151] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#38e07b] focus:border-transparent transition-colors"
              placeholder={t('auth.register.usernamePlaceholder')}
              disabled={isLoading}
              autoComplete="username"
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('auth.register.usernameHint')}
            </p>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth.register.password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#374151] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#38e07b] focus:border-transparent transition-colors pr-12"
                placeholder={t('auth.register.passwordPlaceholder')}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                disabled={isLoading}
                title={showPassword ? t('auth.register.hidePassword') : t('auth.register.showPassword')}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth.register.confirmPassword')}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#374151] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#38e07b] focus:border-transparent transition-colors pr-12"
                placeholder={t('auth.register.confirmPasswordPlaceholder')}
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                disabled={isLoading}
                title={showConfirmPassword ? t('auth.register.hidePassword') : t('auth.register.showPassword')}
              >
                <span className="material-symbols-outlined text-xl">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Error Messages */}
          {allErrors.length > 0 && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="material-symbols-outlined text-red-400 mr-2">error</span>
                <span className="text-red-400 font-medium">{t('auth.register.errors.fixErrors')}</span>
              </div>
              <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                {allErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#38e07b] hover:bg-[#2dd46f] disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t('auth.register.creatingAccount')}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined mr-2">person_add</span>
                {t('auth.register.createAccount')}
              </>
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            {t('auth.register.haveAccount')}{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-[#38e07b] hover:text-[#2dd46f] font-medium transition-colors"
              disabled={isLoading}
            >
              {t('auth.register.signInHere')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
