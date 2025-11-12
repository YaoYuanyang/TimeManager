
import React from 'react';
import { Task, TagData } from '../types.ts';
import { PencilSquareIcon, TrashIcon, ClockIcon, TagIcon, PlusIcon, PhotoIcon } from './Icons.tsx';
import { getDuration } from '../utils/time.ts';

interface TaskListProps {
  tasks: Task[];
  tags: TagData[];
  selectedDate: Date;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onAddTask: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, tags, selectedDate, onEdit, onDelete, onAddTask }) => {
  const tagColorMap = new Map(tags.map(t => [t.name, t.color]));

  return (
    <div className="bg-bunker-900 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-1">
        Tasks for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </h2>
      <p className="text-bunker-400 mb-6">A log of your accomplishments.</p>
      
      {tasks.length > 0 ? (
        <ul className="space-y-4">
          {tasks.map(task => {
            const tagColor = tagColorMap.get(task.tag) || '#7f8aa4';
            return (
                <li key={task.id} className="bg-bunker-800 p-4 rounded-lg flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-transform hover:scale-[1.02]">
                <div className="flex-1">
                    <p className="font-semibold text-lg text-bunker-100">{task.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-bunker-400 mt-2">
                    <div className="flex items-center gap-1.5">
                        <ClockIcon className="w-4 h-4" />
                        <span>{task.startTime} - {task.endTime} ({getDuration(task.startTime, task.endTime)})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <TagIcon className="w-4 h-4" />
                        <span 
                            className="px-2 py-0.5 rounded-full font-medium"
                            style={{ 
                                backgroundColor: `${tagColor}20`, // 20% opacity
                                color: tagColor,
                                border: `1px solid ${tagColor}80` // 50% opacity
                            }}
                        >
                            {task.tag}
                        </span>
                    </div>
                    {task.imageUrl && (
                         <div className="flex items-center gap-1.5">
                            <PhotoIcon className="w-4 h-4" />
                            <span>Image Attached</span>
                        </div>
                    )}
                    </div>
                     {task.imageUrl && (
                        <div className="mt-3">
                            <img src={task.imageUrl} alt="Task attachment" className="max-h-40 rounded-md object-cover" />
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                    <button onClick={() => onEdit(task)} className="p-2 text-bunker-400 hover:text-yellow-400 rounded-full hover:bg-bunker-700 transition-colors">
                    <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(task.id)} className="p-2 text-bunker-400 hover:text-red-400 rounded-full hover:bg-bunker-700 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
                </li>
            )
          })}
        </ul>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-bunker-700 rounded-lg">
          <p className="text-bunker-400 mb-4">No tasks logged for this day.</p>
          <button 
            onClick={onAddTask}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            <PlusIcon className="w-5 h-5" />
            Add a Task
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(TaskList);