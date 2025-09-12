import React, { useMemo } from 'react';
import { TimeEntry, Project, Client, ProjectReport } from '../types';
import { formatCurrency, formatDuration, calculateEntryEarnings, getWeeklyEarnings } from '../utils/time';
import { useLanguage } from '../contexts/LanguageContext';

interface SummaryReportProps {
    entries: TimeEntry[];
    projects: Project[];
    clients: Client[];
}

export const SummaryReport: React.FC<SummaryReportProps> = ({ entries, projects, clients }) => {
    const { t, language } = useLanguage();

    const totalHours = useMemo(() => entries.reduce((acc, e) => acc + (e.endTime - e.startTime), 0), [entries]);
    
    const totalEarnings = useMemo(() => {
        return entries.reduce((acc, entry) => acc + calculateEntryEarnings(entry, projects), 0);
    }, [entries, projects]);

    const weeklyEarnings = useMemo(() => getWeeklyEarnings(entries, projects), [entries, projects]);
    const maxWeeklyEarning = useMemo(() => Math.max(...weeklyEarnings, 1), [weeklyEarnings]);

    const { productivityPercentage, productivityTrend } = useMemo(() => {
        const totalBillableTime = entries
            .filter(e => e.billable)
            .reduce((acc, e) => acc + (e.endTime - e.startTime), 0);
        
        const productivity = totalHours > 0 ? (totalBillableTime / totalHours) * 100 : 0;

        const now = new Date();
        const last7DaysStart = new Date();
        last7DaysStart.setDate(now.getDate() - 7);
        const prev7DaysStart = new Date();
        prev7DaysStart.setDate(now.getDate() - 14);

        const entriesLast7Days = entries.filter(e => new Date(e.startTime) >= last7DaysStart && new Date(e.startTime) <= now);
        const entriesPrev7Days = entries.filter(e => new Date(e.startTime) >= prev7DaysStart && new Date(e.startTime) < last7DaysStart);
        
        const totalHoursLast7 = entriesLast7Days.reduce((sum, e) => sum + (e.endTime - e.startTime), 0);
        const billableHoursLast7 = entriesLast7Days.filter(e => e.billable).reduce((sum, e) => sum + (e.endTime - e.startTime), 0);
        const productivityLast7 = totalHoursLast7 > 0 ? (billableHoursLast7 / totalHoursLast7) * 100 : 0;

        const totalHoursPrev7 = entriesPrev7Days.reduce((sum, e) => sum + (e.endTime - e.startTime), 0);
        const billableHoursPrev7 = entriesPrev7Days.filter(e => e.billable).reduce((sum, e) => sum + (e.endTime - e.startTime), 0);
        const productivityPrev7 = totalHoursPrev7 > 0 ? (billableHoursPrev7 / totalHoursPrev7) * 100 : 0;

        const trend = productivityPrev7 > 0 ? productivityLast7 - productivityPrev7 : productivityLast7;

        return {
            productivityPercentage: Math.round(productivity),
            productivityTrend: Math.round(trend)
        };
    }, [entries, totalHours]);


    const projectReports: ProjectReport[] = useMemo(() => {
        const reports: { [key: string]: { time: number, earnings: number } } = {};

        entries.forEach(entry => {
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

    }, [entries, projects, language]);

    const clientReports = useMemo(() => {
        return clients.map(client => {
            const clientProjects = projects.filter(p => p.clientId === client.id);
            const projectIds = clientProjects.map(p => p.id);
            const clientEntries = entries.filter(e => e.projectId && projectIds.includes(e.projectId));
    
            const timeLogged = clientEntries.reduce((acc, e) => acc + (e.endTime - e.startTime), 0);
            const earnings = clientEntries.reduce((acc, e) => acc + calculateEntryEarnings(e, projects), 0);
    
            return {
                id: client.id,
                name: client.name,
                timeLogged: formatDuration(timeLogged),
                totalEarnings: formatCurrency(earnings, language),
            };
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [clients, projects, entries, language]);


    return (
        <div>
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">{t('reportsPage.summaryTitle')}</h3>
                <div className="max-w-xs">
                    <select className="form-select w-full rounded-lg border-gray-600 bg-gray-800 text-white focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]">
                        <option>{t('reportsPage.timeFilter.all')}</option>
                        <option>{t('reportsPage.timeFilter.30days')}</option>
                        <option>{t('reportsPage.timeFilter.quarter')}</option>
                        <option>{t('reportsPage.timeFilter.year')}</option>
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-white">{t('reportsPage.totalEarningsTitle')}</h4>
                        <span className="text-sm text-gray-400">{t('reportsPage.timeFilter.all')}</span>
                    </div>
                    <p className="mt-2 text-4xl font-bold text-white">{formatCurrency(totalEarnings, language)}</p>
                    <div className="mt-1 flex items-center gap-1 text-sm font-medium text-gray-400">
                        <span>{t('reportsPage.totalTime', { duration: formatDuration(totalHours) })}</span>
                    </div>
                    <div className="mt-6 h-48">
                        <div className="grid h-full grid-flow-col items-end justify-items-center gap-2 sm:gap-4">
                            {weeklyEarnings.map((earning, index) => (
                                <div key={index} className="w-full rounded-t-md bg-[var(--primary-color)] transition-all" style={{height: `${(earning / maxWeeklyEarning) * 100}%`}}></div>
                            ))}
                        </div>
                        <div className="mt-2 grid grid-cols-7 text-center text-xs font-medium text-gray-400">
                            <span>{t('calendar.weekdays.m')}</span>
                            <span>{t('calendar.weekdays.t')}</span>
                            <span>{t('calendar.weekdays.w')}</span>
                            <span>{t('calendar.weekdays.th')}</span>
                            <span>{t('calendar.weekdays.f')}</span>
                            <span>{t('calendar.weekdays.sa')}</span>
                            <span>{t('calendar.weekdays.s')}</span>
                        </div>
                    </div>
                </div>
                <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-white">{t('reportsPage.productivityTitle')}</h4>
                        <span className="text-sm text-gray-400">{t('reportsPage.last30days')}</span>
                    </div>
                    <p className="mt-2 text-4xl font-bold text-white">{productivityPercentage}%</p>
                    <div className={`mt-1 flex items-center gap-1 text-sm font-medium ${productivityTrend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        <span className="material-symbols-outlined text-base"> {productivityTrend >= 0 ? 'trending_up' : 'trending_down'} </span>
                        <span>{Math.abs(productivityTrend)}%</span>
                    </div>
                    <div className="mt-6 h-48">
                        <svg className="h-full w-full" fill="none" preserveAspectRatio="none" viewBox="0 0 472 150" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="var(--primary-color)" strokeLinecap="round" strokeWidth="3"></path>
                            <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H0V109Z" fill="url(#productivity-chart-gradient)"></path>
                            <defs><linearGradient gradientUnits="userSpaceOnUse" id="productivity-chart-gradient" x1="236" x2="236" y1="1" y2="149"><stop stopColor="var(--primary-color)" stopOpacity="0.3"></stop><stop offset="1" stopColor="var(--primary-color)" stopOpacity="0"></stop></linearGradient></defs>
                        </svg>
                        <div className="mt-2 flex justify-around text-xs font-medium text-gray-400"><span>W1</span><span>W2</span><span>W3</span><span>W4</span></div>
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
