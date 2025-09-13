import React, { useState, useEffect } from 'react';
import { Project, Task } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  parseDurationInput, 
  validateDateInput, 
  parseTimeInput, 
  calculateTimeRangeDuration,
  formatTimeForInput,
  createTimestampsFromDateAndTime,
  createTimestampsFromDateAndDuration
} from '../utils/time';

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

interface ManualTimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ManualTimeEntryData) => void;
  projects: Project[];
  tasks: Task[];
}

export const ManualTimeEntryModal: React.FC<ManualTimeEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  projects,
  tasks
}) => {
  const { t } = useLanguage();
  
  // Form state
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [date, setDate] = useState('');
  const [durationInput, setDurationInput] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [billable, setBillable] = useState(true);
  const [useTimeRange, setUseTimeRange] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setProjectId(projects[0]?.id || '');
      setTaskId('');
      setDate(new Date().toISOString().split('T')[0]); // Today's date
      setDurationInput('');
      setStartTime('09:00');
      setEndTime('17:00');
      setBillable(true);
      setUseTimeRange(false);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, projects]);

  // Filter tasks based on selected project
  const filteredTasks = tasks.filter(task => task.projectId === projectId);

  // Clear task selection when project changes
  useEffect(() => {
    if (projectId && !filteredTasks.find(task => task.id === taskId)) {
      setTaskId('');
    }
  }, [projectId, filteredTasks, taskId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Description validation
    if (!description.trim()) {
      newErrors.description = t('manualEntry.validation.descriptionRequired');
    }

    // Project validation
    if (!projectId) {
      newErrors.project = t('manualEntry.validation.projectRequired');
    }

    // Date validation
    const dateValidation = validateDateInput(date);
    if (!dateValidation.isValid) {
      if (dateValidation.error === 'Date is required') {
        newErrors.date = t('manualEntry.validation.dateRequired');
      } else if (dateValidation.error === 'Date cannot be in the future') {
        newErrors.date = t('manualEntry.validation.dateInFuture');
      } else {
        newErrors.date = dateValidation.error || 'Invalid date';
      }
    }

    if (useTimeRange) {
      // Time range validation
      if (!startTime) {
        newErrors.startTime = t('manualEntry.validation.startTimeRequired');
      }
      if (!endTime) {
        newErrors.endTime = t('manualEntry.validation.endTimeRequired');
      }
      
      if (startTime && endTime) {
        const timeRangeResult = calculateTimeRangeDuration(date, startTime, endTime);
        if (!timeRangeResult.duration) {
          if (timeRangeResult.error === 'Duration cannot exceed 24 hours') {
            newErrors.timeRange = t('manualEntry.validation.timeRangeTooLong');
          } else if (timeRangeResult.error === 'End time must be after start time') {
            newErrors.endTime = t('manualEntry.validation.endTimeBeforeStart');
          } else {
            newErrors.timeRange = timeRangeResult.error || 'Invalid time range';
          }
        }
      }
    } else {
      // Duration validation
      if (!durationInput.trim()) {
        newErrors.duration = t('manualEntry.validation.durationRequired');
      } else {
        const duration = parseDurationInput(durationInput);
        if (duration === null) {
          newErrors.duration = t('manualEntry.validation.durationInvalid');
        } else if (duration > 24 * 60 * 60 * 1000) { // 24 hours in milliseconds
          newErrors.duration = t('manualEntry.validation.durationTooLong');
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let timestamps: { startTimestamp: number; endTimestamp: number } | null = null;
      let duration: number;

      if (useTimeRange) {
        timestamps = createTimestampsFromDateAndTime(date, startTime, endTime);
        if (!timestamps) {
          setErrors({ timeRange: 'Failed to create timestamps from time range' });
          return;
        }
        duration = timestamps.endTimestamp - timestamps.startTimestamp;
      } else {
        duration = parseDurationInput(durationInput)!;
        timestamps = createTimestampsFromDateAndDuration(date, duration, startTime);
        if (!timestamps) {
          setErrors({ duration: 'Failed to create timestamps from duration' });
          return;
        }
      }

      const entryData: ManualTimeEntryData = {
        description: description.trim(),
        projectId,
        taskId: taskId || undefined,
        date,
        duration,
        startTime: useTimeRange ? startTime : undefined,
        endTime: useTimeRange ? endTime : undefined,
        billable
      };

      onSave(entryData);
      onClose();
    } catch (error) {
      console.error('Error submitting manual time entry:', error);
      setErrors({ submit: t('manualEntry.error') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleInputMode = () => {
    setUseTimeRange(!useTimeRange);
    setErrors({}); // Clear errors when switching modes
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 ${isOpen ? '' : 'hidden'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-2">{t('manualEntry.title')}</h2>
        <p className="text-gray-400 mb-6">{t('manualEntry.subtitle')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              {t('manualEntry.form.description')}
            </label>
            <input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              placeholder={t('manualEntry.form.descriptionPlaceholder')}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Project Selection */}
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-300 mb-2">
              {t('manualEntry.form.project')}
            </label>
            <select
              id="project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              disabled={isSubmitting}
            >
              <option value="" disabled>{t('manualEntry.form.selectProject')}</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            {errors.project && (
              <p className="text-red-400 text-sm mt-1">{errors.project}</p>
            )}
          </div>

          {/* Task Selection */}
          <div>
            <label htmlFor="task" className="block text-sm font-medium text-gray-300 mb-2">
              {t('manualEntry.form.task')}
            </label>
            <select
              id="task"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              disabled={isSubmitting || !projectId}
            >
              <option value="">{t('manualEntry.form.selectTask')}</option>
              {filteredTasks.map(task => (
                <option key={task.id} value={task.id}>{task.name}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
              {t('manualEntry.form.date')}
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
              disabled={isSubmitting}
            />
            {errors.date && (
              <p className="text-red-400 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          {/* Input Mode Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">
              {useTimeRange ? t('manualEntry.form.useDuration') : t('manualEntry.form.useTimeRange')}
            </span>
            <button
              type="button"
              onClick={toggleInputMode}
              className="text-[var(--primary-color)] hover:text-[var(--primary-color)]/80 text-sm font-medium"
              disabled={isSubmitting}
            >
              {useTimeRange ? t('manualEntry.form.useDuration') : t('manualEntry.form.useTimeRange')}
            </button>
          </div>

          {/* Duration or Time Range Inputs */}
          {useTimeRange ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('manualEntry.form.startTime')}
                </label>
                <input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  disabled={isSubmitting}
                />
                {errors.startTime && (
                  <p className="text-red-400 text-sm mt-1">{errors.startTime}</p>
                )}
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-300 mb-2">
                  {t('manualEntry.form.endTime')}
                </label>
                <input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  disabled={isSubmitting}
                />
                {errors.endTime && (
                  <p className="text-red-400 text-sm mt-1">{errors.endTime}</p>
                )}
              </div>
              {errors.timeRange && (
                <div className="col-span-2">
                  <p className="text-red-400 text-sm">{errors.timeRange}</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
                {t('manualEntry.form.duration')}
              </label>
              <input
                id="duration"
                type="text"
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                placeholder={t('manualEntry.form.durationPlaceholder')}
                disabled={isSubmitting}
              />
              {errors.duration && (
                <p className="text-red-400 text-sm mt-1">{errors.duration}</p>
              )}
            </div>
          )}

          {/* Billable Checkbox */}
          <div className="flex items-center">
            <input
              id="billable"
              type="checkbox"
              checked={billable}
              onChange={(e) => setBillable(e.target.checked)}
              className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
              disabled={isSubmitting}
            />
            <label htmlFor="billable" className="ml-2 text-sm text-gray-300">
              {t('manualEntry.form.billable')}
            </label>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <p className="text-red-400 text-sm">{errors.submit}</p>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-white bg-gray-600 hover:bg-gray-500 transition-colors"
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-white bg-[var(--primary-color)] hover:bg-[var(--primary-color)]/80 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? '...' : t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
