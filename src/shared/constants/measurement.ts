export enum MeasurementCategory {
  Weight = 1,
  Volume = 2,
  Count = 3,
  Other = 99
}

export enum MeasurementUnit {
  Piece = 1,
  Kilogram = 2,
  Gram = 3,
  Liter = 4,
  Milliliter = 5,
  Packet = 6,
  Bunch = 7,
  Slice = 8,
  Pinch = 9,
  Other = 99
}

export const MEASUREMENT_UNIT_LABELS: Record<MeasurementUnit, string> = {
  [MeasurementUnit.Piece]: "Adet",
  [MeasurementUnit.Kilogram]: "Kilogram (kg)",
  [MeasurementUnit.Gram]: "Gram (g)",
  [MeasurementUnit.Liter]: "Litre (L)",
  [MeasurementUnit.Milliliter]: "Mililitre (ml)",
  [MeasurementUnit.Packet]: "Paket",
  [MeasurementUnit.Bunch]: "Demet",
  [MeasurementUnit.Slice]: "Dilim",
  [MeasurementUnit.Pinch]: "Tutam",
  [MeasurementUnit.Other]: "Diğer"
};

export const MEASUREMENT_CATEGORY_UNITS: Record<MeasurementCategory, MeasurementUnit[]> = {
  [MeasurementCategory.Weight]: [MeasurementUnit.Gram, MeasurementUnit.Kilogram],
  [MeasurementCategory.Volume]: [MeasurementUnit.Milliliter, MeasurementUnit.Liter],
  [MeasurementCategory.Count]: [MeasurementUnit.Piece, MeasurementUnit.Slice, MeasurementUnit.Bunch, MeasurementUnit.Packet],
  [MeasurementCategory.Other]: [MeasurementUnit.Pinch, MeasurementUnit.Other]
};

// Varsayılan olarak tüm birimleri dönmek istenirse
export const ALL_UNITS = Object.values(MeasurementUnit).filter(v => typeof v === "number") as MeasurementUnit[];

export const UNIT_SHORT_LABELS: Record<string, string> = {
  "Piece": "Adet",
  "Kilogram": "kg",
  "Gram": "g",
  "Liter": "L",
  "Milliliter": "ml",
  "Packet": "Paket",
  "Bunch": "Demet",
  "Slice": "Dilim",
  "Pinch": "Tutam",
  "Other": "Diğer"
};
