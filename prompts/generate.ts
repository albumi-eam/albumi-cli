import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const GENERATE_PROMPT = `You are an Enterprise Architecture expert generating workspace data for Albumi EAM platform.

## Task
Generate a workspace JSON file based on the user's description of their IT landscape. The output must conform to the Albumi workspace export schema (v1).

## Schema Structure

The workspace JSON has this top-level structure:
\`\`\`json
{
  "$schema": "https://my.albumi.app/schemas/workspace.v1.schema.json",
  "version": "1.0.0",
  "metadata": { "source": "ai-generated", "description": "..." },
  "organizations": [],
  "businessCapabilities": [],
  "dataObjects": [],
  "itComponents": [],
  "applications": [],
  "integrations": [],
  "initiatives": []
}
\`\`\`

## Entity Types (7)

### 1. Organization
Organizational units forming a hierarchy.
- Required: id (UUID), name, type, organizationId (parent org ref)
- Optional: description, status (active/archived), parentId (for hierarchy)
- Type values: business_unit, department, team, division, subsidiary, external

### 2. BusinessCapability
What the business does, organized hierarchically (up to 4 levels).
- Required: id, name, organizationId
- Optional: description, level (1-4), status, strategicImportance (critical/high/medium/low), maturityLevel, parentId

### 3. DataObject
Data entities with classification and PII/PCI flags.
- Required: id, name, organizationId
- Optional: description, status, classification (public/internal/confidential/restricted), piiFlag, pciFlag, retentionPeriod, capabilityIds[], parentId

### 4. ITComponent
Technology components (databases, middleware, frameworks).
- Required: id, name, organizationId
- Optional: description, vendor, version, licenseType, lifecycle dates (Plan/PhaseIn/Active/PhaseOut/EndOfLife)

### 5. Application
Business applications — the core entity.
- Required: id, name, organizationId
- Optional: description, subtype (custom/cots/saas/open_source), lifecycle dates, timeClassification (tolerate/invest/migrate/eliminate), functionalFit/technicalFit (excellent/adequate/insufficient), businessCriticality (mission_critical/business_critical/business_operational/administrative), hostingType (on_premise/cloud/hybrid/saas), cloudProvider (aws/azure/gcp/other), dataClassification, gdprRelevant, pciDssRelevant, soxRelevant
- Embedded arrays:
  - capabilities: [{ capabilityId }] — links to BusinessCapability
  - itComponents: [{ itComponentId }] — links to ITComponent
  - dataObjects: [{ dataObjectId, operations: ["create"|"read"|"update"|"delete"] }]
  - interfaces: [{ id, name, direction: "Input"|"Output", protocol: "Rest"|"Soap"|"Grpc"|"Mq"|"Kafka"|"File"|"Sftp"|"Jdbc", format: "Json"|"Xml"|"Csv"|"Avro"|"Protobuf", endpoint, authentication: "None"|"Basic"|"Oauth2"|"ApiKey"|"Mtls" }]

### 6. Integration
Data flows between applications (source → target = DATA FLOW direction).
- Required: id, name, sourceApplicationId, targetApplicationId, organizationId
- **CRITICAL: sourceApplicationId → targetApplicationId = direction of DATA FLOW, NOT request direction.**
  - source = where data originates (producer)
  - target = where data flows to (consumer)
  - Example: Storefront reads product data from Catalog Service. The integration is "Catalog to Storefront" (source=Catalog, target=Storefront) because product data flows FROM Catalog TO Storefront. Even though Storefront initiates the HTTP call, the data originates in Catalog.
  - For pull patterns (target initiates the request), set initiator to "pull".
- Optional: description, subtype (system_integration/data_integration/api/etl/file_transfer/event_streaming/manual), initiator (push/pull/event_driven), deliveryPattern (request_response/fire_and_forget/publish_subscribe/batch/streaming), lifecycle dates, frequency (real_time/near_real_time/hourly/daily/weekly/monthly/on_demand), protocol (https/grpc/graphql/soap/sftp/ftp/kafka/rabbitmq/custom), dataFormat (json/xml/csv/binary/protobuf/avro/custom), authentication (oauth2/api_key/mtls/basic/saml/jwt/none/custom)
- sourceInterfaceId, targetInterfaceId — optional references to Application interfaces
- Embedded: middlewares: [{ itComponentId }], dataObjects: [{ dataObjectId, operations }]
- **Integration operations: CUD only (create/update/delete). "read" is NOT valid on integrations.** Integrations carry data change events, not read operations. Reading is a local application operation.

### 7. Initiative
Strategic projects affecting applications.
- Required: id, name, organizationId
- Optional: description, type (modernization/migration/consolidation/new_capability/decommission/compliance/security/performance), status (planned/in_progress/completed/on_hold/cancelled), startDate, endDate
- Embedded: applicationImpacts: [{ applicationId, impactType: "add"|"modify"|"remove" }]

## Rules

1. **All IDs must be valid UUIDs.** Generate fresh UUIDs (v4) for every entity.
2. **Dependencies order:** Organizations first, then BusinessCapabilities (reference orgs), then DataObjects (reference orgs + caps), then ITComponents (reference orgs), then Applications (reference orgs + caps + itc + do), then Integrations (reference apps), then Initiatives (reference apps).
3. **All cross-references must resolve within the file.** Every organizationId, capabilityId, itComponentId, dataObjectId, applicationId, sourceApplicationId, targetApplicationId must point to an entity in the same JSON.
4. **Lifecycle dates must be ordered:** Plan ≤ PhaseIn ≤ Active ≤ PhaseOut ≤ EndOfLife. Format: "YYYY-MM-DD".
5. **Use realistic names and descriptions.** Make it look like a real enterprise, not placeholder data.
6. **Set businessCriticality, fits, and TIME classification** on applications when you have enough context.
7. **Map data objects to integrations** to show what data flows between systems.
8. **Integration direction = data flow.** source → target means data flows FROM source TO target. This is NOT about who makes the HTTP request. For pull patterns (consumer requests data from provider), set \`initiator: "pull"\`.
9. **Integration operations: CUD only.** Only create/update/delete are valid on integration data objects. \`read\` is NOT valid — integrations carry data change events, not read operations. Reading is a local application operation.

## After Generation

1. Save the JSON to a local file (e.g. \`workspace.json\`).
2. Call \`validate\` to verify the file is valid.
3. If the user wants to import it, use \`/albumi-workspace:push_workspace\`.

## Working with generated files

Use \`jq\` via Bash to inspect and adjust specific sections instead of reading the full JSON:
\`\`\`bash
jq '.applications | length' workspace.json              # count entities
jq '.applications[] | {name, id}' workspace.json        # list names
jq '.integrations[] | {name, sourceApplicationId, targetApplicationId}' workspace.json
\`\`\``;

export function registerGeneratePrompt(server: McpServer) {
  server.prompt(
    'generate_workspace',
    'Generate workspace JSON from a text description of an IT landscape. Provides schema knowledge and rules for creating valid workspace data.',
    async () => ({
      messages: [
        {
          role: 'user' as const,
          content: { type: 'text' as const, text: GENERATE_PROMPT },
        },
      ],
    }),
  );
}
