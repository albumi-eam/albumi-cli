// Generated from api-dotnet/Enums/IntegrationDeliveryPattern.cs — do not edit manually
// Run: pnpm generate:enums

export const IntegrationDeliveryPattern = {
  REQUEST_RESPONSE: 'RequestResponse',
  FIRE_AND_FORGET: 'FireAndForget',
  PUBLISH_SUBSCRIBE: 'PublishSubscribe',
  EVENT_DRIVEN: 'EventDriven',
  BATCH: 'Batch',
  STREAMING: 'Streaming',
} as const;

export type IntegrationDeliveryPatternType = (typeof IntegrationDeliveryPattern)[keyof typeof IntegrationDeliveryPattern];

export const IntegrationDeliveryPatternLabel: Record<IntegrationDeliveryPatternType, string> = {
  [IntegrationDeliveryPattern.REQUEST_RESPONSE]: 'Request Response',
  [IntegrationDeliveryPattern.FIRE_AND_FORGET]: 'Fire And Forget',
  [IntegrationDeliveryPattern.PUBLISH_SUBSCRIBE]: 'Publish Subscribe',
  [IntegrationDeliveryPattern.EVENT_DRIVEN]: 'Event Driven',
  [IntegrationDeliveryPattern.BATCH]: 'Batch',
  [IntegrationDeliveryPattern.STREAMING]: 'Streaming',
};

export const IntegrationDeliveryPatternOptions = Object.values(IntegrationDeliveryPattern).map(value => ({
  value,
  label: IntegrationDeliveryPatternLabel[value],
}));
