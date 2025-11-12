
import React, { useState, useEffect } from 'react';
import { Task } from '../types.ts';
import geminiService from '../services/geminiService.ts';
import { resizeImage } from '../utils/image.ts';
import { SparklesIcon, PhotoIcon, XCircleIcon } from './Icons.tsx';

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (task: Task) => void;
  existingTask: Task | null;
  allTags: string[];
  selectedDate: Date;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAddTask, onUpdateTask, existingTask, allTags, selectedDate }) => {
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [date, setDate] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  useEffect(() => {
    if (existingTask) {
      setDescription(existingTask.description);
      setTag(existingTask.tag);
      setStartTime(existingTask.startTime);
      setEndTime(existingTask.endTime);
      setDate(existingTask.date);
      setImageUrl(existingTask.imageUrl);
    } else {
      // Reset form for new task
      setDescription('');
      setTag('');
      setStartTime('09:00');
      setEndTime('10:00');
      setImageUrl(undefined);
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [existingTask, selectedDate]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Image is too large. Please select a file smaller than 5MB.");
        return;
      }
      setIsProcessingImage(true);
      try {
        const resizedImage = await resizeImage(file, 800); // Resize to max width of 800px
        setImageUrl(resizedImage);
      } catch (error) {
        console.error("Error resizing image:", error);
        alert("Could not process the image. Please try another one.");
      } finally {
        setIsProcessingImage(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !tag.trim() || !date) {
        alert("Please fill out all fields.");
        return;
    }
    
    if (startTime >= endTime) {
        alert("End time must be after start time.");
        return;
    }

    const taskData = {
      date,
      startTime,
      endTime,
      description,
      tag,
      imageUrl,
    };

    if (existingTask) {
      onUpdateTask({ ...taskData, id: existingTask.id });
    } else {
      onAddTask(taskData);
    }
  };

  const handleSuggestTag = async () => {
    if (!description.trim()) {
      alert("Please enter a description first.");
      return;
    }
    setIsSuggesting(true);
    try {
      const suggestedTag = await geminiService.suggestTag(description, allTags);
      setTag(suggestedTag);
    } catch (error) {
      console.error("Error suggesting tag:", error);
      alert("Could not suggest a tag at this time.");
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-3xl font-bold text-white">{existingTask ? 'Edit Task' : 'Add New Task'}</h2>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-bunker-300 mb-1">Description</label>
        <input
          id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 bg-bunker-800 border-2 border-bunker-700 rounded-lg text-white placeholder-bunker-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
          required
        />
      </div>

       <div>
        <label htmlFor="date" className="block text-sm font-medium text-bunker-300 mb-1">Date</label>
        <input
          id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-2 bg-bunker-800 border-2 border-bunker-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-bunker-300 mb-1">Start Time</label>
          <input
            id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-4 py-2 bg-bunker-800 border-2 border-bunker-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
            required
          />
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-bunker-300 mb-1">End Time</label>
          <input
            id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-4 py-2 bg-bunker-800 border-2 border-bunker-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
            required
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="tag" className="block text-sm font-medium text-bunker-300 mb-1">Tag</label>
        <div className="flex gap-2">
            <input
                id="tag" type="text" list="tags-datalist" value={tag} onChange={(e) => setTag(e.target.value)}
                className="flex-grow px-4 py-2 bg-bunker-800 border-2 border-bunker-700 rounded-lg text-white placeholder-bunker-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                required
            />
            <datalist id="tags-datalist">
                {allTags.map(t => <option key={t} value={t} />)}
            </datalist>
            <button
                type="button" onClick={handleSuggestTag} disabled={isSuggesting}
                className="flex-shrink-0 px-4 py-2 bg-bunker-700 text-sky-300 rounded-lg hover:bg-bunker-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
            >
                <SparklesIcon className="w-5 h-5" />
                <span>{isSuggesting ? 'Thinking...' : 'Suggest'}</span>
            </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-bunker-300 mb-1">Attach Image (Optional)</label>
        {imageUrl ? (
            <div className="flex items-center gap-4">
                <img src={imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-md" />
                <button type="button" onClick={() => setImageUrl(undefined)} className="flex items-center gap-2 text-red-400 hover:text-red-300 font-semibold">
                    <XCircleIcon className="w-5 h-5" /> Remove Image
                </button>
            </div>
        ) : (
            <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-bunker-800 border-2 border-dashed border-bunker-700 rounded-lg text-bunker-300 hover:bg-bunker-700 hover:border-sky-500 cursor-pointer transition-colors">
                <PhotoIcon className="w-6 h-6" />
                <span>{isProcessingImage ? 'Processing...' : 'Click to upload'}</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
        )}
      </div>
      
      <button
        type="submit" disabled={isProcessingImage}
        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-bunker-700 disabled:cursor-wait"
      >
        {existingTask ? 'Update Task' : 'Save Task'}
      </button>
    </form>
  );
};

export default TaskForm;