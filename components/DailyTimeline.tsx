
import React, { useMemo } from 'react';
import { Task, TagData } from '../types';

interface DailyTimelineProps {
  tasks: Task[];
  tags: TagData[];
}

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const DailyTimeline: React.FC<DailyTimelineProps> = ({ tasks, tags }) => {
  const tagColorMap = useMemo(() => new Map(tags.map(t => [t.name, t.color])), [tags]);
  const totalMinutesInDay = 24 * 60;

  const hours = Array.from({ length: 9 }, (_, i) => i * 3); // 0, 3, 6, ..., 24

  return (
    <div className="bg-bunker-900 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Daily Timeline</h2>
      <div className="relative h-20 bg-bunker-800 rounded-lg overflow-hidden">
        {/* Task Blocks */}
        {tasks.map(task => {
          const startMinutes = timeToMinutes(task.startTime);
          const endMinutes = timeToMinutes(task.endTime);
          const left = (startMinutes / totalMinutesInDay) * 100;
          const width = ((endMinutes - startMinutes) / totalMinutesInDay) * 100;
          const color = tagColorMap.get(task.tag) || '#7f8aa4';
          
          return (
            <div
              key={task.id}
              className="absolute top-0 h-full group"
              style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color }}
              title={`${task.description} (${task.startTime} - ${task.endTime})`}
            >
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-2">
                {task.description}
              </span>
            </div>
          );
        })}
      </div>
      {/* Hour Markers */}
      <div className="relative mt-2 flex justify-between text-xs text-bunker-400">
        {hours.map(hour => (
          <div key={hour} className="flex flex-col items-center">
            <span className="h-2 w-px bg-bunker-600"></span>
            <span className="mt-1">{hour.toString().padStart(2, '0')}:00</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(DailyTimeline);
