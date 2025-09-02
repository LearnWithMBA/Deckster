import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { Flashcard, Progress, QuizQuestion, QuizResult } from '../types';

interface QuizViewProps {
  allFlashcards: { [key: string]: Flashcard[] };
  progress: Progress;
  isDark: boolean;
  level: string;
  subject: string;
  onBack: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ 
  allFlashcards, 
  progress, 
  isDark, 
  level, 
  subject, 
  onBack 
}) => {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmitQuiz();
    }
  }, [timeLeft, quizStarted, showResults]);

  const generateQuiz = () => {
    const allCards: (Flashcard & { topicKey: string })[] = [];
    
    // Collect all flashcards with their topic keys
    Object.entries(allFlashcards).forEach(([topic, cards]) => {
      const topicKey = `${level}-${subject}-${topic}`;
      cards.forEach(card => {
        allCards.push({ ...card, topicKey });
      });
    });

    // Shuffle and select 15 random cards
    const shuffled = allCards.sort(() => Math.random() - 0.5);
    const selectedCards = shuffled.slice(0, 15);

    // Generate questions with multiple choice options
    const questions: QuizQuestion[] = selectedCards.map((card, index) => {
      // Get 3 random wrong answers from other cards
      const otherCards = allCards.filter(c => c.id !== card.id);
      const wrongAnswers = otherCards
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.definition);

      // Combine correct and wrong answers, then shuffle
      const options = [card.definition, ...wrongAnswers].sort(() => Math.random() - 0.5);

      return {
        id: index + 1,
        term: card.term,
        correctAnswer: card.definition,
        options,
        topicKey: card.topicKey
      };
    });

    setQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setTimeLeft(900);
    setQuizStarted(true);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <Trophy size={64} className="mx-auto mb-6 text-yellow-500" />
          <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Quiz Challenge
          </h2>
          <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Test your knowledge with 15 random questions from {subject} topics.
          </p>
          <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quiz Details:</h3>
            <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>• 15 multiple choice questions</li>
              <li>• 15 minutes time limit</li>
              <li>• Questions from all {subject} topics</li>
              <li>• Immediate results and feedback</li>
            </ul>
          </div>
          <div className="space-y-4">
            <button
              onClick={generateQuiz}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              Start Quiz
            </button>
            <button
              onClick={onBack}
              className={`w-full px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              Back to Topics
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / quizQuestions.length) * 100);
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-8`}>
          <div className="text-center mb-8">
            <Trophy size={64} className={`mx-auto mb-4 ${getScoreColor(score, quizQuestions.length)}`} />
            <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Quiz Complete!
            </h2>
            <p className={`text-6xl font-bold mb-2 ${getScoreColor(score, quizQuestions.length)}`}>
              {percentage}%
            </p>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              You scored {score} out of {quizQuestions.length} questions correctly
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Correct:</span>
                  <span className="text-green-500 font-semibold">{score}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Incorrect:</span>
                  <span className="text-red-500 font-semibold">{quizQuestions.length - score}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Accuracy:</span>
                  <span className={`font-semibold ${getScoreColor(score, quizQuestions.length)}`}>{percentage}%</span>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Time</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Time Used:</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatTime(900 - timeLeft)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Time Remaining:</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setQuizStarted(false);
                generateQuiz();
              }}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              <RotateCcw size={20} />
              <span>Retake Quiz</span>
            </button>
            <button
              onClick={onBack}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
            >
              Back to Topics
            </button>
          </div>
        </div>

        {/* Detailed Results */}
        <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Detailed Results
          </h3>
          <div className="space-y-4">
            {quizQuestions.map((question, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={question.id} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {index + 1}. {question.term}
                    </h4>
                    {isCorrect ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : (
                      <XCircle size={20} className="text-red-500" />
                    )}
                  </div>
                  <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>Correct Answer:</strong> {question.correctAnswer}
                  </p>
                  {!isCorrect && userAnswer && (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <strong>Your Answer:</strong> {userAnswer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const quizProgress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Timer and Progress */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <Clock size={20} className={timeLeft < 300 ? 'text-red-500' : isDark ? 'text-gray-400' : 'text-gray-600'} />
            <span className={`font-semibold ${timeLeft < 300 ? 'text-red-500' : isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Question {currentQuestionIndex + 1} of {quizQuestions.length}
          </span>
        </div>
        <div className={`w-full bg-gray-200 rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${quizProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className={`p-8 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg mb-6`}>
        <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          What is the definition of "{currentQuestion.term}"?
        </h2>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                selectedAnswers[currentQuestionIndex] === option
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : isDark
                  ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <span className={`${isDark ? 'text-white' : 'text-gray-900'}`}>
                {String.fromCharCode(65 + index)}. {option}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            currentQuestionIndex === 0
              ? 'opacity-50 cursor-not-allowed'
              : isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          Previous
        </button>

        <div className="flex space-x-2">
          {quizQuestions.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentQuestionIndex
                  ? 'bg-blue-500'
                  : selectedAnswers[index]
                  ? 'bg-green-500'
                  : isDark
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {currentQuestionIndex === quizQuestions.length - 1 ? (
          <button
            onClick={handleSubmitQuiz}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            disabled={!selectedAnswers[currentQuestionIndex]}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              !selectedAnswers[currentQuestionIndex]
                ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transform hover:scale-105'
            }`}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};