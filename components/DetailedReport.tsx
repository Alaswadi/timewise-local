import React, { useState, useMemo } from 'react';
import { TimeEntry, Project, Task, Client } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency, formatDuration, calculateEntryEarnings, formatDate } from '../utils/time';

interface DetailedReportProps {
    entries: TimeEntry[];
    projects: Project[];
    tasks: Task[];
    clients: Client[];
}

const StatCard: React.FC<{ title: string; value: string }> = ({ title, value }) => (
    <div className="bg-gray-800 rounded-lg shadow p-4">
      <h4 className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</h4>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
);

const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const DetailedReport: React.FC<DetailedReportProps> = ({ entries, projects, clients, tasks }) => {
    const { t, language } = useLanguage();
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [startDate, setStartDate] = useState(formatDateForInput(thirtyDaysAgo));
    const [endDate, setEndDate] = useState(formatDateForInput(new Date()));
    const [selectedClientId, setSelectedClientId] = useState('all');
    const [selectedProjectId, setSelectedProjectId] = useState('all');
    const [billableStatus, setBillableStatus] = useState<'all' | 'billable' | 'non-billable'>('all');

    const availableProjects = useMemo(() => {
        if (selectedClientId === 'all') return projects;
        return projects.filter(p => p.clientId === selectedClientId);
    }, [selectedClientId, projects]);

    const filteredEntries = useMemo(() => {
        const start = startDate ? new Date(startDate).getTime() : 0;
        const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Date.now();

        return entries.filter(entry => {
            const entryTime = new Date(entry.startTime).getTime();
            if (entryTime < start || entryTime > end) return false;
            if (selectedClientId !== 'all' && projects.find(p => p.id === entry.projectId)?.clientId !== selectedClientId) return false;
            if (selectedProjectId !== 'all' && entry.projectId !== selectedProjectId) return false;
            if (billableStatus !== 'all') {
                if (billableStatus === 'billable' && !entry.billable) return false;
                if (billableStatus === 'non-billable' && entry.billable) return false;
            }
            return true;
        });
    }, [startDate, endDate, selectedClientId, selectedProjectId, billableStatus, entries, projects]);

    const summary = useMemo(() => {
        const totalTime = filteredEntries.reduce((sum, e) => sum + (e.endTime - e.startTime), 0);
        const totalEarnings = filteredEntries.reduce((sum, e) => sum + calculateEntryEarnings(e, projects), 0);
        return { totalTime, totalEarnings, entriesFound: filteredEntries.length };
    }, [filteredEntries, projects]);

    const getProjectName = (id?: string) => projects.find(p => p.id === id)?.name || 'N/A';
    const getClientNameFromProject = (projectId?: string) => {
        const project = projects.find(p => p.id === projectId);
        if (!project) return 'N/A';
        return clients.find(c => c.id === project.clientId)?.name || 'N/A';
    };

    return (
        <div>
            <div className="bg-gray-800/50 rounded-lg p-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="text-xs text-gray-400">{t('reportsPage.detailed.filters.from')}</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input w-full mt-1 rounded-md border-gray-600 bg-gray-700 text-white focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">{t('reportsPage.detailed.filters.to')}</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input w-full mt-1 rounded-md border-gray-600 bg-gray-700 text-white focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">{t('reportsPage.detailed.filters.client')}</label>
                        <select value={selectedClientId} onChange={e => { setSelectedClientId(e.target.value); setSelectedProjectId('all'); }} className="form-select w-full mt-1 rounded-md border-gray-600 bg-gray-700 text-white focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]">
                            <option value="all">{t('reportsPage.detailed.filters.allClients')}</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">{t('reportsPage.detailed.filters.project')}</label>
                        <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="form-select w-full mt-1 rounded-md border-gray-600 bg-gray-700 text-white focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]">
                            <option value="all">{t('reportsPage.detailed.filters.allProjects')}</option>
                            {availableProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-xs text-gray-400">{t('reportsPage.detailed.filters.billable')}</label>
                        <select value={billableStatus} onChange={e => setBillableStatus(e.target.value as any)} className="form-select w-full mt-1 rounded-md border-gray-600 bg-gray-700 text-white focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]">
                            <option value="all">{t('reportsPage.detailed.filters.all')}</option>
                            <option value="billable">{t('reportsPage.detailed.filters.billableOnly')}</option>
                            <option value="non-billable">{t('reportsPage.detailed.filters.notBillable')}</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title={t('reportsPage.detailed.summary.totalTime')} value={formatDuration(summary.totalTime)} />
                <StatCard title={t('reportsPage.detailed.summary.totalEarnings')} value={formatCurrency(summary.totalEarnings, language)} />
                <StatCard title={t('reportsPage.detailed.summary.entriesFound')} value={String(summary.entriesFound)} />
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
                {filteredEntries.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-700 text-sm">
                    <thead className="bg-gray-900 hidden md:table-header-group">
                        <tr>
                            <th className="px-4 py-3 text-start font-semibold text-white">{t('reportsPage.detailed.tableHeaders.date')}</th>
                            <th className="px-4 py-3 text-start font-semibold text-white">{t('reportsPage.detailed.tableHeaders.description')}</th>
                            <th className="px-4 py-3 text-start font-semibold text-white">{t('reportsPage.detailed.tableHeaders.client')}</th>
                            <th className="px-4 py-3 text-start font-semibold text-white">{t('reportsPage.detailed.tableHeaders.project')}</th>
                            <th className="px-4 py-3 text-end font-semibold text-white">{t('reportsPage.detailed.tableHeaders.duration')}</th>
                            <th className="px-4 py-3 text-end font-semibold text-white">{t('reportsPage.detailed.tableHeaders.earnings')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredEntries.map(entry => (
                            <tr key={entry.id} className="block md:table-row mb-2 md:mb-0 hover:bg-gray-700/50">
                                <td data-label={t('reportsPage.detailed.tableHeaders.date')} className="px-4 py-3 block md:table-cell before:content-[attr(data-label)] md:before:hidden before:font-bold before:uppercase before:text-xs before:text-gray-400 before:block">{formatDate(entry.startTime, language)}</td>
                                <td data-label={t('reportsPage.detailed.tableHeaders.description')} className="px-4 py-3 block md:table-cell font-medium text-white before:content-[attr(data-label)] md:before:hidden before:font-bold before:uppercase before:text-xs before:text-gray-400 before:block">{entry.description}</td>
                                <td data-label={t('reportsPage.detailed.tableHeaders.client')} className="px-4 py-3 block md:table-cell before:content-[attr(data-label)] md:before:hidden before:font-bold before:uppercase before:text-xs before:text-gray-400 before:block">{getClientNameFromProject(entry.projectId)}</td>
                                <td data-label={t('reportsPage.detailed.tableHeaders.project')} className="px-4 py-3 block md:table-cell before:content-[attr(data-label)] md:before:hidden before:font-bold before:uppercase before:text-xs before:text-gray-400 before:block">{getProjectName(entry.projectId)}</td>
                                <td data-label={t('reportsPage.detailed.tableHeaders.duration')} className="px-4 py-3 block md:table-cell text-end md:text-start before:content-[attr(data-label)] md:before:hidden before:font-bold before:uppercase before:text-xs before:text-gray-400 before:float-left rtl:before:float-right font-mono">{formatDuration(entry.endTime - entry.startTime)}</td>
                                <td data-label={t('reportsPage.detailed.tableHeaders.earnings')} className="px-4 py-3 block md:table-cell text-end md:text-start before:content-[attr(data-label)] md:before:hidden before:font-bold before:uppercase before:text-xs before:text-gray-400 before:float-left rtl:before:float-right font-mono text-green-400">{formatCurrency(calculateEntryEarnings(entry, projects), language)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-500">{t('reportsPage.detailed.noResults')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
