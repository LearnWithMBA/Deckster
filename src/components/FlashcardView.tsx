import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Shuffle, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Flashcard, Progress } from '../types';

type Status = 'confident' | 'confused' | 'needsAttention';

interface FlashcardViewProps {
  flashcards: Flashcard[];
  topicKey: string;
  isDark: boolean;
  progress: Progress;
  updateProgress: (topicKey: string, cardId: number, status: Status) => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  flashcards,
  topicKey,
  isDark,
  progress,
  updateProgress,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<Flashcard[]>(flashcards);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  // ----- AUDIO + HAPTICS -----
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ensureAudioCtx = () => {
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        // no audio available
      }
    }
    return audioCtxRef.current;
  };
  const buzz = (ms = 15) => navigator.vibrate?.(ms);
  const playTone = (freq = 440, dur = 0.06) => {
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  };

  useEffect(() => {
    return () => {
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
    };
  }, []);

  // ----- EFFECT: reset on incoming flashcards change -----
  useEffect(() => {
    setShuffledCards(flashcards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [flashcards]);

  // ----- SHUFFLE (Fisher–Yates) -----
  const shuffleCards = () => {
    const a = [...flashcards];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    setShuffledCards(a);
    setCurrentIndex(0);
    setIsFlipped(false);
    playTone(520, 0.05);
    buzz(12);
  };

  // ----- NAVIGATION -----
  const nextCard = useCallback(() => {
    setSlideDirection('left');
    setTimeout(() => {
      setCurrentIndex((i) => {
        const next = Math.min(i + 1, shuffledCards.length - 1);
        return next;
      });
      setIsFlipped(false);
      setSlideDirection(null);
    }, 150);
  }, [shuffledCards.length]);

  const prevCard = useCallback(() => {
    setSlideDirection('right');
    setTimeout(() => {
      setCurrentIndex((i) => Math.max(i - 1, 0));
      setIsFlipped(false);
      setSlideDirection(null);
    }, 150);
  }, []);

  // ----- STATUS -----
  const handleStatusUpdate = (status: Status) => {
    const card = shuffledCards[currentIndex];
    if (!card) return;
    updateProgress(topicKey, card.id, status);
    // subtle feedback
    buzz(15);
    playTone(status === 'confident' ? 660 : status === 'confused' ? 520 : 400, 0.06);
  };

  const getCurrentCardStatus = (): Status | null => {
    const topicProgress = progress[topicKey];
    if (!topicProgress) return null;
    const cardId = shuffledCards[currentIndex]?.id;
    if (cardId == null) return null;
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
      total: shuffledCards.length,
    };
  };

  const stats = getTopicStats();
  const completionPercentage = stats.total ? Math.round((stats.confident / stats.total) * 100) : 0;

  // ----- KEYBOARD SHORTCUTS -----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // flip
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((f) => !f);
        playTone(500, 0.04);
        return;
      }
      // navigation
      if (e.key === 'ArrowRight') return nextCard();
      if (e.key === 'ArrowLeft') return prevCard();
      // statuses
      if (e.key === '1') return handleStatusUpdate('confident');
      if (e.key === '2') return handleStatusUpdate('confused');
      if (e.key === '3') return handleStatusUpdate('needsAttention');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nextCard, prevCard]);

  // ----- SWIPE GESTURES -----
  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const pointerDown = (e: React.PointerEvent) => {
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
  };
  const pointerUp = (e: React.PointerEvent) => {
    if (startXRef.current == null || startYRef.current == null) return;
    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const SWIPE_THRESHOLD = 60;

    if (absX > absY && absX > SWIPE_THRESHOLD) {
      if (dx < 0) nextCard();
      else prevCard();
    } else if (absX < SWIPE_THRESHOLD && absY < SWIPE_THRESHOLD) {
      // treat as tap
      setIsFlipped((f) => !f);
      playTone(500, 0.04);
    }
    startXRef.current = null;
    startYRef.current = null;
  };
  const pointerCancel = () => {
    startXRef.current = null;
    startYRef.current = null;
  };

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
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Progress Overview</h3>
          <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{completionPercentage}%</span>
        </div>

        <div className={`w-full rounded-full h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} mb-4`}>
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="flex justify-between text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Confident: {stats.confident}</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} className="text-yellow-500" />
            <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Confused: {stats.confused}</span>
          </div>
          <div className="flex items-center space-x-2">
            <XCircle size={16} className="text-red-500" />
            <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Needs Attention: {stats.needsAttention}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={shuffleCards}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          } transition-colors duration-200`}
          type="button"
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
            className={`p-2 rounded-lg ${
              currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
            } ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'} transition-all duration-200`}
            type="button"
            aria-label="Previous card"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextCard}
            disabled={currentIndex === shuffledCards.length - 1}
            className={`p-2 rounded-lg ${
              currentIndex === shuffledCards.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
            } ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'} transition-all duration-200`}
            type="button"
            aria-label="Next card"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Flashcard (Framer Motion 3D flip + swipe) */}
      <div className="mb-8" style={{ perspective: 1000 }}>
        <motion.div
          role="button"
          tabIndex={0}
          aria-pressed={isFlipped}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsFlipped((f) => !f);
              playTone(500, 0.04);
            }
          }}
          onPointerDown={pointerDown}
          onPointerUp={pointerUp}
          onPointerCancel={pointerCancel}
          onPointerLeave={pointerCancel}
          className={`relative w-full h-80 cursor-pointer select-none transition-opacity duration-150 ${
            slideDirection === 'left'
              ? 'translate-x-full opacity-0'
              : slideDirection === 'right'
              ? '-translate-x-full opacity-0'
              : 'translate-x-0 opacity-100'
          }`}
          style={{ transformStyle: 'preserve-3d' as any }}
          animate={isFlipped ? { rotateY: 180 } : { rotateY: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          {/* Front */}
          <div
            className={`absolute inset-0 rounded-2xl ${
              isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'
            } shadow-2xl flex items-center justify-center p-8 border-2 ${
              currentStatus === 'confident'
                ? 'border-green-500'
                : currentStatus === 'confused'
                ? 'border-yellow-500'
                : currentStatus === 'needsAttention'
                ? 'border-red-500'
                : isDark
                ? 'border-gray-700'
                : 'border-gray-200'
            }`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-center">
              <div className={`text-xs font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>TERM</div>
              <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 leading-tight`}>
                {currentCard.term}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} opacity-75`}>
                Tap/Click to reveal definition
              </p>
            </div>
          </div>

          {/* Back */}
          <div
            className={`absolute inset-0 rounded-2xl ${
              isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-purple-50 to-blue-50'
            } shadow-2xl flex items-center justify-center p-8 border-2 ${
              currentStatus === 'confident'
                ? 'border-green-500'
                : currentStatus === 'confused'
                ? 'border-yellow-500'
                : currentStatus === 'needsAttention'
                ? 'border-red-500'
                : isDark
                ? 'border-gray-700'
                : 'border-gray-200'
            }`}
            style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
          >
            <div className="text-center">
              <div className={`text-xs font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>DEFINITION</div>
              <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'} leading-relaxed`}>
                {currentCard.definition}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Status Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => handleStatusUpdate('confident')}
          aria-pressed={currentStatus === 'confident'}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
            currentStatus === 'confident'
              ? 'bg-green-500 text-white shadow-lg'
              : isDark
              ? 'bg-gray-800 hover:bg-green-500 text-gray-300 hover:text-white'
              : 'bg-gray-100 hover:bg-green-500 text-gray-700 hover:text-white'
          }`}
          type="button"
          title="Mark as confident (1)"
        >
          <CheckCircle size={20} />
          <span>Confident</span>
        </button>

        <button
          onClick={() => handleStatusUpdate('confused')}
          aria-pressed={currentStatus === 'confused'}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
            currentStatus === 'confused'
              ? 'bg-yellow-500 text-white shadow-lg'
              : isDark
              ? 'bg-gray-800 hover:bg-yellow-500 text-gray-300 hover:text-white'
              : 'bg-gray-100 hover:bg-yellow-500 text-gray-700 hover:text-white'
          }`}
          type="button"
          title="Mark as confused (2)"
        >
          <AlertCircle size={20} />
          <span>Confused</span>
        </button>

        <button
          onClick={() => handleStatusUpdate('needsAttention')}
          aria-pressed={currentStatus === 'needsAttention'}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
            currentStatus === 'needsAttention'
              ? 'bg-red-500 text-white shadow-lg'
              : isDark
              ? 'bg-gray-800 hover:bg-red-500 text-gray-300 hover:text-white'
              : 'bg-gray-100 hover:bg-red-500 text-gray-700 hover:text-white'
          }`}
          type="button"
          title="Mark as needs attention (3)"
        >
          <XCircle size={20} />
          <span>Needs Attention</span>
        </button>
      </div>
    </div>
  );
};
