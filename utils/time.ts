import { Task } from '../types';

export const getDuration = (startTime: string, endTime: string): string => {
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  const diff = end.getTime() - start.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${remainingMinutes}m`;
};

export const getDurationInMinutes = (startTime: string, endTime: string): number => {
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / 60000);
};

export const calculateStats = (tasks: Task[], period: 'day' | 'week' | 'month', referenceDate: Date): { name: string; value: number }[] => {
  let startDate: Date;
  let endDate: Date;

  if (period === 'day') {
    // For 'day', the range isn't used in the filter, but let's set it for consistency.
    startDate = new Date(referenceDate);
    endDate = new Date(referenceDate);
  } else if (period === 'week') {
    const dayOfWeek = referenceDate.getDay(); // Sunday - 0, Monday - 1, etc.
    startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() - dayOfWeek);
    // The end of the week is 6 days after the start.
    endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6);
  } else { // month
    startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    // The end of the month is the 0th day of the next month.
    endDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
  }
  
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const relevantTasks = tasks.filter(task => {
    const [year, month, day] = task.date.split('-').map(Number);
    // Create date in UTC to avoid timezone issues with the YYYY-MM-DD string
    const taskDate = new Date(Date.UTC(year, month - 1, day));
    
    if (period === 'day') {
        // Compare just the date part, ignoring time
        const refDateOnly = new Date(Date.UTC(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate()));
        return taskDate.getTime() === refDateOnly.getTime();
    }
    
    return taskDate >= startDate && taskDate <= endDate;
  });

  const stats: { [key: string]: number } = {};
  relevantTasks.forEach(task => {
    const duration = getDurationInMinutes(task.startTime, task.endTime);
    if (!stats[task.tag]) {
      stats[task.tag] = 0;
    }
    stats[task.tag] += duration;
  });

  return Object.entries(stats)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};