import React from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { StopIcon } from './icons/StopIcon';
import { formatDurationClock } from '../utils/time';
import { Project, Task } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface TimerInputProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  onStart: () => void;
  onStop: () => void;
  isActive: boolean;
  elapsedTime: number;
  projects: Project[];
  tasks: Task[];
  selectedProjectId?: string;
  onProjectChange: (projectId: string) => void;
  selectedTaskId?: string;
  onTaskChange: (taskId: string) => void;
  isTimerBillable: boolean;
  onBillableChange: (isBillable: boolean) => void;
}

export const TimerInput: React.FC<TimerInputProps> = ({
  description,
  onDescriptionChange,
  onStart,
  onStop,
  isActive,
  elapsedTime,
  projects,
  tasks,
  selectedProjectId,
  onProjectChange,
  selectedTaskId,
  onTaskChange,
  isTimerBillable,
  onBillableChange
}) => {
  const { t } = useLanguage();
  
  const handleToggle = () => {
    if (isActive) {
      onStop();
    } else {
      if (!selectedProjectId) {
          alert(t('timer.alertSelectProject'));
          return;
      }
      onStart();
    }
  };

  const filteredTasks = tasks.filter(task => task.projectId === selectedProjectId);

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg p-4 mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
            <input
                type="text"
                placeholder={t('timer.placeholder')}
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                className="w-full flex-grow bg-transparent text-lg text-white placeholder-gray-500 focus:outline-none"
            />
            <div className="flex w-full sm:w-auto items-center space-x-4 rtl:space-x-reverse">
                <span className="text-2xl font-mono font-semibold text-white w-full sm:w-32 text-end">
                {formatDurationClock(elapsedTime)}
                </span>
                <button
                onClick={handleToggle}
                className={`w-16 h-10 flex items-center justify-center rounded-md text-white font-semibold transition-colors duration-200
                    ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                aria-label={isActive ? t('timer.stopLabel') : t('timer.startLabel')}
                >
                {isActive ? <StopIcon /> : <PlayIcon />}
                </button>
            </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 text-sm">
            <select
                value={selectedProjectId || ''}
                onChange={(e) => onProjectChange(e.target.value)}
                className="form-select w-full flex-1 rounded-md border-gray-600 bg-gray-700 text-white focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]"
            >
                <option value="" disabled>{t('timer.selectProject')}</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
             <select
                value={selectedTaskId || ''}
                onChange={(e) => onTaskChange(e.target.value)}
                className="form-select w-full flex-1 rounded-md border-gray-600 bg-gray-700 text-white focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)]"
                disabled={!selectedProjectId}
            >
                <option value="">{t('timer.selectTask')}</option>
                {filteredTasks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <label className="flex items-center gap-2 text-white cursor-pointer whitespace-nowrap justify-center sm:justify-start">
                <input 
                    type="checkbox"
                    className="form-checkbox h-5 w-5 rounded bg-gray-700 border-gray-600 text-[var(--primary-color)] focus:ring-offset-gray-800 focus:ring-[var(--primary-color)]"
                    checked={isTimerBillable}
                    onChange={(e) => onBillableChange(e.target.checked)}
                />
                {t('timer.billable')}
            </label>
        </div>
    </div>
  );
};