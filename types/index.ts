import { Ionicons } from '@expo/vector-icons';

export interface RecentCategory {
  slug: string;
  title: string;
  timestamp: number;
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  calculatorSlug?: string;
  calculatorName?: string;
}

export interface RecentCalculation {
  id: string;
  name: string;
  slug: string;
  inputs: string;
  result: string;
  unit?: string;
  timestamp: number;
}

export interface FavoriteCalculation {
  id: string;
  name: string;
  slug: string;
  timestamp: number;
}

export interface FormValues {
  [key: string]: string | number;
}

export interface FormErrors {
  [key: string]: string;
}

export * from './calculations';
export * from './conversion.types';
