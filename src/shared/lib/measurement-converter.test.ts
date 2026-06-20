import { describe, it, expect } from 'vitest';
import { convertMeasurement } from './measurement-converter';
import { MeasurementUnit } from '../constants/measurement';

describe('convertMeasurement', () => {
  it('returns as is for non-metric specific units', () => {
    expect(convertMeasurement(5, MeasurementUnit.Piece, 'imperial')).toEqual({ amount: 5, unitLabel: 'piece' });
    expect(convertMeasurement(2, MeasurementUnit.Slice, 'imperial')).toEqual({ amount: 2, unitLabel: 'slice' });
  });

  it('returns metric values when target system is metric', () => {
    expect(convertMeasurement(100, MeasurementUnit.Gram, 'metric')).toEqual({ amount: 100, unitLabel: 'g' });
    expect(convertMeasurement(2.5, MeasurementUnit.Kilogram, 'metric')).toEqual({ amount: 2.5, unitLabel: 'kg' });
    expect(convertMeasurement(500, MeasurementUnit.Milliliter, 'metric')).toEqual({ amount: 500, unitLabel: 'ml' });
    expect(convertMeasurement(1.5, MeasurementUnit.Liter, 'metric')).toEqual({ amount: 1.5, unitLabel: 'L' });
  });

  it('converts Grams to Ounces for imperial', () => {
    expect(convertMeasurement(100, MeasurementUnit.Gram, 'imperial')).toEqual({ amount: 3.53, unitLabel: 'oz' });
  });

  it('converts Kilograms to Pounds for imperial', () => {
    expect(convertMeasurement(2, MeasurementUnit.Kilogram, 'imperial')).toEqual({ amount: 4.41, unitLabel: 'lbs' });
  });

  it('converts Milliliters to Fluid Ounces for imperial', () => {
    expect(convertMeasurement(250, MeasurementUnit.Milliliter, 'imperial')).toEqual({ amount: 8.45, unitLabel: 'fl oz' });
  });

  it('converts Liters to Cups for imperial', () => {
    expect(convertMeasurement(1, MeasurementUnit.Liter, 'imperial')).toEqual({ amount: 4.23, unitLabel: 'cups' });
  });

  it('handles other unknown unit types gracefully', () => {
    expect(convertMeasurement(10, MeasurementUnit.Other, 'imperial')).toEqual({ amount: 10, unitLabel: '' });
  });
});
