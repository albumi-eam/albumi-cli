// Generated from api-dotnet/Enums/DataObjectOperation.cs — do not edit manually
// Run: pnpm generate:enums

export const DataObjectOperation = {
  CREATE: 'Create',
  READ: 'Read',
  UPDATE: 'Update',
  DELETE: 'Delete',
} as const;

export type DataObjectOperationType = (typeof DataObjectOperation)[keyof typeof DataObjectOperation];

export const DataObjectOperationLabel: Record<DataObjectOperationType, string> = {
  [DataObjectOperation.CREATE]: 'Create',
  [DataObjectOperation.READ]: 'Read',
  [DataObjectOperation.UPDATE]: 'Update',
  [DataObjectOperation.DELETE]: 'Delete',
};

export const DataObjectOperationOptions = Object.values(DataObjectOperation).map(value => ({
  value,
  label: DataObjectOperationLabel[value],
}));
