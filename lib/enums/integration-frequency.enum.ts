// Generated from api-dotnet/Enums/IntegrationFrequency.cs — do not edit manually
// Run: pnpm generate:enums

export const IntegrationFrequency = {
  REAL_TIME: 'RealTime',
  NEAR_REAL_TIME: 'NearRealTime',
  HOURLY: 'Hourly',
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  ON_DEMAND: 'OnDemand',
} as const;

export type IntegrationFrequencyType = (typeof IntegrationFrequency)[keyof typeof IntegrationFrequency];

export const IntegrationFrequencyLabel: Record<IntegrationFrequencyType, string> = {
  [IntegrationFrequency.REAL_TIME]: 'Real Time',
  [IntegrationFrequency.NEAR_REAL_TIME]: 'Near Real Time',
  [IntegrationFrequency.HOURLY]: 'Hourly',
  [IntegrationFrequency.DAILY]: 'Daily',
  [IntegrationFrequency.WEEKLY]: 'Weekly',
  [IntegrationFrequency.MONTHLY]: 'Monthly',
  [IntegrationFrequency.ON_DEMAND]: 'On Demand',
};

export const IntegrationFrequencyOptions = Object.values(IntegrationFrequency).map(value => ({
  value,
  label: IntegrationFrequencyLabel[value],
}));
