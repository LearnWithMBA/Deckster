import React from 'react';
import { BookOpen, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Progress } from '../types';

interface TopicSelectionProps {
  topics: string[];
  onSelect: (topic: string) => void;
  isDark: boolean;
  progress: Progress;
  level: string;
  subject: string;
}

export const TopicSelection: React.FC<TopicSelectionProps> = ({ 
  topics, 
  onSelect, 
  isDark, 
  progress, 
  level, 
  subject 
}) => {
  const getTopicKey = (topic: string) => `${level}-${subject}-${topic}`;
  
  const getTopicStats = (topic: string) => {
    const key = getTopicKey(topic);
    const topicProgress = progress[key];
    
    if (!topicProgress) {
      return { confident: 0, confused: 0, needsAttention: 0, total: 0 };
    }
    
    return {
      confident: topicProgress.confident.length,
      confused: topicProgress.confused.length,
      needsAttention: topicProgress.needsAttention.length,
      total: topicProgress.confident.length + topicProgress.confused.length + topicProgress.needsAttention.length
    };
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
          Select a Topic
        </h2>
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
          Choose a topic to start studying flashcards
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic, index) => {
          const stats = getTopicStats(topic);
          const completionPercentage = stats.total > 0 ? Math.round((stats.confident / stats.total) * 100) : 0;
          
          return (
            <button
              key={topic}
              onClick={() => onSelect(topic)}
              className={`group relative overflow-hidden rounded-xl p-6 ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-left`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md`}>
                  <BookOpen size={24} className="text-white" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                  {index + 1}
                </span>
              </div>
              
              <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-300 line-clamp-2`}>
                {topic}
              </h3>
              
              {stats.total > 0 && (
                <div className="space-y-3">
                  <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <CheckCircle size={12} className="text-green-500" />
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stats.confident}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <AlertCircle size={12} className="text-yellow-500" />
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stats.confused}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <XCircle size={12} className="text-red-500" />
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stats.needsAttention}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className={`mt-4 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center`}>
                Study Now
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};