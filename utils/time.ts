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

// Time filter types
export type TimeFilterPeriod = 'all' | '30days' | 'quarter' | 'year';

// Get date range for a time filter period
export const getTimeFilterRange = (period: TimeFilterPeriod): { start: Date; end: Date } => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    let start: Date;

    switch (period) {
        case '30days':
            start = new Date(now);
            start.setDate(now.getDate() - 30);
            start.setHours(0, 0, 0, 0);
            break;
        case 'quarter':
            start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            start.setHours(0, 0, 0, 0);
            break;
        case 'year':
            start = new Date(now.getFullYear(), 0, 1);
            start.setHours(0, 0, 0, 0);
            break;
        case 'all':
        default:
            start = new Date(0); // Beginning of time
            break;
    }

    return { start, end };
};

// Filter entries by time period
export const filterEntriesByPeriod = (entries: TimeEntry[], period: TimeFilterPeriod): TimeEntry[] => {
    if (period === 'all') {
        return entries;
    }

    const { start, end } = getTimeFilterRange(period);

    return entries.filter(entry => {
        const entryTime = new Date(entry.startTime).getTime();
        return entryTime >= start.getTime() && entryTime <= end.getTime();
    });
};

// Generate chart data based on time period
export const getChartDataForPeriod = (
    entries: TimeEntry[],
    projects: Project[],
    period: TimeFilterPeriod,
    firstDayOfWeek: string = 'monday'
): number[] => {
    const filteredEntries = filterEntriesByPeriod(entries, period);

    switch (period) {
        case 'all':
            // For all time, show monthly data for the last 12 months
            return getMonthlyEarnings(filteredEntries, projects, 12);
        case '30days':
            // For 30 days, show daily data
            return getDailyEarnings(filteredEntries, projects, 30);
        case 'quarter':
            // For quarter, show weekly data
            return getWeeklyEarningsForPeriod(filteredEntries, projects, 13); // ~13 weeks in a quarter
        case 'year':
            // For year, show monthly data
            return getMonthlyEarnings(filteredEntries, projects, 12);
        default:
            return getWeeklyEarnings(filteredEntries, projects, firstDayOfWeek);
    }
};

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

// Get daily earnings for a specified number of days
export const getDailyEarnings = (entries: TimeEntry[], projects: Project[], days: number): number[] => {
    const dailyData = Array(days).fill(0);
    const today = new Date();

    for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (days - 1 - i));

        const dayEntries = entries.filter(entry => isSameDay(new Date(entry.startTime), date));
        const totalEarnings = dayEntries.reduce((sum, entry) => sum + calculateEntryEarnings(entry, projects), 0);
        dailyData[i] = totalEarnings;
    }

    return dailyData;
};

// Get weekly earnings for a specified number of weeks
export const getWeeklyEarningsForPeriod = (entries: TimeEntry[], projects: Project[], weeks: number): number[] => {
    const weeklyData = Array(weeks).fill(0);
    const today = new Date();

    for (let i = 0; i < weeks; i++) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - (weeks - 1 - i) * 7);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekEntries = entries.filter(entry => {
            const entryTime = new Date(entry.startTime).getTime();
            return entryTime >= weekStart.getTime() && entryTime <= weekEnd.getTime();
        });

        const totalEarnings = weekEntries.reduce((sum, entry) => sum + calculateEntryEarnings(entry, projects), 0);
        weeklyData[i] = totalEarnings;
    }

    return weeklyData;
};

// Get monthly earnings for a specified number of months
export const getMonthlyEarnings = (entries: TimeEntry[], projects: Project[], months: number): number[] => {
    const monthlyData = Array(months).fill(0);
    const today = new Date();

    for (let i = 0; i < months; i++) {
        const monthStart = new Date(today.getFullYear(), today.getMonth() - (months - 1 - i), 1);
        monthStart.setHours(0, 0, 0, 0);

        const monthEnd = new Date(today.getFullYear(), today.getMonth() - (months - 1 - i) + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);

        const monthEntries = entries.filter(entry => {
            const entryTime = new Date(entry.startTime).getTime();
            return entryTime >= monthStart.getTime() && entryTime <= monthEnd.getTime();
        });

        const totalEarnings = monthEntries.reduce((sum, entry) => sum + calculateEntryEarnings(entry, projects), 0);
        monthlyData[i] = totalEarnings;
    }

    return monthlyData;
};

// Get chart labels based on time period
export const getChartLabelsForPeriod = (period: TimeFilterPeriod): string[] => {
    const today = new Date();

    switch (period) {
        case '30days':
            return Array.from({ length: 30 }, (_, i) => {
                const date = new Date(today);
                date.setDate(today.getDate() - (29 - i));
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            });
        case 'quarter':
            return Array.from({ length: 13 }, (_, i) => {
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - (12 - i) * 7);
                return `W${i + 1}`;
            });
        case 'year':
            return Array.from({ length: 12 }, (_, i) => {
                const month = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
                return month.toLocaleDateString('en-US', { month: 'short' });
            });
        case 'all':
            return Array.from({ length: 12 }, (_, i) => {
                const month = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
                return month.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            });
        default:
            return ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    }
};

// Calculate productivity for a set of entries
const calculateProductivity = (entries: TimeEntry[]): number => {
    if (entries.length === 0) return 0;

    const totalHours = entries.reduce((sum, e) => sum + (e.endTime - e.startTime), 0);
    const billableHours = entries.filter(e => e.billable).reduce((sum, e) => sum + (e.endTime - e.startTime), 0);

    return totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
};

