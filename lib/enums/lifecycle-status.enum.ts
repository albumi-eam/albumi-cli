// Generated from api-dotnet/Enums/LifecycleStatus.cs — do not edit manually
// Run: pnpm generate:enums

export const LifecycleStatus = {
  UNKNOWN: 'Unknown',
  PLAN: 'Plan',
  PHASE_IN: 'PhaseIn',
  ACTIVE: 'Active',
  PHASE_OUT: 'PhaseOut',
  END_OF_LIFE: 'EndOfLife',
} as const;

export type LifecycleStatusType = (typeof LifecycleStatus)[keyof typeof LifecycleStatus];

export const LifecycleStatusLabel: Record<LifecycleStatusType, string> = {
  [LifecycleStatus.UNKNOWN]: 'Unknown',
  [LifecycleStatus.PLAN]: 'Plan',
  [LifecycleStatus.PHASE_IN]: 'Phase In',
  [LifecycleStatus.ACTIVE]: 'Active',
  [LifecycleStatus.PHASE_OUT]: 'Phase Out',
  [LifecycleStatus.END_OF_LIFE]: 'End Of Life',
};

export const LifecycleStatusOptions = Object.values(LifecycleStatus).map(value => ({
  value,
  label: LifecycleStatusLabel[value],
}));
