// Generated from api-dotnet/Enums/ImpactType.cs — do not edit manually
// Run: pnpm generate:enums

export const ImpactType = {
  ADD: 'Add',
  MODIFY: 'Modify',
  REMOVE: 'Remove',
} as const;

export type ImpactTypeType = (typeof ImpactType)[keyof typeof ImpactType];

export const ImpactTypeLabel: Record<ImpactTypeType, string> = {
  [ImpactType.ADD]: 'Add',
  [ImpactType.MODIFY]: 'Modify',
  [ImpactType.REMOVE]: 'Remove',
};

export const ImpactTypeOptions = Object.values(ImpactType).map(value => ({
  value,
  label: ImpactTypeLabel[value],
}));
