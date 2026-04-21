// Generated from api-dotnet/Enums/DataClassification.cs — do not edit manually
// Run: pnpm generate:enums

export const DataClassification = {
  PUBLIC: 'Public',
  INTERNAL: 'Internal',
  CONFIDENTIAL: 'Confidential',
  RESTRICTED: 'Restricted',
} as const;

export type DataClassificationType = (typeof DataClassification)[keyof typeof DataClassification];

export const DataClassificationLabel: Record<DataClassificationType, string> = {
  [DataClassification.PUBLIC]: 'Public',
  [DataClassification.INTERNAL]: 'Internal',
  [DataClassification.CONFIDENTIAL]: 'Confidential',
  [DataClassification.RESTRICTED]: 'Restricted',
};

export const DataClassificationOptions = Object.values(DataClassification).map(value => ({
  value,
  label: DataClassificationLabel[value],
}));
