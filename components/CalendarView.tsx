import React, { useState, useMemo } from 'react';
import { TimeEntry, Project, Task } from '../types';
import { formatDuration, getDayKey } from '../utils/time';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { TimeEntryItem } from './TimeEntryItem';
import { useLanguage } from '../contexts/LanguageContext';

// Fix: Add missing CalendarViewProps interface definition
interface CalendarViewProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void;
  projects: Project[];
  tasks: Task[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ entries, onDelete, projects, tasks }) => {
  const { t, language } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const WEEK_DAYS = [
    t('calendar.weekdays.s'),
    t('calendar.weekdays.m'),
    t('calendar.weekdays.t'),
    t('calendar.weekdays.w'),
    t('calendar.weekdays.th'),
    t('calendar.weekdays.f'),
    t('calendar.weekdays.sa')
  ];

  const entriesByDay = useMemo(() => {
    return entries.reduce((acc, entry) => {
      const dayKey = getDayKey(new Date(entry.startTime));
      if (!acc[dayKey]) {
        acc[dayKey] = { entries: [], totalDuration: 0 };
      }
      acc[dayKey].entries.push(entry);
      acc[dayKey].totalDuration += (entry.endTime - entry.startTime);
      return acc;
    }, {} as { [key: string]: { entries: TimeEntry[], totalDuration: number } });
  }, [entries]);

  const { month, year, calendarGrid } = useMemo(() => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid = [];
    let dayCounter = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          week.push(null);
        } else if (dayCounter > daysInMonth) {
          week.push(null);
        } else {
          week.push(new Date(year, month, dayCounter));
          dayCounter++;
        }
      }
      grid.push(week);
      if (dayCounter > daysInMonth) break;
    }
    return { month, year, calendarGrid: grid };
  }, [currentDate]);

  const changeMonth = (amount: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
  };
  
  const todayKey = getDayKey(new Date());
  const selectedDayKey = getDayKey(selectedDate);
  const selectedDayEntries = entriesByDay[selectedDayKey]?.entries || [];

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-2 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label={t('calendar.prevMonth')}>
          <ChevronLeftIcon />
        </button>
        <h2 className="text-lg sm:text-xl font-semibold text-white text-center">
          {new Date(year, month).toLocaleString(language, { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label={t('calendar.nextMonth')}>
          <ChevronRightIcon />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {WEEK_DAYS.map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-gray-400 pb-2">{day}</div>
        ))}

        {calendarGrid.flat().map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />;
          
          const dayKey = getDayKey(date);
          const dayData = entriesByDay[dayKey];
          const isToday = dayKey === todayKey;
          const isSelected = dayKey === selectedDayKey;

          return (
            <button
              key={dayKey}
              onClick={() => setSelectedDate(date)}
              className={`h-20 sm:h-24 p-1 sm:p-2 text-start rounded-lg transition-colors flex flex-col justify-start items-start focus:outline-none focus:ring-2 focus:ring-indigo-500
                ${isSelected ? 'bg-indigo-600/50 ring-2 ring-indigo-500' : 'hover:bg-gray-700/50'}
                ${dayData ? 'bg-gray-700' : ''}
              `}
            >
              <span className={`text-xs sm:text-sm font-medium ${isToday ? 'bg-indigo-500 text-white rounded-full h-6 w-6 flex items-center justify-center' : ''}`}>
                {date.getDate()}
              </span>
              {dayData && (
                 <span className="mt-auto text-xs font-mono bg-gray-900/50 rounded px-1 py-0.5">
                    {formatDuration(dayData.totalDuration).replace(/(\d+)h\s(\d+)m\s(\d+)s/, '$1h $2m')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Entries */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <h3 className="font-semibold text-lg mb-3">
          {t('calendar.entriesFor', { date: selectedDate.toLocaleDateString(language, { weekday: 'long', month: 'long', day: 'numeric' }) })}
        </h3>
        {selectedDayEntries.length > 0 ? (
          <div className="space-y-2">
            {selectedDayEntries.map(entry => (
              <TimeEntryItem key={entry.id} entry={entry} onDelete={onDelete} projects={projects} tasks={tasks} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">{t('calendar.noEntries')}</p>
        )}
      </div>
    </div>
  );
};
