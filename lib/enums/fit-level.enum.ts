// Generated from api-dotnet/Enums/FitLevel.cs — do not edit manually
// Run: pnpm generate:enums

export const FitLevel = {
  EXCELLENT: 'Excellent',
  ADEQUATE: 'Adequate',
  INSUFFICIENT: 'Insufficient',
} as const;

export type FitLevelType = (typeof FitLevel)[keyof typeof FitLevel];

export const FitLevelLabel: Record<FitLevelType, string> = {
  [FitLevel.EXCELLENT]: 'Excellent',
  [FitLevel.ADEQUATE]: 'Adequate',
  [FitLevel.INSUFFICIENT]: 'Insufficient',
};

export const FitLevelOptions = Object.values(FitLevel).map(value => ({
  value,
  label: FitLevelLabel[value],
}));
