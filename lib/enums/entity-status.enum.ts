// Generated from api-dotnet/Enums/EntityStatus.cs — do not edit manually
// Run: pnpm generate:enums

export const EntityStatus = {
  ACTIVE: 'Active',
  ARCHIVED: 'Archived',
} as const;

export type EntityStatusType = (typeof EntityStatus)[keyof typeof EntityStatus];

export const EntityStatusLabel: Record<EntityStatusType, string> = {
  [EntityStatus.ACTIVE]: 'Active',
  [EntityStatus.ARCHIVED]: 'Archived',
};

export const EntityStatusOptions = Object.values(EntityStatus).map(value => ({
  value,
  label: EntityStatusLabel[value],
}));
