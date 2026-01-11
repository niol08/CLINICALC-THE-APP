import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RecentCategory } from '@/types';
import {
  RECENT_CATEGORIES_KEY,
  MAX_RECENT_CATEGORIES,
} from '@/constants/categoryIcons';

export function useRecentCategories() {
  const [recentCategories, setRecentCategories] = useState<RecentCategory[]>(
    []
  );

  useEffect(() => {
    loadRecentCategories();
  }, []);

  const loadRecentCategories = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_CATEGORIES_KEY);
      if (stored) {
        setRecentCategories(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load recent categories:', error);
    }
  };

  const addRecentCategory = async (
    slug: string,
    title: string,
    icon?: string
  ) => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_CATEGORIES_KEY);
      let categories: RecentCategory[] = stored ? JSON.parse(stored) : [];

      const existingIndex = categories.findIndex((cat) => cat.slug === slug);

      if (existingIndex !== -1) {
        categories[existingIndex].timestamp = Date.now();
        if (icon) categories[existingIndex].icon = icon as any;
      } else {
        categories.push({
          slug,
          title,
          timestamp: Date.now(),
          icon: icon as any,
        });
      }

      categories.sort((a, b) => b.timestamp - a.timestamp);
      categories = categories.slice(0, MAX_RECENT_CATEGORIES);

      await AsyncStorage.setItem(
        RECENT_CATEGORIES_KEY,
        JSON.stringify(categories)
      );
      setRecentCategories(categories);
    } catch (error) {
      console.error('Failed to save recent category:', error);
    }
  };

  return { recentCategories, addRecentCategory, loadRecentCategories };
}
