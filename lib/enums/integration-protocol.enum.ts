// Generated from api-dotnet/Enums/IntegrationProtocol.cs — do not edit manually
// Run: pnpm generate:enums

export const IntegrationProtocol = {
  HTTPS: 'Https',
  HTTP: 'Http',
  GRPC: 'Grpc',
  WEBSOCKET: 'Websocket',
  AMQP: 'Amqp',
  KAFKA: 'Kafka',
  SFTP: 'Sftp',
  FTP: 'Ftp',
  JDBC: 'Jdbc',
  ODBC: 'Odbc',
  SOAP: 'Soap',
} as const;

export type IntegrationProtocolType = (typeof IntegrationProtocol)[keyof typeof IntegrationProtocol];

export const IntegrationProtocolLabel: Record<IntegrationProtocolType, string> = {
  [IntegrationProtocol.HTTPS]: 'Https',
  [IntegrationProtocol.HTTP]: 'Http',
  [IntegrationProtocol.GRPC]: 'Grpc',
  [IntegrationProtocol.WEBSOCKET]: 'Websocket',
  [IntegrationProtocol.AMQP]: 'Amqp',
  [IntegrationProtocol.KAFKA]: 'Kafka',
  [IntegrationProtocol.SFTP]: 'Sftp',
  [IntegrationProtocol.FTP]: 'Ftp',
  [IntegrationProtocol.JDBC]: 'Jdbc',
  [IntegrationProtocol.ODBC]: 'Odbc',
  [IntegrationProtocol.SOAP]: 'Soap',
};

export const IntegrationProtocolOptions = Object.values(IntegrationProtocol).map(value => ({
  value,
  label: IntegrationProtocolLabel[value],
}));
