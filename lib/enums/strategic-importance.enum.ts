// Generated from api-dotnet/Enums/StrategicImportance.cs — do not edit manually
// Run: pnpm generate:enums

export const StrategicImportance = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
} as const;

export type StrategicImportanceType = (typeof StrategicImportance)[keyof typeof StrategicImportance];

export const StrategicImportanceLabel: Record<StrategicImportanceType, string> = {
  [StrategicImportance.HIGH]: 'High',
  [StrategicImportance.MEDIUM]: 'Medium',
  [StrategicImportance.LOW]: 'Low',
};

export const StrategicImportanceOptions = Object.values(StrategicImportance).map(value => ({
  value,
  label: StrategicImportanceLabel[value],
}));
