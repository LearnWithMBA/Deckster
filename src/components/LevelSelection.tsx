import React from 'react';
import { BookOpen, GraduationCap, Trophy } from 'lucide-react';
import { Level } from '../types';

interface LevelSelectionProps {
  onSelect: (level: Level) => void;
  isDark: boolean;
}

export const LevelSelection: React.FC<LevelSelectionProps> = ({ onSelect, isDark }) => {
  const levels = [
    { id: 'IGCSE' as Level, name: 'IGCSE', icon: BookOpen, color: 'from-green-500 to-emerald-600', description: 'International General Certificate' },
    { id: 'AS' as Level, name: 'AS Level', icon: GraduationCap, color: 'from-blue-500 to-cyan-600', description: 'Advanced Subsidiary Level' },
    { id: 'A2' as Level, name: 'A2 Level', icon: Trophy, color: 'from-purple-500 to-violet-600', description: 'Advanced Level' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
          Select Your Level
        </h2>
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
          Choose your academic level to get started with your flashcards
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => onSelect(level.id)}
            className={`group relative overflow-hidden rounded-2xl p-8 h-64 ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <div className={`w-16 h-16 mb-4 bg-gradient-to-br ${level.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <level.icon size={32} className="text-white" />
              </div>
              
              <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                {level.name}
              </h3>
              
              <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
                {level.description}
              </p>
              
              <div className={`mt-4 px-4 py-2 rounded-full bg-gradient-to-r ${level.color} text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                Get Started
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};