import { MeasurementUnit } from "../constants/measurement";

export type SystemType = 'metric' | 'imperial';

export interface ConvertedMeasurement {
  amount: number;
  unitLabel: string;
}

export const convertMeasurement = (amount: number, unit: MeasurementUnit, targetSystem: SystemType): ConvertedMeasurement => {
  // If the unit is not metric-specific, return as is (e.g., Piece, Slice, Pinch)
  if (![MeasurementUnit.Gram, MeasurementUnit.Kilogram, MeasurementUnit.Milliliter, MeasurementUnit.Liter].includes(unit)) {
    return { amount, unitLabel: getUnitLabel(unit) };
  }

  if (targetSystem === 'metric') {
    return { amount, unitLabel: getUnitLabel(unit) };
  }

  // Convert to Imperial
  switch (unit) {
    case MeasurementUnit.Gram:
      return { amount: Number((amount * 0.035274).toFixed(2)), unitLabel: 'oz' };
    case MeasurementUnit.Kilogram:
      return { amount: Number((amount * 2.20462).toFixed(2)), unitLabel: 'lbs' };
    case MeasurementUnit.Milliliter:
      // Typically fluid ounces, but for recipes we might use cups or tbsp. Let's use fl oz for precision.
      return { amount: Number((amount * 0.033814).toFixed(2)), unitLabel: 'fl oz' };
    case MeasurementUnit.Liter:
      return { amount: Number((amount * 4.22675).toFixed(2)), unitLabel: 'cups' };
    default:
      return { amount, unitLabel: getUnitLabel(unit) };
  }
};

const getUnitLabel = (unit: MeasurementUnit): string => {
  switch (unit) {
    case MeasurementUnit.Gram: return 'g';
    case MeasurementUnit.Kilogram: return 'kg';
    case MeasurementUnit.Milliliter: return 'ml';
    case MeasurementUnit.Liter: return 'L';
    case MeasurementUnit.Piece: return 'piece';
    case MeasurementUnit.Packet: return 'packet';
    case MeasurementUnit.Bunch: return 'bunch';
    case MeasurementUnit.Slice: return 'slice';
    case MeasurementUnit.Pinch: return 'pinch';
    case MeasurementUnit.Other: return '';
    default: return '';
  }
};
