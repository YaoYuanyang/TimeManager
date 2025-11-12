
import { Task } from '../types.ts';

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
  
  const refYear = referenceDate.getUTCFullYear();
  const refMonth = referenceDate.getUTCMonth();
  const refDate = referenceDate.getUTCDate();

  if (period === 'day') {
    startDate = new Date(Date.UTC(refYear, refMonth, refDate));
    endDate = new Date(Date.UTC(refYear, refMonth, refDate));
  } else if (period === 'week') {
    const dayOfWeek = referenceDate.getUTCDay(); // Sunday - 0, Monday - 1, etc.
    startDate = new Date(Date.UTC(refYear, refMonth, refDate - dayOfWeek));
    endDate = new Date(Date.UTC(refYear, refMonth, refDate - dayOfWeek + 6));
  } else { // month
    startDate = new Date(Date.UTC(refYear, refMonth, 1));
    endDate = new Date(Date.UTC(refYear, refMonth + 1, 0));
  }
  
  // Set time to the very beginning and end of the day in UTC for accurate range comparison
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);

  const relevantTasks = tasks.filter(task => {
    const [year, month, day] = task.date.split('-').map(Number);
    // Create date in UTC to avoid timezone issues with the YYYY-MM-DD string
    const taskDate = new Date(Date.UTC(year, month - 1, day));
    
    if (period === 'day') {
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