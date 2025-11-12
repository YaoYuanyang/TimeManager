
import React, { useState, useMemo } from 'react';
import { Task, TagData } from '../types';
import { XMarkIcon, PencilIcon, CheckIcon, TrashIcon } from './Icons';

interface TagManagerModalProps {
  tasks: Task[];
  tags: TagData[];
  onClose: () => void;
  onRenameTag: (oldTag: string, newTag: string) => void;
  onUpdateTagColor: (tagName: string, color: string) => void;
  onDeleteTag: (tagName: string) => void;
}

const TagManagerModal: React.FC<TagManagerModalProps> = ({ tasks, tags, onClose, onRenameTag, onUpdateTagColor, onDeleteTag }) => {
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');

  const tagDataWithCounts = useMemo(() => {
    const counts = new Map<string, number>();
    tasks.forEach(task => {
      counts.set(task.tag, (counts.get(task.tag) || 0) + 1);
    });
    return tags
        .map(tag => ({ ...tag, count: counts.get(tag.name) || 0 }))
        .sort((a, b) => a.name.localeCompare(b.name));
  }, [tasks, tags]);

  const handleStartEdit = (tag: TagData) => {
    setEditingTag(tag.name);
    setNewTagName(tag.name);
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setNewTagName('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTag) {
        onRenameTag(editingTag, newTagName);
    }
    handleCancelEdit();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-bunker-900 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-lg relative transform transition-all duration-300 scale-95 animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-bunker-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-7 h-7" />
        </button>
        <h2 className="text-2xl font-bold text-white mb-2">Manage Tags</h2>
        <p className="text-bunker-300 mb-6">Rename tags or change their color. Changes will apply everywhere.</p>
        
        <div className="max-h-[60vh] overflow-y-auto pr-2">
            {tagDataWithCounts.length > 0 ? (
                <ul className="space-y-3">
                    {tagDataWithCounts.map((tag) => (
                        <li key={tag.name} className="bg-bunker-800 p-3 rounded-lg flex items-center justify-between gap-4">
                        {editingTag === tag.name ? (
                            <form onSubmit={handleSaveEdit} className="flex-1 flex items-center gap-2">
                                <input
                                    type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)}
                                    className="flex-grow px-3 py-1 bg-bunker-700 border-2 border-sky-500 rounded-md text-white placeholder-bunker-500 focus:outline-none"
                                    autoFocus
                                />
                                <button type="submit" className="p-2 text-emerald-400 hover:bg-bunker-700 rounded-full transition-colors">
                                    <CheckIcon className="w-5 h-5" />
                                </button>
                                <button type="button" onClick={handleCancelEdit} className="p-2 text-bunker-400 hover:bg-bunker-700 rounded-full transition-colors">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </form>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="relative w-8 h-8 flex-shrink-0">
                                        <div className="w-full h-full rounded-full" style={{ backgroundColor: tag.color }}></div>
                                        <input
                                            type="color"
                                            value={tag.color}
                                            onChange={(e) => onUpdateTagColor(tag.name, e.target.value)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            title="Change tag color"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-bunker-100">{tag.name}</p>
                                        <p className="text-sm text-bunker-400">{tag.count} task{tag.count !== 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleStartEdit(tag)} className="p-2 text-bunker-400 hover:text-yellow-400 rounded-full hover:bg-bunker-700 transition-colors" title="Rename Tag">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => onDeleteTag(tag.name)}
                                        disabled={tag.count > 0}
                                        className="p-2 rounded-full transition-colors disabled:text-bunker-600 disabled:cursor-not-allowed text-bunker-400 hover:text-red-400 hover:bg-bunker-700"
                                        title={tag.count > 0 ? "Cannot delete a tag that is currently in use." : "Delete Tag"}
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </>
                        )}
                        </li>
                    ))}
                </ul>
            ) : (
                 <div className="text-center py-12 border-2 border-dashed border-bunker-700 rounded-lg">
                    <p className="text-bunker-400">No tags have been created yet.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(TagManagerModal);
