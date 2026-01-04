
export interface Client {
  id: string;
  code: string;
  name: string;
  summary: string;
  goals: string[];
  homework: string;
  lastSession: string;
  nextSession: string;
  currentSpring: string;
}

export type MindfulnessTheme = 'Peace' | 'Compassion' | 'Resilience';
export type MediaModality = 'audio' | 'video';
export type AppTab = 'today' | 'history' | 'tools';

export interface CompletionState {
  wholeness1: boolean;
  wholeness2: boolean;
  wholeness3: boolean;
}

export interface Note {
  id: string;
  text: string;
  timestamp: number;
}
