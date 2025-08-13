import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDark, toggleTheme }) => {
  return (
    <header className={`w-full py-4 px-6 ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-lg transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg ${isDark ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-purple-500'} flex items-center justify-center text-white font-bold text-lg`}>
            D
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
              Deckster
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
              by MBA
            </p>
          </div>
        </div>
        
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full ${isDark ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-all duration-300 hover:scale-110`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
};