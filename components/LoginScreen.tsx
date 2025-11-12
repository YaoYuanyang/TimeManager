
import React, { useState } from 'react';
import { LogoIcon } from './Icons.tsx';

interface LoginScreenProps {
  onLogin: (name: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bunker-950 p-4">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="flex justify-center items-center gap-4 mb-6">
            <LogoIcon className="w-16 h-16 text-sky-500"/>
            <h1 className="text-5xl font-bold text-white">ChronoSync</h1>
        </div>
        <p className="text-bunker-300 text-lg mb-8">Your personal time-tracking companion.</p>

        <div className="bg-bunker-900 p-8 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-semibold text-white mb-6">Welcome! What should we call you?</h2>
            <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-bunker-800 border-2 border-bunker-700 rounded-lg text-white placeholder-bunker-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                required
            />
            <button
                type="submit"
                className="w-full mt-6 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:bg-bunker-700 disabled:cursor-not-allowed"
                disabled={!name.trim()}
            >
                Start Tracking
            </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LoginScreen);