export interface Unit {
  value: string;
  label: string;
}

export interface FactorBasedConversion {
  name: string;
  units: Unit[];
  factors: Record<string, number | ((v: number) => number)>;
}

export interface FunctionBasedConversion {
  name: string;
  units: Unit[];
  convert: (value: number, from: string, to: string, ...args: any[]) => number;
}

export interface EnergyConversion extends FunctionBasedConversion {
  factors: Record<string, number | ((v: number) => number)>;
}

export interface InfusionConversion extends FunctionBasedConversion {
  iuFactors: Record<string, number>;
  factors: Record<string, number>;
}

export interface ConcentrationConversion extends FunctionBasedConversion {
  molarMasses?: Record<string, number>;
}

export type Conversion =
  | FactorBasedConversion
  | FunctionBasedConversion
  | EnergyConversion
  | InfusionConversion
  | ConcentrationConversion;

export type ConversionCategory =
  | 'length'
  | 'weight'
  | 'temperature'
  | 'pressure'
  | 'area'
  | 'volume'
  | 'energy'
  | 'infusion'
  | 'concentration';
