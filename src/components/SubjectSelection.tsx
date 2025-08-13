import React from 'react';
import { TrendingUp, Users } from 'lucide-react';
import { Subject } from '../types';

interface SubjectSelectionProps {
  onSelect: (subject: Subject) => void;
  isDark: boolean;
}

export const SubjectSelection: React.FC<SubjectSelectionProps> = ({ onSelect, isDark }) => {
  const subjects = [
    { id: 'Business' as Subject, name: 'Business', icon: TrendingUp, color: 'from-orange-500 to-red-600', description: 'Learn business concepts and strategies' },
    { id: 'Economics' as Subject, name: 'Economics', icon: Users, color: 'from-indigo-500 to-purple-600', description: 'Understand economic principles and theories' }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
          Choose Your Subject
        </h2>
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
          Select the subject you want to study
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => onSelect(subject.id)}
            className={`group relative overflow-hidden rounded-2xl p-8 h-64 ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full">
              <div className={`w-16 h-16 mb-4 bg-gradient-to-br ${subject.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <subject.icon size={32} className="text-white" />
              </div>
              
              <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                {subject.name}
              </h3>
              
              <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
                {subject.description}
              </p>
              
              <div className={`mt-4 px-4 py-2 rounded-full bg-gradient-to-r ${subject.color} text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                Start Learning
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};