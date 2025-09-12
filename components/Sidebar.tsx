import React from 'react';
import { Logo } from './icons/Logo';
import { DashboardIcon } from './icons/DashboardIcon';
import { TimerIcon } from './icons/TimerIcon';
import { ListIcon } from './icons/ListIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { ProjectsIcon } from './icons/ProjectsIcon';
import { ClientsIcon } from './icons/ClientsIcon';
import { TeamIcon } from './icons/TeamIcon';
import { ReportsIcon } from './icons/ReportsIcon';
import { InviteIcon } from './icons/InviteIcon';
import { DownloadIcon } from './icons/DownloadIcon';

type View = 'Dashboard' | 'List' | 'Calendar' | 'Projects' | 'Tasks';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
}

const NavItem: React.FC<{icon: React.ReactNode, label: string, isActive?: boolean, onClick?: () => void}> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} disabled={!onClick} className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 ${isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'} ${!onClick ? 'cursor-not-allowed' : ''}`}>
        {icon}
        <span className="font-medium">{label}</span>
    </button>
);


export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
    return (
        <aside className="w-64 bg-gray-800/50 p-6 flex-col hidden md:flex">
            <div className="flex items-center space-x-3 mb-10">
                <Logo />
                <span className="text-xl font-bold text-white">TimeWise</span>
            </div>

            <nav className="flex-1 space-y-2">
                <NavItem icon={<DashboardIcon />} label="Dashboard" isActive={currentView === 'Dashboard'} onClick={() => setView('Dashboard')} />
                <NavItem icon={<ListIcon />} label="Entries List" isActive={currentView === 'List'} onClick={() => setView('List')} />
                <NavItem icon={<CalendarIcon />} label="Calendar" isActive={currentView === 'Calendar'} onClick={() => setView('Calendar')} />
                <NavItem icon={<ProjectsIcon />} label="Projects" isActive={currentView === 'Projects'} onClick={() => setView('Projects')} />
                <NavItem icon={<ReportsIcon />} label="Tasks" isActive={currentView === 'Tasks'} onClick={() => setView('Tasks')} />
            </nav>
            
            <div className="space-y-2">
                 <NavItem icon={<InviteIcon />} label="Invite team" />
                 <NavItem icon={<DownloadIcon />} label="Download App" />
            </div>
        </aside>
    );
}
