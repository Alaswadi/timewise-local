import React, { useState } from 'react';
import { View } from '../App';
import { TimeWiseLogo } from './icons/TimeWiseLogo';
import { HamburgerIcon } from './icons/HamburgerIcon';
import { MobileMenu } from './MobileMenu';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from './auth/UserProfile';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const NavLink: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  isMobile?: boolean;
}> = ({ label, isActive, onClick, isMobile = false }) => (
  <button
    onClick={onClick}
    className={`
      ${isMobile ? 'text-2xl py-4 w-full text-center' : 'text-sm'}
      hover:text-white transition-colors 
      ${isActive ? 'text-white font-semibold' : 'text-gray-400'}
    `}
  >
    {label}
  </button>
);

export const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  const handleSetView = (view: View) => {
    setView(view);
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: t('header.nav.dashboard'), view: 'Dashboard' },
    { label: t('header.nav.reports'), view: 'Reports' },
    { label: t('header.nav.list'), view: 'List' },
    { label: t('header.nav.calendar'), view: 'Calendar' },
    { label: t('header.nav.projects'), view: 'Projects' },
    { label: t('header.nav.clients'), view: 'Clients' },
    { label: t('header.nav.tasks'), view: 'Tasks' },
    { label: t('header.nav.settings'), view: 'Settings' },
  ] as const;

  return (
    <>
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-700 px-4 sm:px-10 py-4">
        <div className="flex items-center gap-4 text-white">
          <TimeWiseLogo />
          <h1 className="text-white text-xl font-bold">{t('header.title')}</h1>
        </div>
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-400">
          {navLinks.map(link => (
            <NavLink 
              key={link.view}
              label={link.label} 
              isActive={currentView === link.view} 
              onClick={() => handleSetView(link.view as View)} 
            />
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* User Profile Button */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserProfile(!showUserProfile)}
                className="flex items-center gap-2 p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="User profile"
              >
                <div className="w-8 h-8 bg-[#38e07b] rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:block text-sm">{user.username}</span>
              </button>

              {/* User Profile Dropdown */}
              {showUserProfile && (
                <div className="absolute right-0 top-full mt-2 z-50">
                  <UserProfile onClose={() => setShowUserProfile(false)} />
                </div>
              )}
            </div>
          )}

          <button
            className="lg:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <HamburgerIcon />
          </button>
        </div>
      </header>
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
        {navLinks.map(link => (
            <NavLink 
              key={link.view}
              label={link.label} 
              isActive={currentView === link.view} 
              onClick={() => handleSetView(link.view as View)}
              isMobile
            />
        ))}
      </MobileMenu>
    </>
  );
};