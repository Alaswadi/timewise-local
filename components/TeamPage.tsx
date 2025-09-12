import React from 'react';
import { User } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { PlusIcon } from './icons/PlusIcon';

interface TeamPageProps {
    members: User[];
}

export const TeamPage: React.FC<TeamPageProps> = ({ members }) => {
    const { t } = useLanguage();

    return (
        <div>
            <header className="mb-8 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-neutral-100">{t('teamPage.title')}</h1>
                    <p className="text-neutral-400">{t('teamPage.description')}</p>
                </div>
                <button onClick={() => alert('Feature coming soon!')} className="flex self-start sm:self-auto items-center gap-2 bg-[var(--primary-color)] text-gray-900 font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    <PlusIcon />
                    {t('teamPage.invite')}
                </button>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {members.map(member => (
                    <div key={member.id} className="bg-gray-800 rounded-lg p-6 flex flex-col items-center text-center">
                        <img 
                            src={member.avatarUrl} 
                            alt={member.name}
                            className="w-24 h-24 rounded-full mb-4 ring-2 ring-gray-700"
                        />
                        <h3 className="text-lg font-semibold text-white">{member.name}</h3>
                        <p className="text-sm text-gray-400">Member</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
