// Generated from api-dotnet/Enums/TimeClassification.cs — do not edit manually
// Run: pnpm generate:enums

export const TimeClassification = {
  TOLERATE: 'Tolerate',
  INVEST: 'Invest',
  MIGRATE: 'Migrate',
  ELIMINATE: 'Eliminate',
} as const;

export type TimeClassificationType = (typeof TimeClassification)[keyof typeof TimeClassification];

export const TimeClassificationLabel: Record<TimeClassificationType, string> = {
  [TimeClassification.TOLERATE]: 'Tolerate',
  [TimeClassification.INVEST]: 'Invest',
  [TimeClassification.MIGRATE]: 'Migrate',
  [TimeClassification.ELIMINATE]: 'Eliminate',
};

export const TimeClassificationOptions = Object.values(TimeClassification).map(value => ({
  value,
  label: TimeClassificationLabel[value],
}));
