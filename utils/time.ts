import { TimeEntry, Project } from '../types';
import { Language } from '../contexts/LanguageContext';

export const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 0) milliseconds = 0;
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
};

export const formatDurationClock = (milliseconds: number): string => {
  if (milliseconds < 0) milliseconds = 0;
  
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const paddedHours = String(hours).padStart(2, '0');
  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(seconds).padStart(2, '0');

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
};

export const formatTime = (timestamp: number, lang: Language): string => {
  return new Date(timestamp).toLocaleTimeString(lang, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const formatDate = (timestamp: number, lang: Language): string => {
  return new Date(timestamp).toLocaleDateString(lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatCurrency = (amount: number, lang: Language): string => {
    return new Intl.NumberFormat(lang, {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
export const calculateEntryEarnings = (entry: TimeEntry, projects: Project[]): number => {
      if (!entry.billable || !entry.projectId) {
          return 0;
      }
  
      const project = projects.find(p => p.id === entry.projectId);
      if (!project || !project.isBillable || !project.hourlyRate) {
          return 0;
      }
  
      const durationMs = entry.endTime - entry.startTime;
      const durationHours = durationMs / (1000 * 60 * 60);
      
      return durationHours * project.hourlyRate;
  };

export const getTodayDateString = (lang: Language): string => {
    return new Date().toLocaleDateString(lang, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

const isSameDay = (d1: Date, d2: Date): boolean => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}

export const getDayKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getTodayEntries = (entries: TimeEntry[]): TimeEntry[] => {
    const today = new Date();
    return entries.filter(entry => isSameDay(new Date(entry.startTime), today));
}

export const getWeeklySummary = (entries: TimeEntry[]): number[] => {
    const weekData = Array(7).fill(0);
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, etc.
    
    // Normalize to start week on Monday
    const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (adjustedDayOfWeek - i));
        
        const dayEntries = entries.filter(entry => isSameDay(new Date(entry.startTime), date));
        const totalDuration = dayEntries.reduce((sum, entry) => sum + (entry.endTime - entry.startTime), 0);
        weekData[i] = totalDuration;
    }
    
    return weekData;
}

export const getWeeklyEarnings = (entries: TimeEntry[], projects: Project[]): number[] => {
    const weekData = Array(7).fill(0);
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, etc.
    
    // Normalize to start week on Monday
    const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (adjustedDayOfWeek - i));
        
        const dayEntries = entries.filter(entry => isSameDay(new Date(entry.startTime), date));
        const totalEarnings = dayEntries.reduce((sum, entry) => sum + calculateEntryEarnings(entry, projects), 0);
        weekData[i] = totalEarnings;
    }
    
    return weekData;
}