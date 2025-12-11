import {
  Conversion,
  ConversionCategory,
  FactorBasedConversion,
  FunctionBasedConversion,
  EnergyConversion,
  InfusionConversion,
  ConcentrationConversion,
} from '@/types/conversion.types';

export const CONVERSIONS: Record<ConversionCategory, Conversion> = {
  length: {
    name: 'Length',
    units: [
      { value: 'm', label: 'Meters (m)' },
      { value: 'cm', label: 'Centimeters (cm)' },
      { value: 'mm', label: 'Millimeters (mm)' },
      { value: 'in', label: 'Inches (in)' },
      { value: 'ft', label: 'Feet (ft)' },
    ],
    factors: {
      'm:cm': 100,
      'cm:m': 0.01,
      'm:mm': 1000,
      'mm:m': 0.001,
      'cm:mm': 10,
      'mm:cm': 0.1,
      'm:in': 39.3701,
      'in:m': 0.0254,
      'm:ft': 3.28084,
      'ft:m': 0.3048,
      'cm:in': 0.393701,
      'in:cm': 2.54,
      'ft:in': 12,
      'in:ft': 0.0833333,
      'ft:cm': 30.48,
      'cm:ft': 0.0328084,
      'ft:mm': 304.8,
      'mm:ft': 0.00328084,
    },
  } as FactorBasedConversion,

  weight: {
    name: 'Weight',
    units: [
      { value: 'kg', label: 'Kilograms (kg)' },
      { value: 'g', label: 'Grams (g)' },
      { value: 'lb', label: 'Pounds (lb)' },
      { value: 'oz', label: 'Ounces (oz)' },
    ],
    factors: {
      'kg:g': 1000,
      'g:kg': 0.001,
      'kg:lb': 2.20462,
      'lb:kg': 0.453592,
      'kg:oz': 35.274,
      'oz:kg': 0.0283495,
      'g:lb': 0.00220462,
      'lb:g': 453.592,
      'g:oz': 0.035274,
      'oz:g': 28.3495,
      'lb:oz': 16,
      'oz:lb': 0.0625,
    },
  } as FactorBasedConversion,

  temperature: {
    name: 'Temperature',
    units: [
      { value: 'C', label: 'Celsius (°C)' },
      { value: 'F', label: 'Fahrenheit (°F)' },
      { value: 'K', label: 'Kelvin (K)' },
    ],
    convert: (value: number, from: string, to: string) => {
      if (from === to) return value;
      if (from === 'C' && to === 'F') return (value * 9) / 5 + 32;
      if (from === 'F' && to === 'C') return ((value - 32) * 5) / 9;
      if (from === 'C' && to === 'K') return value + 273.15;
      if (from === 'K' && to === 'C') return value - 273.15;
      if (from === 'F' && to === 'K') return ((value - 32) * 5) / 9 + 273.15;
      if (from === 'K' && to === 'F') return ((value - 273.15) * 9) / 5 + 32;
      return value;
    },
  } as FunctionBasedConversion,

  pressure: {
    name: 'Pressure',
    units: [
      { value: 'mmHg', label: 'mmHg' },
      { value: 'kPa', label: 'Kilopascals (kPa)' },
      { value: 'atm', label: 'Atmospheres (atm)' },
      { value: 'cmH2O', label: 'cmH2O' },
      { value: 'Torr', label: 'Torr' },
    ],
    factors: {
      'mmHg:kPa': 0.133322,
      'kPa:mmHg': 7.50062,
      'mmHg:atm': 0.00131579,
      'atm:mmHg': 760,
      'mmHg:Torr': 1,
      'Torr:mmHg': 1,
      'cmH2O:mmHg': 0.73556,
      'mmHg:cmH2O': 1.35951,
      'kPa:atm': 0.00986923,
      'atm:kPa': 101.325,
      'kPa:cmH2O': 10.1972,
      'cmH2O:kPa': 0.0980665,
    },
  } as FactorBasedConversion,

  area: {
    name: 'Area',
    units: [
      { value: 'm2', label: 'm²' },
      { value: 'cm2', label: 'cm²' },
      { value: 'ft2', label: 'ft²' },
      { value: 'in2', label: 'in²' },
      { value: 'ha', label: 'Hectares (ha)' },
    ],
    factors: {
      'm2:cm2': 10000,
      'cm2:m2': 0.0001,
      'm2:ft2': 10.7639,
      'ft2:m2': 0.092903,
      'm2:in2': 1550,
      'in2:m2': 0.00064516,
      'ft2:in2': 144,
      'in2:ft2': 0.00694444,
      'ha:m2': 10000,
      'm2:ha': 0.0001,
    },
  } as FactorBasedConversion,

  volume: {
    name: 'Volume',
    units: [
      { value: 'mL', label: 'Milliliters (mL)' },
      { value: 'L', label: 'Liters (L)' },
      { value: 'oz', label: 'Ounces (oz)' },
      { value: 'cup', label: 'Cups' },
      { value: 'tsp', label: 'Teaspoons (tsp)' },
      { value: 'Tbsp', label: 'Tablespoons (Tbsp)' },
      { value: 'fl_oz_US', label: 'US Fluid Ounces (fl oz)' },
    ],
    factors: {
      'mL:L': 0.001,
      'L:mL': 1000,
      'mL:oz': 0.033814,
      'oz:mL': 29.5735,
      'mL:fl_oz_US': 0.033814,
      'fl_oz_US:mL': 29.5735,
      'L:oz': 33.814,
      'oz:L': 0.0295735,
      'mL:cup': 0.00422675,
      'cup:mL': 236.588,
      'mL:tsp': 0.202884,
      'tsp:mL': 4.92892,
      'mL:Tbsp': 0.067628,
      'Tbsp:mL': 14.7868,
      'cup:oz': 8,
      'oz:cup': 0.125,
      'cup:tsp': 48,
      'tsp:cup': 0.0208333,
      'cup:Tbsp': 16,
      'Tbsp:cup': 0.0625,
      'tsp:Tbsp': 0.333333,
      'Tbsp:tsp': 3,
    },
  } as FactorBasedConversion,

  energy: {
    name: 'Energy',
    units: [
      { value: 'kcal', label: 'Kilocalories (kcal)' },
      { value: 'kJ', label: 'Kilojoules (kJ)' },
      { value: 'g_protein', label: 'g Protein' },
      { value: 'g_carb', label: 'g Carbohydrate' },
      { value: 'g_fat', label: 'g Fat' },
    ],
    factors: {
      'kcal:kJ': 4.184,
      'kJ:kcal': 0.239006,
      'g_protein:kcal': 4,
      'kcal:g_protein': 0.25,
      'g_carb:kcal': 4,
      'kcal:g_carb': 0.25,
      'g_fat:kcal': 9,
      'kcal:g_fat': 0.111111,
      'g_fat:g_protein': (v: number) => (v * 9) / 4,
      'g_protein:g_fat': (v: number) => (v * 4) / 9,
      'g_carb:g_protein': (v: number) => (v * 4) / 4,
      'g_protein:g_carb': (v: number) => (v * 4) / 4,
    },
    convert: function (value: number, from: string, to: string) {
      const key = `${from}:${to}`;
      const f = this.factors[key];
      if (typeof f === 'number') return value * f;
      if (typeof f === 'function') return f(value);
      return value;
    },
  } as EnergyConversion,

  infusion: {
    name: 'Infusion',
    units: [
      { value: 'g', label: 'Grams (g)' },
      { value: 'mg', label: 'Milligrams (mg)' },
      { value: 'µg', label: 'Micrograms (µg)' },
      { value: 'IU', label: 'International Units (IU)' },
      { value: 'mL', label: 'Milliliters (mL)' },
    ],
    factors: {
      'g:mg': 1000,
      'mg:g': 0.001,
      'mg:µg': 1000,
      'µg:mg': 0.001,
      'g:µg': 1e6,
      'µg:g': 1e-6,
      'mg:mL': 1,
      'mL:mg': 1,
      'g:mL': 1000,
      'mL:g': 0.001,
    },
    iuFactors: {
      insulin: 0.0347,
      heparin: 0.002,
      vitaminD: 0.000025,
      vitaminA: 0.0003,
      vitaminE: 0.67,
      erythropoietin: 0.0000084,
    },
    convert: function (
      value: number,
      from: string,
      to: string,
      concentrationMgPerMl: number | null = null,
      analyte: string | null = null
    ) {
      const key = `${from}:${to}`;
      if (this.factors[key]) {
        return value * (this.factors[key] as number);
      }

      if (
        (from === 'IU' || to === 'IU') &&
        analyte &&
        this.iuFactors[analyte]
      ) {
        const iuFactor = this.iuFactors[analyte];
        if (from === 'IU' && to === 'mg') return value * iuFactor;
        if (from === 'mg' && to === 'IU') return value / iuFactor;
        if (from === 'IU' && to === 'µg') return value * iuFactor * 1000;
        if (from === 'µg' && to === 'IU') return value / (iuFactor * 1000);
      }

      if (from === 'mg' && to === 'mL' && concentrationMgPerMl) {
        return value / concentrationMgPerMl;
      }
      if (from === 'mL' && to === 'mg' && concentrationMgPerMl) {
        return value * concentrationMgPerMl;
      }

      return value;
    },
  } as InfusionConversion,

  concentration: {
    name: 'Concentration',
    units: [
      { value: 'mg/dL', label: 'mg/dL' },
      { value: 'mmol/L', label: 'mmol/L' },
      { value: 'µmol/L', label: 'µmol/L' },
      { value: 'µg/L', label: 'µg/L' },
    ],
    convert: function (
      value: number,
      from: string,
      to: string,
      analyte: string | null = null
    ) {
      const molarMasses: Record<string, number> = {
        glucose: 180.16,
        cholesterol: 386.65,
        triglycerides: 886.0,
        bun: 28.0,
        creatinine: 113.12,
        uric_acid: 168.11,
        calcium: 40.08,
      };

      if (from === to || !analyte || !molarMasses[analyte]) return value;
      const mm = molarMasses[analyte];

      if (from === 'mg/dL' && to === 'mmol/L') {
        return value / (mm * 10);
      }
      if (from === 'mmol/L' && to === 'mg/dL') {
        return value * mm * 10;
      }

      if (from === 'mg/dL' && to === 'µmol/L') {
        return (value * 10000) / mm;
      }
      if (from === 'µmol/L' && to === 'mg/dL') {
        return (value * mm) / 10000;
      }

      if (from === 'µmol/L' && to === 'mmol/L') {
        return value / 1000;
      }
      if (from === 'mmol/L' && to === 'µmol/L') {
        return value * 1000;
      }
      return value;
    },
  } as ConcentrationConversion,
};
