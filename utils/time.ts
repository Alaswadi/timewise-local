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

// Helper function to get day offset based on first day of week preference
const getDayOffset = (firstDayOfWeek: string): number => {
    const dayMap: { [key: string]: number } = {
        'sunday': 0,
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'saturday': 6
    };
    return dayMap[firstDayOfWeek] || 1; // Default to Monday if invalid
};

export const getWeeklySummary = (entries: TimeEntry[], firstDayOfWeek: string = 'monday'): number[] => {
    const weekData = Array(7).fill(0);
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, etc.
    const firstDayOffset = getDayOffset(firstDayOfWeek);

    // Calculate how many days back to go to reach the first day of the week
    let adjustedDayOfWeek = (dayOfWeek - firstDayOffset + 7) % 7;

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (adjustedDayOfWeek - i));

        const dayEntries = entries.filter(entry => isSameDay(new Date(entry.startTime), date));
        const totalDuration = dayEntries.reduce((sum, entry) => sum + (entry.endTime - entry.startTime), 0);
        weekData[i] = totalDuration;
    }

    return weekData;
}

export const getWeeklyEarnings = (entries: TimeEntry[], projects: Project[], firstDayOfWeek: string = 'monday'): number[] => {
    const weekData = Array(7).fill(0);
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday - 0, Monday - 1, etc.
    const firstDayOffset = getDayOffset(firstDayOfWeek);

    // Calculate how many days back to go to reach the first day of the week
    let adjustedDayOfWeek = (dayOfWeek - firstDayOffset + 7) % 7;

    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (adjustedDayOfWeek - i));

        const dayEntries = entries.filter(entry => isSameDay(new Date(entry.startTime), date));
        const totalEarnings = dayEntries.reduce((sum, entry) => sum + calculateEntryEarnings(entry, projects), 0);
        weekData[i] = totalEarnings;
    }

    return weekData;
}

// Manual time entry utilities
export const parseDurationInput = (input: string): number | null => {
    if (!input || typeof input !== 'string') return null;

    const trimmed = input.trim();

    // Try to parse as HH:MM format
    const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);

        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return null;
        }

        return (hours * 60 + minutes) * 60 * 1000; // Convert to milliseconds
    }

    // Try to parse as minutes only
    const minutesMatch = trimmed.match(/^(\d+)$/);
    if (minutesMatch) {
        const minutes = parseInt(minutesMatch[1], 10);
        if (minutes < 0 || minutes > 1440) { // Max 24 hours
            return null;
        }
        return minutes * 60 * 1000; // Convert to milliseconds
    }

    return null;
};

export const formatDurationForInput = (milliseconds: number): string => {
    if (milliseconds < 0) return '0:00';

    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

export const validateDateInput = (dateString: string): { isValid: boolean; error?: string } => {
    if (!dateString) {
        return { isValid: false, error: 'Date is required' };
    }

    const date = new Date(dateString);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (isNaN(date.getTime())) {
        return { isValid: false, error: 'Invalid date format' };
    }

    if (date > today) {
        return { isValid: false, error: 'Date cannot be in the future' };
    }

    return { isValid: true };
};

export const parseTimeInput = (timeString: string): number | null => {
    if (!timeString) return null;

    const timeMatch = timeString.match(/^(\d{1,2}):(\d{2})$/);
    if (!timeMatch) return null;

    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null;
    }

    return hours * 60 + minutes; // Return total minutes
};

export const calculateTimeRangeDuration = (
    date: string,
    startTime: string,
    endTime: string
): { duration: number | null; error?: string } => {
    const startMinutes = parseTimeInput(startTime);
    const endMinutes = parseTimeInput(endTime);

    if (startMinutes === null) {
        return { duration: null, error: 'Invalid start time format' };
    }

    if (endMinutes === null) {
        return { duration: null, error: 'Invalid end time format' };
    }

    let durationMinutes = endMinutes - startMinutes;

    // Handle overnight work (end time next day)
    if (durationMinutes < 0) {
        durationMinutes += 24 * 60; // Add 24 hours
    }

    // Validate reasonable duration (max 24 hours)
    if (durationMinutes > 24 * 60) {
        return { duration: null, error: 'Duration cannot exceed 24 hours' };
    }

    if (durationMinutes === 0) {
        return { duration: null, error: 'End time must be after start time' };
    }

    return { duration: durationMinutes * 60 * 1000 }; // Convert to milliseconds
};

export const formatTimeForInput = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export const createTimestampsFromDateAndTime = (
    date: string,
    startTime: string,
    endTime: string
): { startTimestamp: number; endTimestamp: number } | null => {
    const baseDate = new Date(date);
    if (isNaN(baseDate.getTime())) return null;

    const startMinutes = parseTimeInput(startTime);
    const endMinutes = parseTimeInput(endTime);

    if (startMinutes === null || endMinutes === null) return null;

    const startTimestamp = new Date(baseDate);
    startTimestamp.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);

    const endTimestamp = new Date(baseDate);
    endTimestamp.setHours(Math.floor(endMinutes / 60), endMinutes % 60, 0, 0);

    // Handle overnight work
    if (endMinutes < startMinutes) {
        endTimestamp.setDate(endTimestamp.getDate() + 1);
    }

    return {
        startTimestamp: startTimestamp.getTime(),
        endTimestamp: endTimestamp.getTime()
    };
};

export const createTimestampsFromDateAndDuration = (
    date: string,
    duration: number,
    startTime?: string
): { startTimestamp: number; endTimestamp: number } | null => {
    const baseDate = new Date(date);
    if (isNaN(baseDate.getTime())) return null;

    let startTimestamp: Date;

    if (startTime) {
        const startMinutes = parseTimeInput(startTime);
        if (startMinutes === null) return null;

        startTimestamp = new Date(baseDate);
        startTimestamp.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);
    } else {
        // Default to 9:00 AM if no start time specified
        startTimestamp = new Date(baseDate);
        startTimestamp.setHours(9, 0, 0, 0);
    }

    const endTimestamp = new Date(startTimestamp.getTime() + duration);

    return {
        startTimestamp: startTimestamp.getTime(),
        endTimestamp: endTimestamp.getTime()
    };
};