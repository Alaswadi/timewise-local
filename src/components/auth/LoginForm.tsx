import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageSelector from '../common/LanguageSelector';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSuccess }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
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

    if (!formData.emailOrUsername.trim()) {
      errors.push(t('auth.login.errors.emailOrUsernameRequired'));
    }

    if (!formData.password) {
      errors.push(t('auth.login.errors.passwordRequired'));
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const success = await login(formData.emailOrUsername.trim(), formData.password);
    
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
          <h2 className="text-3xl font-bold text-white mb-2">{t('auth.login.title')}</h2>
          <p className="text-gray-400">{t('auth.login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email/Username Input */}
          <div>
            <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth.login.emailOrUsername')}
            </label>
            <input
              type="text"
              id="emailOrUsername"
              name="emailOrUsername"
              value={formData.emailOrUsername}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-[#374151] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#38e07b] focus:border-transparent transition-colors"
              placeholder={t('auth.login.emailOrUsernamePlaceholder')}
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              {t('auth.login.password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-[#374151] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#38e07b] focus:border-transparent transition-colors pr-12"
                placeholder={t('auth.login.passwordPlaceholder')}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                disabled={isLoading}
                title={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Error Messages */}
          {allErrors.length > 0 && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="material-symbols-outlined text-red-400 mr-2">error</span>
                <span className="text-red-400 font-medium">{t('auth.login.errors.fixErrors')}</span>
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
                Signing In...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined mr-2">login</span>
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-[#38e07b] hover:text-[#2dd46f] font-medium transition-colors"
              disabled={isLoading}
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
