import React from 'react';
import { Project, Task, TimeEntry } from '../types';
import { formatDate, formatDuration, formatTime, formatCurrency, calculateEntryEarnings } from '../utils/time';
import { TrashIcon } from './icons/TrashIcon';
import { DollarIcon } from './icons/DollarIcon';
import { ManualIcon } from './icons/ManualIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface TimeEntryTableProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void;
  projects: Project[];
  tasks: Task[];
}

export const TimeEntryTable: React.FC<TimeEntryTableProps> = ({ entries, onDelete, projects, tasks }) => {
  const { t, language } = useLanguage();
  const getProjectName = (projectId?: string) => projectId ? projects.find(p => p.id === projectId)?.name : t('list.notApplicable');
  const getTaskName = (taskId?: string) => taskId ? tasks.find(t => t.id === taskId)?.name : t('list.notApplicable');
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-start text-gray-300">
          <thead className="bg-gray-700/50 text-xs text-gray-400 uppercase tracking-wider hidden md:table-header-group">
            <tr>
              <th scope="col" className="px-6 py-3">{t('list.description')}</th>
              <th scope="col" className="px-6 py-3">{t('list.project')}</th>
              <th scope="col" className="px-6 py-3">{t('list.date')}</th>
              <th scope="col" className="px-6 py-3 text-end">{t('list.duration')}</th>
              <th scope="col" className="px-6 py-3 text-end">{t('list.earnings')}</th>
              <th scope="col" className="px-6 py-3 text-center">{t('list.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 md:divide-none">
            {entries.map((entry) => (
              <tr key={entry.id} className="block md:table-row mb-4 md:mb-0 hover:bg-gray-700/50 transition-colors duration-200">
                <td data-label={t('list.description')} className="px-6 py-3 md:py-4 font-medium text-gray-100 whitespace-nowrap block md:table-cell text-start before:content-[attr(data-label)] before:block before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">
                  <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span>{entry.description}</span>
                        {entry.isManual && (
                          <span className="text-blue-400" title="Manual Entry">
                            <ManualIcon />
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 md:hidden mt-1">{getProjectName(entry.projectId)} {getTaskName(entry.taskId) !== t('list.notApplicable') && `> ${getTaskName(entry.taskId)}`}</span>
                  </div>
                </td>
                <td data-label={t('list.project')} className="px-6 py-3 md:py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="flex flex-col">
                        <span>{getProjectName(entry.projectId)}</span>
                        {getTaskName(entry.taskId) !== t('list.notApplicable') && <span className="text-xs text-gray-400">{getTaskName(entry.taskId)}</span>}
                    </div>
                </td>
                <td data-label={t('list.date')} className="px-6 py-3 md:py-4 whitespace-nowrap block md:table-cell before:content-[attr(data-label)] before:block before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">
                    {formatDate(entry.startTime, language)} at {formatTime(entry.startTime, language)}
                </td>
                <td data-label={t('list.duration')} className="px-6 py-3 md:py-4 font-mono font-semibold text-white text-end whitespace-nowrap block md:table-cell before:content-[attr(data-label)] before:float-left rtl:before:float-right before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">
                  {formatDuration(entry.endTime - entry.startTime)}
                </td>
                <td data-label={t('list.earnings')} className="px-6 py-3 md:py-4 font-mono text-green-400 text-end whitespace-nowrap block md:table-cell before:content-[attr(data-label)] before:float-left rtl:before:float-right before:font-bold before:text-xs before:uppercase before:text-gray-400 md:before:hidden mb-2 md:mb-0">
                  {entry.billable ? formatCurrency(calculateEntryEarnings(entry, projects), language) : t('list.notApplicable')}
                </td>
                <td data-label={t('list.actions')} className="px-6 py-3 md:py-4 text-end md:text-center block md:table-cell">
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="text-gray-500 hover:text-red-500 transition-colors duration-200 p-2 rounded-full hover:bg-gray-900/50"
                    aria-label={t('timeEntry.deleteLabel', { description: entry.description })}
                  >
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};