// Calculate productivity trends based on filtered entries and time period
export const calculateProductivityTrends = (filteredEntries: TimeEntry[], allEntries: TimeEntry[], period: TimeFilterPeriod): { percentage: number; trend: number } => {
    // Calculate current period productivity from filtered entries
    const currentProductivity = calculateProductivity(filteredEntries);



    // If no data in current period, return zeros
    if (filteredEntries.length === 0) {
        return {
            percentage: 0,
            trend: 0
        };
    }

    // Get comparison period entries
    const now = new Date();
    let previousPeriodEntries: TimeEntry[] = [];

    switch (period) {
        case '30days': {
            // Compare with previous 30 days (30-60 days ago)
            const prev30DaysStart = new Date(now);
            prev30DaysStart.setDate(now.getDate() - 60);
            const prev30DaysEnd = new Date(now);
            prev30DaysEnd.setDate(now.getDate() - 30);

            previousPeriodEntries = allEntries.filter(e => {
                const entryTime = new Date(e.startTime);
                return entryTime >= prev30DaysStart && entryTime < prev30DaysEnd;
            });
            break;
        }
        case 'quarter': {
            // Compare with previous quarter
            const currentQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            const prevQuarterStart = new Date(currentQuarterStart);
            prevQuarterStart.setMonth(prevQuarterStart.getMonth() - 3);
            const prevQuarterEnd = new Date(currentQuarterStart);

            previousPeriodEntries = allEntries.filter(e => {
                const entryTime = new Date(e.startTime);
                return entryTime >= prevQuarterStart && entryTime < prevQuarterEnd;
            });
            break;
        }
        case 'year': {
            // Compare with previous year
            const currentYearStart = new Date(now.getFullYear(), 0, 1);
            const prevYearStart = new Date(now.getFullYear() - 1, 0, 1);
            const prevYearEnd = new Date(now.getFullYear(), 0, 1);

            previousPeriodEntries = allEntries.filter(e => {
                const entryTime = new Date(e.startTime);
                return entryTime >= prevYearStart && entryTime < prevYearEnd;
            });
            break;
        }
        case 'all':
        default: {
            // For all time, compare last 30 days vs previous 30 days
            const last30DaysStart = new Date(now);
            last30DaysStart.setDate(now.getDate() - 30);
            const prev30DaysStart = new Date(now);
            prev30DaysStart.setDate(now.getDate() - 60);

            previousPeriodEntries = allEntries.filter(e => {
                const entryTime = new Date(e.startTime);
                return entryTime >= prev30DaysStart && entryTime < last30DaysStart;
            });
            break;
        }
    }

    // Calculate previous period productivity
    const previousProductivity = calculateProductivity(previousPeriodEntries);

    // Calculate trend
    let trend = 0;
    if (previousProductivity > 0) {
        trend = currentProductivity - previousProductivity;
    } else if (currentProductivity > 0) {
        trend = currentProductivity; // If no previous data, show current as positive trend
    }

    // Ensure we return valid numbers
    const finalPercentage = isNaN(currentProductivity) ? 0 : Math.round(currentProductivity);
    const finalTrend = isNaN(trend) ? 0 : Math.round(trend);



    return {
        percentage: finalPercentage,
        trend: finalTrend
    };
};

// Get daily productivity data for chart display
export const getDailyProductivityData = (entries: TimeEntry[], period: TimeFilterPeriod): number[] => {
    const now = new Date();
    let days: number;

    // Determine number of days based on period
    switch (period) {
        case '30days':
            days = 30;
            break;
        case 'quarter':
            days = 90; // ~3 months
            break;
        case 'year':
            days = 365;
            break;
        case 'all':
        default:
            days = 30; // Default to 30 days for all time
            break;
    }

    const productivityData = Array(days).fill(0);

    for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - (days - 1 - i));

        // Get entries for this specific day
        const dayEntries = entries.filter(entry => isSameDay(new Date(entry.startTime), date));

        if (dayEntries.length > 0) {
            const totalTime = dayEntries.reduce((sum, e) => sum + (e.endTime - e.startTime), 0);
            const billableTime = dayEntries.filter(e => e.billable).reduce((sum, e) => sum + (e.endTime - e.startTime), 0);

            const productivity = totalTime > 0 ? (billableTime / totalTime) * 100 : 0;
            productivityData[i] = Math.round(productivity);
        }
    }

    return productivityData;
};

// Get productivity chart labels for different periods
export const getProductivityChartLabels = (period: TimeFilterPeriod): string[] => {
    const now = new Date();
    let days: number;
    let labelFrequency: number; // Show every Nth label to avoid crowding

    switch (period) {
        case '30days':
            days = 30;
            labelFrequency = 5; // Show every 5th day
            break;
        case 'quarter':
            days = 90;
            labelFrequency = 15; // Show every 15th day
            break;
        case 'year':
            days = 365;
            labelFrequency = 30; // Show every 30th day (roughly monthly)
            break;
        case 'all':
        default:
            days = 30;
            labelFrequency = 5;
            break;
    }

    return Array.from({ length: days }, (_, i) => {
        const date = new Date(now);
        date.setDate(now.getDate() - (days - 1 - i));

        // Only show label if it's at the frequency interval or it's the first/last day
        if (i % labelFrequency === 0 || i === 0 || i === days - 1) {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                ...(period === 'year' && { year: '2-digit' })
            });
        }
        return ''; // Empty string for days without labels
    });
};