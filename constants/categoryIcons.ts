import { Ionicons } from '@expo/vector-icons';

export const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'medical-dosage': 'medical',
  'patient-monitoring': 'pulse',
  'nutrition-fluid-management': 'water',
  pharmacokinetics: 'flask',
  'blood-lab-values': 'analytics',
  'cardiovascular-health': 'heart',
  'body-mechanisms-growth': 'body',
  'infection-control-epidemiology': 'shield-checkmark',
  'electrolyte-replacement': 'flash',
  others: 'file-tray-full',
  'statistical-calculations': 'stats-chart',
};

export const DEFAULT_ICON: keyof typeof Ionicons.glyphMap = 'folder-outline';

export const MAX_RECENT_CATEGORIES = 3;
export const RECENT_CATEGORIES_KEY = 'recent_categories';
