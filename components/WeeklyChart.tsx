import React from 'react';
import { formatDuration } from '../utils/time';
import { useLanguage } from '../contexts/LanguageContext';

interface WeeklyChartProps {
  data: number[]; // Array of 7 numbers (milliseconds for each day)
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const { t } = useLanguage();
  const maxDuration = Math.max(...data, 1); // Avoid division by zero
  
  // These keys should correspond to a structure in your translation files
  const WEEK_DAYS = [
    t('calendar.weekdays.m'),
    t('calendar.weekdays.t'),
    t('calendar.weekdays.w'),
    t('calendar.weekdays.th'),
    t('calendar.weekdays.f'),
    t('calendar.weekdays.sa'),
    t('calendar.weekdays.s')
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