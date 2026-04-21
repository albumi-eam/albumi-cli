// Generated from api-dotnet/Enums/HostingType.cs — do not edit manually
// Run: pnpm generate:enums

export const HostingType = {
  ON_PREMISE: 'OnPremise',
  CLOUD: 'Cloud',
  HYBRID: 'Hybrid',
  SAAS: 'Saas',
} as const;

export type HostingTypeType = (typeof HostingType)[keyof typeof HostingType];

export const HostingTypeLabel: Record<HostingTypeType, string> = {
  [HostingType.ON_PREMISE]: 'On Premise',
  [HostingType.CLOUD]: 'Cloud',
  [HostingType.HYBRID]: 'Hybrid',
  [HostingType.SAAS]: 'Saas',
};

export const HostingTypeOptions = Object.values(HostingType).map(value => ({
  value,
  label: HostingTypeLabel[value],
}));
