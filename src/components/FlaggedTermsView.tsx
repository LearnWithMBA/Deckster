import React, { useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, BookOpen, Filter } from 'lucide-react';
import { Flashcard, Progress } from '../types';

interface FlaggedTermsViewProps {
  allFlashcards: { [key: string]: Flashcard[] };
  progress: Progress;
  isDark: boolean;
  level: string;
  subject: string;
  onBack: () => void;
}

export const FlaggedTermsView: React.FC<FlaggedTermsViewProps> = ({ 
  allFlashcards, 
  progress, 
  isDark, 
  level, 
  subject, 
  onBack 
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'confident' | 'confused' | 'needsAttention'>('all');

  const getFlaggedTerms = () => {
    const flaggedTerms: {
      term: string;
      definition: string;
      topic: string;
      status: 'confident' | 'confused' | 'needsAttention';
    }[] = [];

    Object.entries(allFlashcards).forEach(([topic, cards]) => {
      const topicKey = `${level}-${subject}-${topic}`;
      const topicProgress = progress[topicKey];
      
      if (topicProgress) {
        // Add confident terms
        topicProgress.confident.forEach(cardId => {
          const card = cards.find(c => c.id === cardId);
          if (card) {
            flaggedTerms.push({
              term: card.term,
              definition: card.definition,
              topic,
              status: 'confident'
            });
          }
        });

        // Add confused terms
        topicProgress.confused.forEach(cardId => {
          const card = cards.find(c => c.id === cardId);
          if (card) {
            flaggedTerms.push({
              term: card.term,
              definition: card.definition,
              topic,
              status: 'confused'
            });
          }
        });

        // Add needs attention terms
        topicProgress.needsAttention.forEach(cardId => {
          const card = cards.find(c => c.id === cardId);
          if (card) {
            flaggedTerms.push({
              term: card.term,
              definition: card.definition,
              topic,
              status: 'needsAttention'
            });
          }
        });
      }
    });

    return flaggedTerms;
  };

  const flaggedTerms = getFlaggedTerms();
  const filteredTerms = selectedFilter === 'all' 
    ? flaggedTerms 
    : flaggedTerms.filter(term => term.status === selectedFilter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confident':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'confused':
        return <AlertCircle size={20} className="text-yellow-500" />;
      case 'needsAttention':
        return <XCircle size={20} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confident':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'confused':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'needsAttention':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default:
        return isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50';
    }
  };

  const getStats = () => {
    const confident = flaggedTerms.filter(t => t.status === 'confident').length;
    const confused = flaggedTerms.filter(t => t.status === 'confused').length;
    const needsAttention = flaggedTerms.filter(t => t.status === 'needsAttention').length;
    
    return { confident, confused, needsAttention, total: flaggedTerms.length };
  };

  const stats = getStats();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Flagged Terms
        </h2>
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Review all your flagged terms from {subject} topics
        </p>
      </div>

      {/* Stats Overview */}
      <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-8`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.total}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Flagged
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {stats.confident}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Confident
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {stats.confused}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Confused
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {stats.needsAttention}
            </div>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Needs Attention
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            selectedFilter === 'all'
              ? 'bg-blue-500 text-white'
              : isDark
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <Filter size={16} />
          <span>All ({stats.total})</span>
        </button>
        <button
          onClick={() => setSelectedFilter('confident')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            selectedFilter === 'confident'
              ? 'bg-green-500 text-white'
              : isDark
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <CheckCircle size={16} />
          <span>Confident ({stats.confident})</span>
        </button>
        <button
          onClick={() => setSelectedFilter('confused')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            selectedFilter === 'confused'
              ? 'bg-yellow-500 text-white'
              : isDark
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <AlertCircle size={16} />
          <span>Confused ({stats.confused})</span>
        </button>
        <button
          onClick={() => setSelectedFilter('needsAttention')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            selectedFilter === 'needsAttention'
              ? 'bg-red-500 text-white'
              : isDark
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <XCircle size={16} />
          <span>Needs Attention ({stats.needsAttention})</span>
        </button>
      </div>

      {/* Terms List */}
      {filteredTerms.length === 0 ? (
        <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">
            {selectedFilter === 'all' 
              ? 'No flagged terms yet. Start studying to flag terms!'
              : `No terms flagged as ${selectedFilter.replace(/([A-Z])/g, ' $1').toLowerCase()}.`
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4 mb-8">
          {filteredTerms.map((term, index) => (
            <div
              key={index}
              className={`p-6 rounded-xl border-2 ${getStatusColor(term.status)} transition-all duration-200 hover:shadow-lg`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(term.status)}
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {term.term}
                    </h3>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                    Topic: {term.topic}
                  </p>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                    {term.definition}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Back Button */}
      <div className="text-center">
        <button
          onClick={onBack}
          className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
        >
          Back to Topics
        </button>
      </div>
    </div>
  );
};