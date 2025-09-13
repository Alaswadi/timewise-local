import React from 'react';
import { TimeEntry, Project, Task } from '../types';
import { formatDuration, formatCurrency, calculateEntryEarnings } from '../utils/time';
import { PlayIcon } from './icons/PlayIcon';
import { TrashIcon } from './icons/TrashIcon';
import { DollarIcon } from './icons/DollarIcon';
import { ManualIcon } from './icons/ManualIcon';
import { useLanguage } from '../contexts/LanguageContext';

interface TimeEntryItemProps {
  entry: TimeEntry;
  onDelete: (id: string) => void;
  onRestart?: (entry: TimeEntry) => void;
  projects: Project[];
  tasks: Task[];
}

export const TimeEntryItem: React.FC<TimeEntryItemProps> = ({ entry, onDelete, onRestart, projects, tasks }) => {
  const { t, language } = useLanguage();
  const projectName = projects.find(p => p.id === entry.projectId)?.name || t('timeEntry.noProject');
  const taskName = tasks.find(t => t.id === entry.taskId)?.name;
  const earnings = calculateEntryEarnings(entry, projects);

  return (
    <div className="bg-gray-800/50 hover:bg-gray-800 transition-colors duration-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex-1 overflow-hidden w-full">
        <div className="flex items-center gap-2">
          <p className="text-white font-medium truncate">{entry.description}</p>
          {entry.isManual && (
            <span className="text-blue-400" title="Manual Entry">
              <ManualIcon />
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 truncate">
          {projectName} {taskName && <>&bull; {taskName}</>}
        </p>
      </div>
      <div className="flex items-center space-x-4 rtl:space-x-reverse w-full sm:w-auto justify-end">
        {entry.billable && (
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                 {earnings > 0 && <span className="text-sm font-mono text-green-400">{formatCurrency(earnings, language)}</span>}
                <span className="text-green-400" title={t('timeEntry.billable')}><DollarIcon /></span>
            </div>
        )}
        <span className="font-mono font-semibold text-white">
          {formatDuration(entry.endTime - entry.startTime)}
        </span>
        {onRestart && (
            <button 
                onClick={() => onRestart(entry)}
                className="text-gray-400 hover:text-green-400 p-2 rounded-full hover:bg-gray-700/50 transition-colors"
                aria-label={t('timeEntry.restartLabel', { description: entry.description })}
            >
                <PlayIcon />
            </button>
        )}
        <button
          onClick={() => onDelete(entry.id)}
          className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-700/50 transition-colors"
          aria-label={t('timeEntry.deleteLabel', { description: entry.description })}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};