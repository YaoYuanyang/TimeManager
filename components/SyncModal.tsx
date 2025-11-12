
import React, { useState } from 'react';
import { encryptData, decryptData } from '../utils/crypto.ts';
import { ClipboardDocumentIcon, ClipboardDocumentCheckIcon, XMarkIcon, KeyIcon } from './Icons.tsx';

interface SyncModalProps {
  onClose: () => void;
}

const SyncModal: React.FC<SyncModalProps> = ({ onClose }) => {
  const [importCode, setImportCode] = useState('');
  const [exportPassword, setExportPassword] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    if (!exportPassword) {
      alert("Please enter a password to encrypt your data.");
      return;
    }
    setIsExporting(true);
    try {
      const userJson = localStorage.getItem('chronosync_user');
      if (!userJson) {
        alert("You must be logged in to export data.");
        return;
      }
      
      const user = JSON.parse(userJson);
      const tasks = localStorage.getItem(`chronosync_tasks_${user}`);
      const tags = localStorage.getItem(`chronosync_tags_${user}`);
      
      const data = { 
        user: user, 
        tasks: tasks ? JSON.parse(tasks) : [], 
        tags: tags ? JSON.parse(tags) : [] 
      };

      const encryptedData = await encryptData(data, exportPassword);
      navigator.clipboard.writeText(encryptedData);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
        alert('Could not export data. See console for details.');
        console.error("Export error:", error);
    } finally {
        setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importCode.trim() || !importPassword) {
        alert("Please paste your sync code and enter the password.");
        return;
    }
    if (window.confirm('This will overwrite all current data on this device for the imported user. Are you sure?')) {
      setIsImporting(true);
      try {
        const { user, tasks, tags } = await decryptData(importCode, importPassword);
        
        if (!user || !tasks || !tags) {
            throw new Error("Data is incomplete.");
        }

        localStorage.setItem(`chronosync_tasks_${user}`, JSON.stringify(tasks));
        localStorage.setItem(`chronosync_tags_${user}`, JSON.stringify(tags));
        localStorage.setItem('chronosync_user', JSON.stringify(user));
        
        alert('Data imported successfully! The page will now reload to apply changes.');
        window.location.reload();
      } catch (error) {
        alert('Import failed. The sync code or password may be incorrect. Please check and try again.');
        console.error("Import error:", error);
      } finally {
        setIsImporting(false);
      }
    }
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
        <h2 className="text-2xl font-bold text-white mb-4">Secure Sync</h2>
        <p className="text-bunker-300 mb-6">Your data is encrypted with a password. Use the same password to import on another device.</p>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-bunker-100 mb-2">Export Data</h3>
            <p className="text-sm text-bunker-400 mb-3">Create an encrypted sync code from this device's data.</p>
            <div className="relative mb-3">
              <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bunker-400" />
              <input
                type="password"
                value={exportPassword}
                onChange={(e) => setExportPassword(e.target.value)}
                placeholder="Enter encryption password"
                className="w-full pl-10 pr-4 py-3 bg-bunker-800 border-2 border-bunker-700 rounded-lg text-white placeholder-bunker-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
              />
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting || !exportPassword}
              className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-bunker-700 disabled:cursor-wait"
            >
              {copied ? <ClipboardDocumentCheckIcon className="w-6 h-6"/> : <ClipboardDocumentIcon className="w-6 h-6" />}
              <span>{isExporting ? 'Encrypting...' : copied ? 'Copied to Clipboard!' : 'Copy Secure Sync Code'}</span>
            </button>
          </div>

          <div className="border-t border-bunker-700"></div>

          <div>
            <h3 className="text-lg font-semibold text-bunker-100 mb-2">Import Data</h3>
            <p className="text-sm text-bunker-400 mb-3">Paste the sync code and enter the password to overwrite data on this device.</p>
            <textarea
              value={importCode}
              onChange={(e) => setImportCode(e.target.value)}
              placeholder="Paste sync code here..."
              className="w-full h-24 p-3 bg-bunker-800 border-2 border-bunker-700 rounded-lg text-white placeholder-bunker-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all resize-none mb-3"
            />
             <div className="relative">
              <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bunker-400" />
              <input
                type="password"
                value={importPassword}
                onChange={(e) => setImportPassword(e.target.value)}
                placeholder="Enter decryption password"
                className="w-full pl-10 pr-4 py-3 bg-bunker-800 border-2 border-bunker-700 rounded-lg text-white placeholder-bunker-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
              />
            </div>
            <button
              onClick={handleImport}
              disabled={isImporting || !importCode || !importPassword}
              className="w-full mt-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-bunker-700 disabled:cursor-wait"
            >
              {isImporting ? 'Decrypting & Importing...' : 'Import Data & Reload'}
            </button>
          </div>
        </div>
      </div>
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

export default React.memo(SyncModal);