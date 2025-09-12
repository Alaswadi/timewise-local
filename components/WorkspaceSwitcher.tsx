import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Workspace, Membership } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface WorkspaceSwitcherProps {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  currentWorkspace: Workspace;
  setCurrentWorkspace: (workspace: Workspace) => void;
  users: User[];
  workspaces: Workspace[];
  memberships: Membership[];
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  currentUser,
  setCurrentUser,
  currentWorkspace,
  setCurrentWorkspace,
  users,
  workspaces,
  memberships,
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userWorkspaces = useMemo(() => {
    const userMembership = memberships.filter(m => m.userId === currentUser.id);
    return workspaces.filter(w => userMembership.some(m => m.workspaceId === w.id));
  }, [currentUser, workspaces, memberships]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleUserSwitch = (user: User) => {
    setCurrentUser(user);
    const firstWorkspaceId = memberships.find(m => m.userId === user.id)?.workspaceId;
    const firstWorkspace = workspaces.find(w => w.id === firstWorkspaceId);
    if (firstWorkspace) {
      setCurrentWorkspace(firstWorkspace);
    }
    setIsOpen(false);
  };
  
  const handleWorkspaceSwitch = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-1 pe-3 text-sm font-medium text-white transition hover:bg-gray-700"
      >
        <img
          alt={currentUser.name}
          src={currentUser.avatarUrl}
          className="h-8 w-8 rounded-full object-cover"
        />
        <div className="text-start">
            <p className="font-medium text-xs text-gray-300 truncate max-w-24">{currentUser.name}</p>
            <p className="text-xs text-gray-500 truncate max-w-24">{currentWorkspace.name}</p>
        </div>
        <span className="material-symbols-outlined text-base transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}> expand_more </span>
      </button>

      {isOpen && (
        <div className="absolute end-0 z-10 mt-2 w-64 divide-y divide-gray-600 rounded-md border border-gray-600 bg-gray-800 shadow-lg" role="menu">
          <div className="p-2">
            <strong className="block p-2 text-xs font-medium uppercase text-gray-400"> {t('workspaceSwitcher.switchWorkspace')} </strong>
            {userWorkspaces.map(ws => (
                <button
                    key={ws.id}
                    onClick={() => handleWorkspaceSwitch(ws)}
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                    {ws.name}
                    {ws.id === currentWorkspace.id && <span className="material-symbols-outlined text-sm text-[var(--primary-color)]"> check_circle </span>}
                </button>
            ))}
          </div>
          <div className="p-2">
            <strong className="block p-2 text-xs font-medium uppercase text-gray-400"> {t('workspaceSwitcher.switchUser')} </strong>
            {users.map(user => (
                 <button
                    key={user.id}
                    onClick={() => handleUserSwitch(user)}
                    className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                 >
                    <img alt={user.name} src={user.avatarUrl} className="h-6 w-6 rounded-full object-cover" />
                    {user.name}
                     {user.id === currentUser.id && <span className="material-symbols-outlined text-sm text-[var(--primary-color)]"> check_circle </span>}
                </button>
            ))}
          </div>
          <div className="p-2">
            <p className="p-2 text-xs text-gray-500">{t('workspaceSwitcher.signedInAs')} <span className="font-medium text-gray-400">{currentUser.name}</span></p>
          </div>
        </div>
      )}
    </div>
  );
};
