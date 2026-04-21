// Generated from api-dotnet/Enums/IntegrationAuthentication.cs — do not edit manually
// Run: pnpm generate:enums

export const IntegrationAuthentication = {
  NONE: 'None',
  API_KEY: 'ApiKey',
  BASIC: 'Basic',
  OAUTH2: 'Oauth2',
  MTLS: 'Mtls',
  SAML: 'Saml',
  JWT: 'Jwt',
} as const;

export type IntegrationAuthenticationType = (typeof IntegrationAuthentication)[keyof typeof IntegrationAuthentication];

export const IntegrationAuthenticationLabel: Record<IntegrationAuthenticationType, string> = {
  [IntegrationAuthentication.NONE]: 'None',
  [IntegrationAuthentication.API_KEY]: 'Api Key',
  [IntegrationAuthentication.BASIC]: 'Basic',
  [IntegrationAuthentication.OAUTH2]: 'Oauth2',
  [IntegrationAuthentication.MTLS]: 'Mtls',
  [IntegrationAuthentication.SAML]: 'Saml',
  [IntegrationAuthentication.JWT]: 'Jwt',
};

export const IntegrationAuthenticationOptions = Object.values(IntegrationAuthentication).map(value => ({
  value,
  label: IntegrationAuthenticationLabel[value],
}));
