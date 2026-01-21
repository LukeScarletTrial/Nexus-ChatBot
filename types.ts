import { User as FirebaseUser } from 'firebase/auth';

export enum NexusModel {
  MALEVOLENT = 'malevolent',
  INFINITE_PERSPECTIVE = 'infinite_perspective'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  type: 'text' | 'image' | 'json' | 'code';
  timestamp: number;
  imageUrl?: string;
  metadata?: any;
}

export interface ChatSession {
  id: string;
  title: string;
  model: NexusModel;
  messages: Message[];
  createdAt: number;
}

export interface ApiKey {
  id: string; // The key itself
  name: string;
  userId: string;
  createdAt: number;
  active: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Definition for the "Dictionary" capability
export interface WordDefinition {
  word: string;
  definition: string;
  origin?: string;
  usage?: string;
}

// Presentation Interfaces
export interface Slide {
  slide_number: number;
  header: string;
  content: string[];
  visual_prompt: string;
}

export interface PresentationMetadata {
  title: string;
  author: string;
  theme: string;
  objective: string;
}

export interface PresentationData {
  presentation_metadata: PresentationMetadata;
  slides: Slide[];
}

export interface SavedPresentation {
  id: string;
  userId: string;
  data: any;
  createdAt: any;
}