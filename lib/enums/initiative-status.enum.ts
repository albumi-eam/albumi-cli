// Generated from api-dotnet/Enums/InitiativeStatus.cs — do not edit manually
// Run: pnpm generate:enums

export const InitiativeStatus = {
  DRAFT: 'Draft',
  PLANNED: 'Planned',
  ACTIVE: 'Active',
  ON_HOLD: 'OnHold',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} as const;

export type InitiativeStatusType = (typeof InitiativeStatus)[keyof typeof InitiativeStatus];

export const InitiativeStatusLabel: Record<InitiativeStatusType, string> = {
  [InitiativeStatus.DRAFT]: 'Draft',
  [InitiativeStatus.PLANNED]: 'Planned',
  [InitiativeStatus.ACTIVE]: 'Active',
  [InitiativeStatus.ON_HOLD]: 'On Hold',
  [InitiativeStatus.COMPLETED]: 'Completed',
  [InitiativeStatus.CANCELLED]: 'Cancelled',
};

export const InitiativeStatusOptions = Object.values(InitiativeStatus).map(value => ({
  value,
  label: InitiativeStatusLabel[value],
}));
