import React, { useState, useMemo } from 'react';
import { TimeEntry, Project, Client } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency, formatDuration, calculateEntryEarnings } from '../utils/time';
import { ComparisonChart } from './ComparisonChart';

interface CompareReportProps {
    entries: TimeEntry[];
    projects: Project[];
    clients: Client[];
}

const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const CompareReport: React.FC<CompareReportProps> = ({ entries, projects, clients }) => {
    const { t, language } = useLanguage();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [compareBy, setCompareBy] = useState<'projects' | 'clients'>('projects');
    const [startDate, setStartDate] = useState(formatDateForInput(thirtyDaysAgo));
    const [endDate, setEndDate] = useState(formatDateForInput(new Date()));

    const comparisonData = useMemo(() => {
        const start = startDate ? new Date(startDate).getTime() : 0;
        const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Date.now();

        const filteredEntries = entries.filter(entry => {
            const entryTime = new Date(entry.startTime).getTime();
            return entryTime >= start && entryTime <= end;
        });

        const aggregation: { [key: string]: { name: string, timeLogged: number, billableTime: number, totalEarnings: number } } = {};

        if (compareBy === 'projects') {
            projects.forEach(p => {
                aggregation[p.id] = { name: p.name, timeLogged: 0, billableTime: 0, totalEarnings: 0 };
            });
            filteredEntries.forEach(entry => {
                if (entry.projectId && aggregation[entry.projectId]) {
                    const duration = entry.endTime - entry.startTime;
                    aggregation[entry.projectId].timeLogged += duration;
                    if (entry.billable) {
                        aggregation[entry.projectId].billableTime += duration;
                    }
                    aggregation[entry.projectId].totalEarnings += calculateEntryEarnings(entry, projects);
                }
            });
        } else { // compare by clients
            clients.forEach(c => {
                aggregation[c.id] = { name: c.name, timeLogged: 0, billableTime: 0, totalEarnings: 0 };
            });
            const projectToClientMap = Object.fromEntries(projects.map(p => [p.id, p.clientId]));
            filteredEntries.forEach(entry => {
                const clientId = entry.projectId ? projectToClientMap[entry.projectId] : undefined;
                if (clientId && aggregation[clientId]) {
                    const duration = entry.endTime - entry.startTime;
                    aggregation[clientId].timeLogged += duration;
                    if (entry.billable) {
                        aggregation[clientId].billableTime += duration;
                    }
                    aggregation[clientId].totalEarnings += calculateEntryEarnings(entry, projects);
                }
            });
        }
        
        return Object.values(aggregation)
            .filter(item => item.timeLogged > 0)
            .sort((a, b) => b.totalEarnings - a.totalEarnings);

    }, [compareBy, startDate, endDate, entries, projects, clients]);
    
    const chartData = useMemo(() => {
        return comparisonData.map(item => ({
            label: item.name,
            value: item.totalEarnings
        }));
    }, [comparisonData]);

    return (
        <div>
            <div className="bg-gray-800/50 rounded-lg p-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs text-gray-400">{t('reportsPage.compare.controls.compareBy')}</label>
                        <select value={compareBy} onChange={e => setCompareBy(e.target.value as any)} className="form-select w-full mt-1 rounded-md border-gray-600 bg-gray-700 text-white focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]">
                            <option value="projects">{t('reportsPage.compare.controls.projects')}</option>
                            <option value="clients">{t('reportsPage.compare.controls.clients')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">{t('reportsPage.compare.controls.from')}</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input w-full mt-1 rounded-md border-gray-600 bg-gray-700 text-white focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">{t('reportsPage.compare.controls.to')}</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input w-full mt-1 rounded-md border-gray-600 bg-gray-700 text-white focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]" />
                    </div>
                </div>
            </div>

            {comparisonData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
                        <table className="min-w-full divide-y divide-gray-700 text-sm">
                            <thead className="bg-gray-900">
                                <tr>
                                    <th className="px-4 py-3 text-start font-semibold text-white">{t('reportsPage.compare.tableHeaders.name')}</th>
                                    <th className="px-4 py-3 text-end font-semibold text-white">{t('reportsPage.compare.tableHeaders.timeLogged')}</th>
                                    <th className="px-4 py-3 text-end font-semibold text-white">{t('reportsPage.compare.tableHeaders.totalEarnings')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {comparisonData.map(item => (
                                    <tr key={item.name}>
                                        <td className="px-4 py-3 font-medium text-white whitespace-nowrap">{item.name}</td>
                                        <td className="px-4 py-3 text-end font-mono">{formatDuration(item.timeLogged)}</td>
                                        <td className="px-4 py-3 text-end font-mono text-green-400">{formatCurrency(item.totalEarnings, language)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                        <h4 className="text-lg font-medium text-white mb-4">{t('reportsPage.compare.chartTitle')}</h4>
                        <ComparisonChart data={chartData} />
                    </div>
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-800 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-semibold text-white">{t('reportsPage.compare.noData')}</h3>
                </div>
            )}
        </div>
    );
};
