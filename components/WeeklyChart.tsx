import React from 'react';
import { formatDuration } from '../utils/time';
import { useLanguage } from '../contexts/LanguageContext';
import { FirstDayOfWeek } from '../contexts/UserPreferencesContext';

interface WeeklyChartProps {
  data: number[]; // Array of 7 numbers (milliseconds for each day)
  firstDayOfWeek?: FirstDayOfWeek;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data, firstDayOfWeek = 'monday' }) => {
  const { t } = useLanguage();
  const maxDuration = Math.max(...data, 1); // Avoid division by zero

  // Define all weekdays in order starting from Sunday (JavaScript's getDay() convention)
  const ALL_WEEKDAYS = [
    t('calendar.weekdays.s'),   // Sunday
    t('calendar.weekdays.m'),   // Monday
    t('calendar.weekdays.t'),   // Tuesday
    t('calendar.weekdays.w'),   // Wednesday
    t('calendar.weekdays.th'),  // Thursday
    t('calendar.weekdays.f'),   // Friday
    t('calendar.weekdays.sa')   // Saturday
  ];

  // Map first day of week to starting index
  const firstDayMap: { [key: string]: number } = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  };

  const startIndex = firstDayMap[firstDayOfWeek] || 1;

  // Reorder weekdays based on user preference
  const WEEK_DAYS = [
    ...ALL_WEEKDAYS.slice(startIndex),
    ...ALL_WEEKDAYS.slice(0, startIndex)
  ];


  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-end h-48 space-x-2 rtl:space-x-reverse">
        {data.map((duration, index) => (
          <div key={index} className="flex-1 flex flex-col items-center justify-end group">
            <div className="text-xs text-white bg-gray-900/70 rounded px-2 py-1 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {formatDuration(duration)}
            </div>
            <div
              className="w-full bg-indigo-500 rounded-t-md hover:bg-indigo-400 transition-colors"
              style={{ height: `${(duration / maxDuration) * 100}%` }}
            ></div>
            <div className="mt-2 text-xs text-gray-400">{WEEK_DAYS[index]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};