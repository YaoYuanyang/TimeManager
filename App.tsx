
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, View, TagData } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import Calendar from './components/Calendar';
import TaskList from './components/TaskList';
import StatsDashboard from './components/StatsDashboard';
import { PlusCircleIcon, ChartPieIcon, CalendarIcon, XMarkIcon, WrenchScrewdriverIcon } from './components/Icons';
import TaskForm from './components/TaskForm';
import TagManagerModal from './components/TagManagerModal';

const DEFAULT_COLORS = ['#0ea5e9', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#f59e0b', '#3b82f6', '#6366f1'];

const App: React.FC = () => {
  const [user, setUser] = useLocalStorage<string | null>('chronosync_user', null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<TagData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>(View.CALENDAR);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Effect to load data when user logs in
  useEffect(() => {
    if (user) {
      const savedTasks = localStorage.getItem(`chronosync_tasks_${user}`);
      const savedTags = localStorage.getItem(`chronosync_tags_${user}`);
      
      const loadedTasks = savedTasks ? JSON.parse(savedTasks) : [];
      setTasks(loadedTasks);
      
      let loadedTags = savedTags ? JSON.parse(savedTags) : [];

      // One-time migration for users who have tasks but no tag colors
      const allTaskTags = new Set(loadedTasks.map((t: Task) => t.tag));
      const existingTagNames = new Set(loadedTags.map((t: TagData) => t.name));

      if (allTaskTags.size > existingTagNames.size) {
          let colorIndex = loadedTags.length;
          allTaskTags.forEach(taskTag => {
              if (!existingTagNames.has(taskTag as string)) {
                  loadedTags.push({
                      name: taskTag,
                      color: DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length]
                  });
                  colorIndex++;
              }
          });
      }
      setTags(loadedTags);
    } else {
      // Clear data when user logs out
      setTasks([]);
      setTags([]);
    }
  }, [user]);

  // Effect to save data when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`chronosync_tasks_${user}`, JSON.stringify(tasks));
      localStorage.setItem(`chronosync_tags_${user}`, JSON.stringify(tags));
    }
  }, [tasks, tags, user]);


  const handleLogin = (name: string) => {
    setUser(name);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleAddTask = useCallback((task: Omit<Task, 'id'>) => {
    const newTask: Task = { ...task, id: Date.now().toString() };
    setTasks(prevTasks => [...prevTasks, newTask]);
    // Add new tag with a color if it doesn't exist
    if (!tags.some(t => t.name === task.tag)) {
        const newTagColor = DEFAULT_COLORS[tags.length % DEFAULT_COLORS.length];
        setTags(prevTags => [...prevTags, { name: task.tag, color: newTagColor }]);
    }
    setIsTaskFormOpen(false);
  }, [tags]);

  const handleUpdateTask = useCallback((updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
     // Add new tag with a color if it's a new tag from an update
     if (!tags.some(t => t.name === updatedTask.tag)) {
        const newTagColor = DEFAULT_COLORS[tags.length % DEFAULT_COLORS.length];
        setTags(prevTags => [...prevTags, { name: updatedTask.tag, color: newTagColor }]);
    }
    setIsTaskFormOpen(false);
    setEditingTask(null);
  }, [tags]);

  const handleDeleteTask = useCallback((taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    }
  }, []);

  const handleRenameTag = useCallback((oldTag: string, newTag: string) => {
    if (!newTag.trim() || oldTag === newTag) {
        return;
    }
    const trimmedNewTag = newTag.trim();
    if (tags.some(t => t.name === trimmedNewTag)) {
        alert(`Tag "${trimmedNewTag}" already exists. Please choose a different name.`);
        return;
    }
    
    setTasks(prevTasks => prevTasks.map(task => {
        if (task.tag === oldTag) {
            return { ...task, tag: trimmedNewTag };
        }
        return task;
    }));

    setTags(prevTags => prevTags.map(tag => {
        if (tag.name === oldTag) {
            return { ...tag, name: trimmedNewTag };
        }
        return tag;
    }));
}, [tags]);
  
  const handleUpdateTagColor = useCallback((tagName: string, newColor: string) => {
      setTags(prevTags => prevTags.map(tag => tag.name === tagName ? { ...tag, color: newColor } : tag));
  }, []);

  const handleDeleteTag = useCallback((tagName: string) => {
    const isTagInUse = tasks.some(task => task.tag === tagName);
    if (isTagInUse) {
        alert(`Cannot delete "${tagName}" as it is currently assigned to one or more tasks.`);
        return;
    }

    if (window.confirm(`Are you sure you want to permanently delete the tag "${tagName}"? This action cannot be undone.`)) {
        setTags(prevTags => prevTags.filter(tag => tag.name !== tagName));
    }
  }, [tasks]);

  const openEditForm = useCallback((task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  }, []);
  
  const openAddForm = useCallback(() => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  }, []);

  const tasksForSelectedDate = useMemo(() => {
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    const selectedDateString = `${yyyy}-${mm}-${dd}`;

    return tasks
      .filter(task => task.date === selectedDateString)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [tasks, selectedDate]);

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-bunker-950 font-sans">
      <Header user={user} onLogout={handleLogout} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Calendar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              tasks={tasks}
            />
             <div className="bg-bunker-900 rounded-xl shadow-lg p-4">
                <h2 className="text-xl font-bold text-bunker-100 mb-3">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={openAddForm}
                    className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    <PlusCircleIcon className="w-6 h-6" />
                    <span>Add New Task</span>
                  </button>
                  <button
                    onClick={() => setIsTagManagerOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-bunker-700 hover:bg-bunker-600 text-bunker-100 font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    <WrenchScrewdriverIcon className="w-5 h-5" />
                    <span>Manage Tags</span>
                  </button>
                </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex border-b border-bunker-700 mb-4">
              <button onClick={() => setCurrentView(View.CALENDAR)} className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${currentView === View.CALENDAR ? 'text-sky-400 border-b-2 border-sky-400' : 'text-bunker-400 hover:text-sky-400'}`}>
                <CalendarIcon className="w-5 h-5" /> Daily Tasks
              </button>
              <button onClick={() => setCurrentView(View.STATS)} className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors ${currentView === View.STATS ? 'text-sky-400 border-b-2 border-sky-400' : 'text-bunker-400 hover:text-sky-400'}`}>
                <ChartPieIcon className="w-5 h-5" /> Statistics
              </button>
            </div>

            {currentView === View.CALENDAR && (
              <TaskList 
                tasks={tasksForSelectedDate} 
                tags={tags}
                selectedDate={selectedDate} 
                onEdit={openEditForm}
                onDelete={handleDeleteTask}
                onAddTask={openAddForm}
              />
            )}
            
            {currentView === View.STATS && (
              <StatsDashboard tasks={tasks} tags={tags} selectedDate={selectedDate} />
            )}
          </div>
        </div>
      </main>

      {isTaskFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-bunker-900 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative transform transition-all duration-300 scale-95 animate-scale-in">
             <button
              onClick={() => {
                  setIsTaskFormOpen(false);
                  setEditingTask(null);
              }}
              className="absolute top-4 right-4 text-bunker-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-7 h-7" />
            </button>
            <TaskForm
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              existingTask={editingTask}
              allTags={tags.map(t => t.name)}
              selectedDate={selectedDate}
            />
          </div>
        </div>
      )}

      {isTagManagerOpen && (
        <TagManagerModal
          tasks={tasks}
          tags={tags}
          onClose={() => setIsTagManagerOpen(false)}
          onRenameTag={handleRenameTag}
          onUpdateTagColor={handleUpdateTagColor}
          onDeleteTag={handleDeleteTag}
        />
      )}
    </div>
  );
};
// Add a keyframe animation for the modal
const style = document.createElement('style');
style.innerHTML = `
  @keyframes scale-in {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  .animate-scale-in {
    animation: scale-in 0.2s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default App;
