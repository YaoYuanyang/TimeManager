
import React, { useMemo } from 'react';
import { Task } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import { getDurationInMinutes } from '../utils/time';

interface CalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  tasks: Task[];
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange, tasks }) => {
  const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const dailyWorkload = useMemo(() => {
    const workloadMap = new Map<string, number>();
    tasks.forEach(task => {
        const duration = getDurationInMinutes(task.startTime, task.endTime);
        const currentDuration = workloadMap.get(task.date) || 0;
        workloadMap.set(task.date, currentDuration + duration);
    });
    return workloadMap;
  }, [tasks]);

  const changeMonth = (offset: number) => {
    onDateChange(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1));
  };

  const today = new Date();

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const isSelected = currentDate.toDateString() === selectedDate.toDateString();
      const isToday = currentDate.toDateString() === today.toDateString();
      
      const yyyy = currentDate.getFullYear();
      const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dd = String(currentDate.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;
      
      const workload = dailyWorkload.get(dateString) || 0;
      // Scale opacity from 0.2 (for any work) to 1.0 (for 8 hours or more)
      const opacity = workload > 0 ? Math.min(0.2 + (workload / 480) * 0.8, 1) : 0;

      const dayClasses = `
        w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 relative
        ${isSelected ? 'bg-sky-500 text-white font-bold' : ''}
        ${!isSelected && isToday ? 'bg-bunker-700 text-white' : ''}
        ${!isSelected && !isToday ? 'text-bunker-200 hover:bg-bunker-700' : ''}
      `;
      
      days.push(
        <div key={day} className={dayClasses} onClick={() => onDateChange(currentDate)}>
          {day}
          {workload > 0 && 
            <div 
              className="absolute bottom-1 w-1.5 h-1.5 bg-emerald-400 rounded-full"
              style={{ opacity: opacity }}
            ></div>
          }
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-bunker-900 rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-bunker-700">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-white">
          {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-bunker-700">
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center text-sm text-bunker-400 mb-2">
        <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
      </div>
      <div className="grid grid-cols-7 gap-y-2 place-items-center">
        {renderDays()}
      </div>
    </div>
  );
};

export default React.memo(Calendar);
