import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { NavigationState } from '../types';

interface BreadcrumbProps {
  navigation: NavigationState;
  isDark: boolean;
  onNavigate: (level?: any, subject?: any, topic?: any) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ navigation, isDark, onNavigate }) => {
  if (!navigation.level) return null;

  return (
    <nav className="flex items-center space-x-2 mb-6">
      <button
        onClick={() => onNavigate()}
        className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors duration-200`}
      >
        <Home size={16} />
      </button>
      
      <ChevronRight size={16} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
      
      <button
        onClick={() => onNavigate()}
        className={`text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors duration-200`}
      >
        {navigation.level}
      </button>
      
      {navigation.subject && (
        <>
          <ChevronRight size={16} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
          <button
            onClick={() => onNavigate(navigation.level)}
            className={`text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors duration-200`}
          >
            {navigation.subject}
          </button>
        </>
      )}
      
      {navigation.topic && (
        <>
          <ChevronRight size={16} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {navigation.topic}
          </span>
        </>
      )}
    </nav>
  );
};