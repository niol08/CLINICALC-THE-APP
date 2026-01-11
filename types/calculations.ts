export type ParamType = 'float' | 'integer' | 'string' | 'boolean';

export interface Parameter {
  name: string;
  description?: string;
  unit?: string;
  type?: ParamType;
  enum?: (number | string)[];
  options?: string[];
  required?: boolean;
  default?: any;
  min?: number;
  max?: number;
}

export interface Calculation {
  name: string;
  description?: string;
  formula?: string;
  result_unit?: string;
  parameters: Parameter[];
  slug?: string;
  category?: { title: string; slug?: string };
}

export interface Category {
  title: string;
  slug: string;
  description?: string;
  calculations: Calculation[];
}

export interface CalculationsJson {
  categories: Category[];
}
