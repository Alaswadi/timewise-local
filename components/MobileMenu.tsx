import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, children }) => {
  const { t } = useLanguage();
  return (
    <div
      className={`fixed inset-0 z-50 bg-gray-900/90 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`fixed top-0 h-full w-full max-w-xs bg-gray-800 shadow-2xl transition-transform duration-300
          ltr:right-0 rtl:left-0 
          ${ isOpen ? 'translate-x-0' : 'ltr:translate-x-full rtl:-translate-x-full' }
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">{t('mobileMenu.title')}</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white" aria-label="Close menu">
                <CloseIcon />
            </button>
        </div>
        <nav className="flex flex-col items-center p-4 divide-y divide-gray-700">
          {children}
        </nav>
      </div>
    </div>
  );
};