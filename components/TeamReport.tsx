import React, { useMemo } from 'react';
import { TimeEntry, Project, User, TeamMemberReport } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCurrency, formatDuration, calculateEntryEarnings } from '../utils/time';

interface TeamReportProps {
    entries: TimeEntry[];
    projects: Project[];
    users: User[];
}

export const TeamReport: React.FC<TeamReportProps> = ({ entries, projects, users }) => {
    const { t, language } = useLanguage();

    const teamReportData: TeamMemberReport[] = useMemo(() => {
        return users.map(user => {
            const userEntries = entries.filter(e => e.userId === user.id);
            const timeLogged = userEntries.reduce((sum, e) => sum + (e.endTime - e.startTime), 0);
            const totalEarnings = userEntries.reduce((sum, e) => sum + calculateEntryEarnings(e, projects), 0);

            return {
                id: user.id,
                name: user.name,
                avatarUrl: user.avatarUrl,
                timeLogged: formatDuration(timeLogged),
                totalEarnings: formatCurrency(totalEarnings, language)
            };
        }).sort((a,b) => a.name.localeCompare(b.name));
    }, [users, entries, projects, language]);

    return (
        <div>
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">{t('reportsPage.teamReport.title')}</h3>
                <p className="text-gray-400 text-sm">{t('reportsPage.teamReport.description')}</p>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
                <table className="min-w-full divide-y-0 md:divide-y divide-gray-700">
                    <thead className="hidden md:table-header-group bg-gray-900">
                        <tr>
                            <th scope="col" className="py-3.5 ps-4 pe-3 text-start text-sm font-semibold text-white sm:ps-6">{t('reportsPage.teamReport.headers.member')}</th>
                            <th scope="col" className="px-3 py-3.5 text-end text-sm font-semibold text-white">{t('reportsPage.teamReport.headers.timeLogged')}</th>
                            <th scope="col" className="px-3 py-3.5 text-end text-sm font-semibold text-white">{t('reportsPage.teamReport.headers.totalEarnings')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {teamReportData.map(member => (
                            <tr key={member.id} className="block md:table-row">
                                <td data-label={t('reportsPage.teamReport.headers.member')} className="whitespace-nowrap py-3 md:py-4 ps-4 pe-3 text-sm font-medium text-white sm:ps-6 block md:table-cell before:content-[attr(data-label)] before:block before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">
                                    <div className="flex items-center gap-3">
                                        <img src={member.avatarUrl} alt={member.name} className="h-8 w-8 rounded-full" />
                                        <span>{member.name}</span>
                                    </div>
                                </td>
                                <td data-label={t('reportsPage.teamReport.headers.timeLogged')} className="whitespace-nowrap px-3 py-3 md:py-4 text-sm text-gray-300 font-mono block md:table-cell text-end before:content-[attr(data-label)] before:float-left rtl:before:float-right before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">{member.timeLogged}</td>
                                <td data-label={t('reportsPage.teamReport.headers.totalEarnings')} className="whitespace-nowrap px-3 py-3 md:py-4 text-sm text-green-400 font-semibold font-mono block md:table-cell text-end before:content-[attr(data-label)] before:float-left rtl:before:float-right before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">{member.totalEarnings}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
