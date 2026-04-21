// Generated from api-dotnet/Enums/InitiativeType.cs — do not edit manually
// Run: pnpm generate:enums

export const InitiativeType = {
  MIGRATION: 'Migration',
  MODERNIZATION: 'Modernization',
  CONSOLIDATION: 'Consolidation',
  EXPANSION: 'Expansion',
  DECOMMISSION: 'Decommission',
} as const;

export type InitiativeTypeType = (typeof InitiativeType)[keyof typeof InitiativeType];

export const InitiativeTypeLabel: Record<InitiativeTypeType, string> = {
  [InitiativeType.MIGRATION]: 'Migration',
  [InitiativeType.MODERNIZATION]: 'Modernization',
  [InitiativeType.CONSOLIDATION]: 'Consolidation',
  [InitiativeType.EXPANSION]: 'Expansion',
  [InitiativeType.DECOMMISSION]: 'Decommission',
};

export const InitiativeTypeOptions = Object.values(InitiativeType).map(value => ({
  value,
  label: InitiativeTypeLabel[value],
}));
