import React, { useMemo, useState } from 'react';
import { TimeEntry, Project, Client, ProjectReport } from '../types';
import {
    formatCurrency,
    formatDuration,
    calculateEntryEarnings,
    getWeeklyEarnings,
    TimeFilterPeriod,
    filterEntriesByPeriod,
    getChartDataForPeriod,
    getChartLabelsForPeriod,
    calculateProductivityTrends,
    getDailyProductivityData,
    getProductivityChartLabels
} from '../utils/time';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { ProductivityChart } from './ProductivityChart';

interface SummaryReportProps {
    entries: TimeEntry[];
    projects: Project[];
    clients: Client[];
}

export const SummaryReport: React.FC<SummaryReportProps> = ({ entries, projects, clients }) => {
    const { t, language } = useLanguage();
    const { preferences } = useUserPreferences();
    const [selectedPeriod, setSelectedPeriod] = useState<TimeFilterPeriod>('all');

    // Filter entries based on selected time period
    const filteredEntries = useMemo(() =>
        filterEntriesByPeriod(entries, selectedPeriod),
        [entries, selectedPeriod]
    );

    const totalHours = useMemo(() =>
        filteredEntries.reduce((acc, e) => acc + (e.endTime - e.startTime), 0),
        [filteredEntries]
    );

    const totalEarnings = useMemo(() => {
        return filteredEntries.reduce((acc, entry) => acc + calculateEntryEarnings(entry, projects), 0);
    }, [filteredEntries, projects]);

    // Get chart data based on selected period
    const chartData = useMemo(() =>
        getChartDataForPeriod(filteredEntries, projects, selectedPeriod, preferences.firstDayOfWeek),
        [filteredEntries, projects, selectedPeriod, preferences.firstDayOfWeek]
    );

    const chartLabels = useMemo(() =>
        getChartLabelsForPeriod(selectedPeriod),
        [selectedPeriod]
    );

    const maxChartValue = useMemo(() => Math.max(...chartData, 1), [chartData]);

    const { productivityPercentage, productivityTrend } = useMemo(() => {
        return calculateProductivityTrends(filteredEntries, entries, selectedPeriod);
    }, [filteredEntries, entries, selectedPeriod]);

    // Get productivity chart data
    const productivityChartData = useMemo(() =>
        getDailyProductivityData(filteredEntries, selectedPeriod),
        [filteredEntries, selectedPeriod]
    );

    const productivityChartLabels = useMemo(() =>
        getProductivityChartLabels(selectedPeriod),
        [selectedPeriod]
    );


    const projectReports: ProjectReport[] = useMemo(() => {
        const reports: { [key: string]: { time: number, earnings: number } } = {};

        filteredEntries.forEach(entry => {
            if (!entry.projectId) return;

            if (!reports[entry.projectId]) {
                reports[entry.projectId] = { time: 0, earnings: 0 };
            }

            reports[entry.projectId].time += (entry.endTime - entry.startTime);
            reports[entry.projectId].earnings += calculateEntryEarnings(entry, projects);
        });

        const sortedReports = Object.keys(reports)
            .map(projectId => ({
                projectId,
                ...reports[projectId]
            }))
            .sort((a, b) => b.earnings - a.earnings);


        return sortedReports.map(({projectId, time, earnings}) => {
            const project = projects.find(p => p.id === projectId);
            return {
                id: projectId,
                name: project?.name || 'Unknown Project',
                timeSpent: formatDuration(time),
                totalEarnings: formatCurrency(earnings, language),
                progress: 0 // Placeholder for now
            };
        });

    }, [filteredEntries, projects, language]);

    const clientReports = useMemo(() => {
        return clients.map(client => {
            const clientProjects = projects.filter(p => p.clientId === client.id);
            const projectIds = clientProjects.map(p => p.id);
            const clientEntries = filteredEntries.filter(e => e.projectId && projectIds.includes(e.projectId));

            const timeLogged = clientEntries.reduce((acc, e) => acc + (e.endTime - e.startTime), 0);
            const earnings = clientEntries.reduce((acc, e) => acc + calculateEntryEarnings(e, projects), 0);

            return {
                id: client.id,
                name: client.name,
                timeLogged: formatDuration(timeLogged),
                totalEarnings: formatCurrency(earnings, language),
            };
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [clients, projects, filteredEntries, language]);


    // Show empty state if no entries at all
    if (entries.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white mb-4">{t('reportsPage.summaryTitle')}</h3>
                </div>
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-12">
                    <div className="text-gray-400 mb-4">
                        <span className="material-symbols-outlined text-6xl">analytics</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Time Entries Yet</h3>
                    <p className="text-gray-400 mb-6">Start tracking your time to see detailed reports and analytics.</p>
                    <div className="text-sm text-gray-500">
                        <p>• Track time with the timer on the Dashboard</p>
                        <p>• Add manual time entries for past work</p>
                        <p>• Create projects and clients to organize your work</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">{t('reportsPage.summaryTitle')}</h3>
                <div className="max-w-xs">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value as TimeFilterPeriod)}
                        className="form-select w-full rounded-lg border-gray-600 bg-gray-800 text-white focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                    >
                        <option value="all">{t('reportsPage.timeFilter.all')}</option>
                        <option value="30days">{t('reportsPage.timeFilter.30days')}</option>
                        <option value="quarter">{t('reportsPage.timeFilter.quarter')}</option>
                        <option value="year">{t('reportsPage.timeFilter.year')}</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-white">{t('reportsPage.totalEarningsTitle')}</h4>
                        <span className="text-sm text-gray-400">{t(`reportsPage.timeFilter.${selectedPeriod}`)}</span>
                    </div>
                    <p className="mt-2 text-4xl font-bold text-white">{formatCurrency(totalEarnings, language)}</p>
                    <div className="mt-1 flex items-center gap-1 text-sm font-medium text-gray-400">
                        <span>{t('reportsPage.totalTime', { duration: formatDuration(totalHours) })}</span>
                    </div>
                    <div className="mt-6 h-48">
                        <div className="grid h-full grid-flow-col items-end justify-items-center gap-1 sm:gap-2">
                            {chartData.map((earning, index) => (
                                <div key={index} className="w-full rounded-t-md bg-[var(--primary-color)] transition-all" style={{height: `${(earning / maxChartValue) * 100}%`}}></div>
                            ))}
                        </div>
                        <div className="mt-2 grid grid-flow-col justify-items-center gap-1 text-xs text-gray-400 sm:gap-2">
                            {chartLabels.map((label, index) => (
                                <span key={index} className="truncate" title={label}>{label}</span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-white">{t('reportsPage.productivityTitle')}</h4>
                        <span className="text-sm text-gray-400">{t(`reportsPage.timeFilter.${selectedPeriod}`)}</span>
                    </div>
                    {filteredEntries.length > 0 ? (
                        <>
                            <p className="mt-2 text-4xl font-bold text-white">
                                {isNaN(productivityPercentage) ? '0' : productivityPercentage}%
                            </p>
                            {!isNaN(productivityTrend) ? (
                                <div className={`mt-1 flex items-center gap-1 text-sm font-medium ${productivityTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    <span className="material-symbols-outlined text-base"> {productivityTrend >= 0 ? 'trending_up' : 'trending_down'} </span>
                                    <span>{Math.abs(productivityTrend)}%</span>
                                </div>
                            ) : (
                                <div className="mt-1 flex items-center gap-1 text-sm font-medium text-gray-400">
                                    <span className="material-symbols-outlined text-base">info</span>
                                    <span>No comparison data</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="mt-2 text-4xl font-bold text-gray-500">--</p>
                            <div className="mt-1 flex items-center gap-1 text-sm font-medium text-gray-400">
                                <span className="material-symbols-outlined text-base">info</span>
                                <span>No time entries for this period</span>
                            </div>
                        </>
                    )}
                    <div className="mt-6 h-48">
                        <ProductivityChart
                            data={productivityChartData}
                            labels={productivityChartLabels}
                        />
                    </div>
                </div>
            </div>
            <div className="mt-12">
                <h3 className="text-xl font-semibold text-white mb-4">{t('reportsPage.projectSummaryTitle')}</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
                    <table className="min-w-full divide-y-0 md:divide-y divide-gray-700">
                        <thead className="hidden md:table-header-group bg-gray-900">
                            <tr>
                                <th className="py-3.5 ps-4 pe-3 text-start text-sm font-semibold text-white sm:ps-6" scope="col">{t('reportsPage.projectSummaryHeaders.project')}</th>
                                <th className="px-3 py-3.5 text-start text-sm font-semibold text-white" scope="col">{t('reportsPage.projectSummaryHeaders.timeSpent')}</th>
                                <th className="px-3 py-3.5 text-start text-sm font-semibold text-white" scope="col">{t('reportsPage.projectSummaryHeaders.totalEarnings')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {projectReports.map(p => (
                                <tr key={p.id} className="block md:table-row">
                                    <td data-label={t('reportsPage.projectSummaryHeaders.project')} className="whitespace-nowrap py-3 md:py-4 ps-4 pe-3 text-sm font-medium text-white sm:ps-6 block md:table-cell before:content-[attr(data-label)] before:block before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">{p.name}</td>
                                    <td data-label={t('reportsPage.projectSummaryHeaders.timeSpent')} className="whitespace-nowrap px-3 py-3 md:py-4 text-sm text-gray-400 block md:table-cell text-end md:text-start before:content-[attr(data-label)] before:float-left rtl:before:float-right before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">{p.timeSpent}</td>
                                    <td data-label={t('reportsPage.projectSummaryHeaders.totalEarnings')} className="whitespace-nowrap px-3 py-3 md:py-4 text-sm text-green-400 font-semibold block md:table-cell text-end md:text-start before:content-[attr(data-label)] before:float-left rtl:before:float-right before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">{p.totalEarnings}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             <div className="mt-12">
                <h3 className="text-xl font-semibold text-white mb-4">{t('reportsPage.clientSummaryTitle')}</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
                    <table className="min-w-full divide-y-0 md:divide-y divide-gray-700">
                        <thead className="hidden md:table-header-group bg-gray-900">
                            <tr>
                                <th className="py-3.5 ps-4 pe-3 text-start text-sm font-semibold text-white sm:ps-6" scope="col">{t('reportsPage.clientSummaryHeaders.client')}</th>
                                <th className="px-3 py-3.5 text-start text-sm font-semibold text-white" scope="col">{t('reportsPage.clientSummaryHeaders.timeLogged')}</th>
                                <th className="px-3 py-3.5 text-start text-sm font-semibold text-white" scope="col">{t('reportsPage.clientSummaryHeaders.totalEarnings')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {clientReports.map(report => (
                                <tr key={report.id} className="block md:table-row">
                                    <td data-label={t('reportsPage.clientSummaryHeaders.client')} className="whitespace-nowrap py-3 md:py-4 ps-4 pe-3 text-sm font-medium text-white sm:ps-6 block md:table-cell before:content-[attr(data-label)] before:block before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">{report.name}</td>
                                    <td data-label={t('reportsPage.clientSummaryHeaders.timeLogged')} className="whitespace-nowrap px-3 py-3 md:py-4 text-sm text-gray-400 block md:table-cell text-end md:text-start before:content-[attr(data-label)] before:float-left rtl:before:float-right before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">{report.timeLogged}</td>
                                    <td data-label={t('reportsPage.clientSummaryHeaders.totalEarnings')} className="whitespace-nowrap px-3 py-3 md:py-4 text-sm text-green-400 font-semibold block md:table-cell text-end md:text-start before:content-[attr(data-label)] before:float-left rtl:before:float-right before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">{report.totalEarnings}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
