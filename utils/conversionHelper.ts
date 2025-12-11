import { CONVERSIONS } from '@/constants/conversions';
import { ConversionCategory } from '@/types/conversion.types';

export const convertValue = (
  value: string,
  from: string,
  to: string,
  selectedCategory: ConversionCategory,
  options?: {
    selectedAnalyte?: string;
    concentration?: string;
    infusionAnalyte?: string;
    setShowWarning?: (show: boolean) => void;
  }
): string => {
  const numValue = parseFloat(value);
  if (isNaN(numValue) || value === '') return '';

  const conversion = CONVERSIONS[selectedCategory];

  // Check if it's a function-based conversion
  if ('convert' in conversion && typeof conversion.convert === 'function') {
    if (selectedCategory === 'concentration') {
      return conversion
        .convert(numValue, from, to, options?.selectedAnalyte || null)
        .toFixed(6)
        .replace(/\.?0+$/, '');
    }

    if (selectedCategory === 'infusion') {
      const concentrationVal = parseFloat(options?.concentration || '') || null;
      const analyteVal = options?.infusionAnalyte || null;

      // Check for IU warning
      if (
        (from === 'IU' || to === 'IU') &&
        !(['mg', 'µg'].includes(from) || ['mg', 'µg'].includes(to))
      ) {
        options?.setShowWarning?.(true);
        return '';
      } else {
        options?.setShowWarning?.(false);
      }

      return conversion
        .convert(numValue, from, to, concentrationVal, analyteVal)
        .toFixed(6)
        .replace(/\.?0+$/, '');
    }

    return conversion
      .convert(numValue, from, to)
      .toFixed(6)
      .replace(/\.?0+$/, '');
  }

  // Factor-based conversion
  if (from === to) return value;

  const key = `${from}:${to}`;
  // Type guard: check if conversion has 'factors' property
  if ('factors' in conversion) {
    const factor = conversion.factors[key];
    if (typeof factor === 'number') {
      return (numValue * factor).toFixed(6).replace(/\.?0+$/, '');
    }
    if (typeof factor === 'function') {
      return factor(numValue)
        .toFixed(6)
        .replace(/\.?0+$/, '');
    }
  }

  return value;
};
