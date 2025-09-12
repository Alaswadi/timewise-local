import React from 'react';
import { useLanguage, Language } from '../../contexts/LanguageContext';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full';
  className?: string;
  showLabel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'compact', 
  className = '',
  showLabel = false 
}) => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        {showLabel && (
          <label className="block text-xs font-medium text-gray-400 mb-1">
            {t('auth.languageSelector.label')}
          </label>
        )}
        <div className="flex bg-[#374151] rounded-lg p-1 border border-gray-600">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              language === 'en'
                ? 'bg-[#38e07b] text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => handleLanguageChange('ar')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              language === 'ar'
                ? 'bg-[#38e07b] text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            ع
          </button>
        </div>
      </div>
    );
  }

  // Full variant (dropdown style)
  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t('auth.languageSelector.label')}
        </label>
      )}
      <select
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value as Language)}
        className="w-full px-3 py-2 bg-[#374151] border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#38e07b] focus:border-transparent transition-colors"
      >
        <option value="en">{t('auth.languageSelector.english')}</option>
        <option value="ar">{t('auth.languageSelector.arabic')}</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
