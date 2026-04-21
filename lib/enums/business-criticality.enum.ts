// Generated from api-dotnet/Enums/BusinessCriticality.cs — do not edit manually
// Run: pnpm generate:enums

export const BusinessCriticality = {
  MISSION_CRITICAL: 'MissionCritical',
  BUSINESS_CRITICAL: 'BusinessCritical',
  BUSINESS_OPERATIONAL: 'BusinessOperational',
  ADMINISTRATIVE: 'Administrative',
} as const;

export type BusinessCriticalityType = (typeof BusinessCriticality)[keyof typeof BusinessCriticality];

export const BusinessCriticalityLabel: Record<BusinessCriticalityType, string> = {
  [BusinessCriticality.MISSION_CRITICAL]: 'Mission Critical',
  [BusinessCriticality.BUSINESS_CRITICAL]: 'Business Critical',
  [BusinessCriticality.BUSINESS_OPERATIONAL]: 'Business Operational',
  [BusinessCriticality.ADMINISTRATIVE]: 'Administrative',
};

export const BusinessCriticalityOptions = Object.values(BusinessCriticality).map(value => ({
  value,
  label: BusinessCriticalityLabel[value],
}));
