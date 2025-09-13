import React, { useState } from 'react';
import { TimeEntry, Project, Task } from '../types';
import { StatCard } from './StatCard';
import { WeeklyChart } from './WeeklyChart';
import { TimeEntryList } from './TimeEntryList';
import { TimerInput } from './TimerInput';
import { ManualTimeEntryModal } from './ManualTimeEntryModal';
import { PlusIcon } from './icons/PlusIcon';
import { getTodayDateString, getTodayEntries, getWeeklySummary, formatDuration, formatCurrency, calculateEntryEarnings } from '../utils/time';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';

interface ManualTimeEntryData {
  description: string;
  projectId: string;
  taskId?: string;
  date: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
  billable: boolean;
}

interface DashboardProps {
  entries: TimeEntry[];
  description: string;
  onDescriptionChange: (value: string) => void;
  onStart: () => void;
  onStop: () => void;
  onDelete: (id: string) => void;
  isActive: boolean;
  elapsedTime: number;
  onRestart: (entry: TimeEntry) => void;
  projects: Project[];
  tasks: Task[];
  selectedProjectId?: string;
  onProjectChange: (projectId: string) => void;
  selectedTaskId?: string;
  onTaskChange: (taskId: string) => void;
  isTimerBillable: boolean;
  onBillableChange: (isBillable: boolean) => void;
  onManualEntryAdd: (data: ManualTimeEntryData) => void;
}

export const Dashboard: React.FC<DashboardProps> = (props) => {
  const { t, language } = useLanguage();
  const { preferences } = useUserPreferences();
  const [isManualEntryModalOpen, setIsManualEntryModalOpen] = useState(false);
  const todayEntries = getTodayEntries(props.entries);
  
  const totalTimeToday = todayEntries.reduce((sum, entry) => sum + (entry.endTime - entry.startTime), 0);
  const billableTimeToday = todayEntries
    .filter(entry => entry.billable)
    .reduce((sum, entry) => sum + (entry.endTime - entry.startTime), 0);
  const nonBillableTimeToday = totalTimeToday - billableTimeToday;

  const totalEarnedToday = todayEntries.reduce((sum, entry) => {
    return sum + calculateEntryEarnings(entry, props.projects);
  }, 0);

  const handleManualEntryAdd = (data: ManualTimeEntryData) => {
    props.onManualEntryAdd(data);
    setIsManualEntryModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <TimerInput
        description={props.description}
        onDescriptionChange={props.onDescriptionChange}
        onStart={props.onStart}
        onStop={props.onStop}
        isActive={props.isActive}
        elapsedTime={props.elapsedTime}
        projects={props.projects}
        tasks={props.tasks}
        selectedProjectId={props.selectedProjectId}
        onProjectChange={props.onProjectChange}
        selectedTaskId={props.selectedTaskId}
        onTaskChange={props.onTaskChange}
        isTimerBillable={props.isTimerBillable}
        onBillableChange={props.onBillableChange}
      />

      {/* Manual Time Entry Button */}
      <div className="mb-8 flex justify-end">
        <button
          onClick={() => setIsManualEntryModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/80 text-white rounded-lg transition-colors font-medium"
        >
          <PlusIcon />
          {t('manualEntry.button')}
        </button>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-100">{t('dashboard.title')}</h1>
        <p className="text-neutral-400">{getTodayDateString(language)}</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title={t('dashboard.stats.totalTime')} time={formatDuration(totalTimeToday)} />
        <StatCard title={t('dashboard.stats.billableTime')} time={formatDuration(billableTimeToday)} />
        <StatCard title={t('dashboard.stats.earnedToday')} time={formatCurrency(totalEarnedToday, language)} />
        <StatCard title={t('dashboard.stats.nonBillableTime')} time={formatDuration(nonBillableTimeToday)} />
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-neutral-100 mb-4">{t('dashboard.today')}</h2>
        <TimeEntryList 
            entries={todayEntries} 
            onDelete={props.onDelete} 
            onRestart={props.onRestart}
            projects={props.projects}
            tasks={props.tasks}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-neutral-100 mb-4">{t('dashboard.thisWeek')}</h2>
        <WeeklyChart data={getWeeklySummary(props.entries, preferences.firstDayOfWeek)} firstDayOfWeek={preferences.firstDayOfWeek} />
      </section>

      {/* Manual Time Entry Modal */}
      <ManualTimeEntryModal
        isOpen={isManualEntryModalOpen}
        onClose={() => setIsManualEntryModalOpen(false)}
        onSave={handleManualEntryAdd}
        projects={props.projects}
        tasks={props.tasks}
      />
    </div>
  );
};