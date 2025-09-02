export interface Flashcard {
  id: number;
  term: string;
  definition: string;
}

export interface Progress {
  [key: string]: {
    confident: number[];
    confused: number[];
    needsAttention: number[];
    completed: number[];
  };
}

export type Level = 'IGCSE' | 'AS' | 'A2';
export type Subject = 'Business' | 'Economics';

export interface NavigationState {
  level: Level | null;
  subject: Subject | null;
  topic: string | null;
  view: 'topics' | 'flashcards' | 'quiz' | 'flagged' | null;
}

export interface QuizQuestion {
  id: number;
  term: string;
  correctAnswer: string;
  options: string[];
  topicKey: string;
}

export interface QuizResult {
  score: number;
  total: number;
  questions: QuizQuestion[];
  answers: { [key: number]: string };
}