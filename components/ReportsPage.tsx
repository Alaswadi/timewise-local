import React, { useState } from 'react';
import { TimeEntry, Project, Task, Client } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { SummaryReport } from './SummaryReport';
import { DetailedReport } from './DetailedReport';
import { CompareReport } from './CompareReport';

interface ReportsPageProps {
    entries: TimeEntry[];
    projects: Project[];
    tasks: Task[];
    clients: Client[];
}

type ReportTab = 'Summary' | 'Detailed' | 'Compare';

export const ReportsPage: React.FC<ReportsPageProps> = ({ entries, projects, tasks, clients }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<ReportTab>('Summary');

    return (
        <>
            <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{t('reportsPage.title')}</h2>
                <p className="mt-2 text-gray-400">{t('reportsPage.description')}</p>
            </div>
            <div className="mb-6 border-b border-gray-700 overflow-x-auto">
                <nav aria-label="Tabs" className="-mb-px flex space-x-8 rtl:space-x-reverse">
                    <button onClick={() => setActiveTab('Summary')} className={`whitespace-nowrap px-1 py-4 text-sm font-medium ${activeTab === 'Summary' ? 'border-b-2 border-[var(--primary-color)] text-[var(--primary-color)]' : 'border-b-2 border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-300'}`}>{t('reportsPage.tabs.summary')}</button>
                    <button onClick={() => setActiveTab('Detailed')} className={`whitespace-nowrap px-1 py-4 text-sm font-medium ${activeTab === 'Detailed' ? 'border-b-2 border-[var(--primary-color)] text-[var(--primary-color)]' : 'border-b-2 border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-300'}`}>{t('reportsPage.tabs.detailed')}</button>
                    <button onClick={() => setActiveTab('Compare')} className={`whitespace-nowrap px-1 py-4 text-sm font-medium ${activeTab === 'Compare' ? 'border-b-2 border-[var(--primary-color)] text-[var(--primary-color)]' : 'border-b-2 border-transparent text-gray-400 hover:border-gray-500 hover:text-gray-300'}`}>{t('reportsPage.tabs.compare')}</button>
                </nav>
            </div>
            
            {activeTab === 'Summary' && <SummaryReport entries={entries} projects={projects} clients={clients} />}
            {activeTab === 'Detailed' && <DetailedReport entries={entries} projects={projects} clients={clients} tasks={tasks} />}
            {activeTab === 'Compare' && <CompareReport entries={entries} projects={projects} clients={clients} />}
        </>
    );
};