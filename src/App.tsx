import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Breadcrumb } from './components/Breadcrumb';
import { LevelSelection } from './components/LevelSelection';
import { SubjectSelection } from './components/SubjectSelection';
import { TopicSelection } from './components/TopicSelection';
import { FlashcardView } from './components/FlashcardView';
import { useLocalStorage } from './hooks/useLocalStorage';
import { NavigationState, Level, Subject, Progress } from './types';
import flashcardsData from './data.json';

function App() {
  const [isDark, setIsDark] = useLocalStorage('deckster-theme', false);
  const [progress, setProgress] = useLocalStorage<Progress>('deckster-progress', {});
  const [navigation, setNavigation] = useState<NavigationState>({
    level: null,
    subject: null,
    topic: null,
  });

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const navigate = (level?: Level, subject?: Subject, topic?: string) => {
    setNavigation({
      level: level || null,
      subject: subject || null,
      topic: topic || null,
    });
  };

  const updateProgress = (topicKey: string, cardId: number, status: 'confident' | 'confused' | 'needsAttention') => {
    setProgress(prev => {
      const newProgress = { ...prev };
      
      if (!newProgress[topicKey]) {
        newProgress[topicKey] = {
          confident: [],
          confused: [],
          needsAttention: [],
          completed: []
        };
      }

      // Remove from all arrays first
      newProgress[topicKey].confident = newProgress[topicKey].confident.filter(id => id !== cardId);
      newProgress[topicKey].confused = newProgress[topicKey].confused.filter(id => id !== cardId);
      newProgress[topicKey].needsAttention = newProgress[topicKey].needsAttention.filter(id => id !== cardId);

      // Add to the appropriate array
      newProgress[topicKey][status].push(cardId);

      return newProgress;
    });
  };

  const getCurrentFlashcards = () => {
    if (!navigation.level || !navigation.subject || !navigation.topic) {
      return [];
    }

    const levelData = flashcardsData[navigation.level];
    if (!levelData) return [];

    const subjectData = levelData[navigation.subject];
    if (!subjectData) return [];

    return subjectData[navigation.topic] || [];
  };

  const getCurrentTopics = () => {
    if (!navigation.level || !navigation.subject) {
      return [];
    }

    const levelData = flashcardsData[navigation.level];
    if (!levelData) return [];

    const subjectData = levelData[navigation.subject];
    if (!subjectData) return [];

    return Object.keys(subjectData);
  };

  const getTopicKey = () => {
    if (!navigation.level || !navigation.subject || !navigation.topic) {
      return '';
    }
    return `${navigation.level}-${navigation.subject}-${navigation.topic}`;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
    }`}>
      <Header isDark={isDark} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-6 py-8 min-h-[calc(100vh-200px)]">
        <Breadcrumb 
          navigation={navigation} 
          isDark={isDark} 
          onNavigate={navigate} 
        />
        
        {!navigation.level && (
          <LevelSelection 
            onSelect={(level) => navigate(level)} 
            isDark={isDark} 
          />
        )}
        
        {navigation.level && !navigation.subject && (
          <SubjectSelection 
            onSelect={(subject) => navigate(navigation.level, subject)} 
            isDark={isDark} 
          />
        )}
        
        {navigation.level && navigation.subject && !navigation.topic && (
          <TopicSelection 
            topics={getCurrentTopics()}
            onSelect={(topic) => navigate(navigation.level, navigation.subject, topic)}
            isDark={isDark}
            progress={progress}
            level={navigation.level}
            subject={navigation.subject}
          />
        )}
        
        {navigation.level && navigation.subject && navigation.topic && (
          <FlashcardView 
            flashcards={getCurrentFlashcards()}
            topicKey={getTopicKey()}
            isDark={isDark}
            progress={progress}
            updateProgress={updateProgress}
          />
        )}
      </main>
      
      <Footer isDark={isDark} />
    </div>
  );
}

export default App;