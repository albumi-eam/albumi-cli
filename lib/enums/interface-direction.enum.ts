// Generated from api-dotnet/Enums/InterfaceDirection.cs — do not edit manually
// Run: pnpm generate:enums

export const InterfaceDirection = {
  INPUT: 'Input',
  OUTPUT: 'Output',
} as const;

export type InterfaceDirectionType = (typeof InterfaceDirection)[keyof typeof InterfaceDirection];

export const InterfaceDirectionLabel: Record<InterfaceDirectionType, string> = {
  [InterfaceDirection.INPUT]: 'Input',
  [InterfaceDirection.OUTPUT]: 'Output',
};

export const InterfaceDirectionOptions = Object.values(InterfaceDirection).map(value => ({
  value,
  label: InterfaceDirectionLabel[value],
}));
