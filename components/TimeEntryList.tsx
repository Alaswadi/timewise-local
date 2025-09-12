import React from 'react';
import { TimeEntry, Project, Task } from '../types';
import { TimeEntryItem } from './TimeEntryItem';
import { useLanguage } from '../contexts/LanguageContext';

interface TimeEntryListProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void;
  onRestart: (entry: TimeEntry) => void;
  projects: Project[];
  tasks: Task[];
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({ entries, onDelete, onRestart, projects, tasks }) => {
  const { t } = useLanguage();
  if (entries.length === 0) {
    return (
      <div className="text-center py-10 px-6 bg-gray-800/50 rounded-lg">
        <p className="text-gray-500">{t('dashboard.noEntries')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map(entry => (
        <TimeEntryItem key={entry.id} entry={entry} onDelete={onDelete} onRestart={onRestart} projects={projects} tasks={tasks} />
      ))}
    </div>
  );
};