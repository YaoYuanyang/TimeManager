
import React, { useState } from 'react';
import SyncModal from './SyncModal';
import { LogoIcon, UserIcon, ArrowRightStartOnRectangleIcon, ArrowUpOnSquareIcon } from './Icons';

interface HeaderProps {
  user: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  return (
    <>
      <header className="bg-bunker-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 border-b border-bunker-800">
            <div className="flex items-center gap-3">
              <LogoIcon className="h-10 w-10 text-sky-500" />
              <span className="text-2xl font-bold text-white">ChronoSync</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <UserIcon className="h-6 w-6 text-bunker-300" />
                <span className="text-bunker-100 font-medium hidden sm:block">{user}</span>
              </div>
               <button 
                onClick={() => setIsSyncModalOpen(true)}
                className="p-2 rounded-full text-bunker-300 hover:bg-bunker-700 hover:text-white transition-colors"
                title="Sync Data"
               >
                <ArrowUpOnSquareIcon className="h-6 w-6" />
               </button>
              <button 
                onClick={onLogout}
                className="p-2 rounded-full text-bunker-300 hover:bg-bunker-700 hover:text-white transition-colors"
                title="Logout"
              >
                <ArrowRightStartOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>
      {isSyncModalOpen && <SyncModal onClose={() => setIsSyncModalOpen(false)} />}
    </>
  );
};

export default React.memo(Header);
