import React, { useState, useEffect } from 'react';
import { Shuffle, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Flashcard, Progress } from '../types';

interface FlashcardViewProps {
  flashcards: Flashcard[];
  topicKey: string;
  isDark: boolean;
  progress: Progress;
  updateProgress: (topicKey: string, cardId: number, status: 'confident' | 'confused' | 'needsAttention') => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({ 
  flashcards, 
  topicKey, 
  isDark, 
  progress, 
  updateProgress 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>(flashcards);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    setShuffledCards(flashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [flashcards]);

  const shuffleCards = () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const nextCard = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setSlideDirection('left');
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
        setSlideDirection(null);
      }, 150);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setSlideDirection('right');
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1);
        setIsFlipped(false);
        setSlideDirection(null);
      }, 150);
    }
  };

  const handleStatusUpdate = (status: 'confident' | 'confused' | 'needsAttention') => {
    updateProgress(topicKey, shuffledCards[currentIndex].id, status);
  };

  const getCurrentCardStatus = () => {
    const topicProgress = progress[topicKey];
    if (!topicProgress) return null;
    
    const cardId = shuffledCards[currentIndex].id;
    if (topicProgress.confident.includes(cardId)) return 'confident';
    if (topicProgress.confused.includes(cardId)) return 'confused';
    if (topicProgress.needsAttention.includes(cardId)) return 'needsAttention';
    return null;
  };

  const getTopicStats = () => {
    const topicProgress = progress[topicKey];
    if (!topicProgress) {
      return { confident: 0, confused: 0, needsAttention: 0, total: shuffledCards.length };
    }
    
    return {
      confident: topicProgress.confident.length,
      confused: topicProgress.confused.length,
      needsAttention: topicProgress.needsAttention.length,
      total: shuffledCards.length
    };
  };

  const stats = getTopicStats();
  const completionPercentage = Math.round((stats.confident / stats.total) * 100);

  if (shuffledCards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          No flashcards available for this topic.
        </p>
      </div>
    );
  }

  const currentCard = shuffledCards[currentIndex];
  const currentStatus = getCurrentCardStatus();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className={`mb-8 p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg transition-colors duration-300`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Progress Overview
          </h3>
          <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {completionPercentage}%
          </span>
        </div>
        
        <div className={`w-full bg-gray-200 rounded-full h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} mb-4`}>
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-300" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Confident: {stats.confident}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} className="text-yellow-500" />
            <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Confused: {stats.confused}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <XCircle size={16} className="text-red-500" />
            <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Needs Attention: {stats.needsAttention}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={shuffleCards}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} transition-colors duration-200`}
        >
          <Shuffle size={20} />
          <span>Shuffle</span>
        </button>
        
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {currentIndex + 1} of {shuffledCards.length}
        </span>
        
        <div className="flex space-x-2">
          <button
            onClick={prevCard}
            disabled={currentIndex === 0}
            className={`p-2 rounded-lg ${currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'} ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'} transition-all duration-200`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextCard}
            disabled={currentIndex === shuffledCards.length - 1}
            className={`p-2 rounded-lg ${currentIndex === shuffledCards.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'} ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'} transition-all duration-200`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Flashcard */}
      <div className="perspective-1000 mb-8">
        <div
          className={`relative w-full h-80 cursor-pointer transform-style-preserve-3d transition-transform duration-700 ${
            isFlipped ? 'rotate-y-180' : ''
          } ${slideDirection === 'left' ? 'translate-x-full opacity-0' : slideDirection === 'right' ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div className={`absolute inset-0 rounded-2xl ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'} shadow-2xl backface-hidden flex items-center justify-center p-8 border-2 ${
            currentStatus === 'confident' ? 'border-green-500' : 
            currentStatus === 'confused' ? 'border-yellow-500' : 
            currentStatus === 'needsAttention' ? 'border-red-500' : 
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="text-center">
              <div className={`text-xs font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                TERM
              </div>
              <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 leading-tight`}>
                {currentCard.term}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} opacity-75`}>
                Click to reveal definition
              </p>
            </div>
          </div>

          {/* Back */}
          <div className={`absolute inset-0 rounded-2xl ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-50 to-blue-50'} shadow-2xl backface-hidden rotate-y-180 flex items-center justify-center p-8 border-2 ${
            currentStatus === 'confident' ? 'border-green-500' : 
            currentStatus === 'confused' ? 'border-yellow-500' : 
            currentStatus === 'needsAttention' ? 'border-red-500' : 
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="text-center">
              <div className={`text-xs font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                DEFINITION
              </div>
              <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'} leading-relaxed`}>
                {currentCard.definition}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => handleStatusUpdate('confident')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
            currentStatus === 'confident'
              ? 'bg-green-500 text-white shadow-lg'
              : isDark
              ? 'bg-gray-800 hover:bg-green-500 text-gray-300 hover:text-white'
              : 'bg-gray-100 hover:bg-green-500 text-gray-700 hover:text-white'
          }`}
        >
          <CheckCircle size={20} />
          <span>Confident</span>
        </button>
        
        <button
          onClick={() => handleStatusUpdate('confused')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
            currentStatus === 'confused'
              ? 'bg-yellow-500 text-white shadow-lg'
              : isDark
              ? 'bg-gray-800 hover:bg-yellow-500 text-gray-300 hover:text-white'
              : 'bg-gray-100 hover:bg-yellow-500 text-gray-700 hover:text-white'
          }`}
        >
          <AlertCircle size={20} />
          <span>Confused</span>
        </button>
        
        <button
          onClick={() => handleStatusUpdate('needsAttention')}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
            currentStatus === 'needsAttention'
              ? 'bg-red-500 text-white shadow-lg'
              : isDark
              ? 'bg-gray-800 hover:bg-red-500 text-gray-300 hover:text-white'
              : 'bg-gray-100 hover:bg-red-500 text-gray-700 hover:text-white'
          }`}
        >
          <XCircle size={20} />
          <span>Needs Attention</span>
        </button>
      </div>
    </div>
  );
};