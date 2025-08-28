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
}