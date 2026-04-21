/**
 * Deterministic EAM analysis checks.
 * ~70 checks across 16 categories that can run in code without AI judgment.
 */

// Enum values — checked-in copies synced from the canonical source in the
// main repo (web/src/app/shared/enums/generated/). Re-sync when schema changes.
import { LifecycleStatus } from "./enums/lifecycle-status.enum.js";
import { DataClassification } from "./enums/data-classification.enum.js";
import { InterfaceDirection } from "./enums/interface-direction.enum.js";
import { IntegrationAuthentication } from "./enums/integration-authentication.enum.js";
import { TimeClassification } from "./enums/time-classification.enum.js";
import { ImpactType } from "./enums/impact-type.enum.js";
import { InitiativeStatus } from "./enums/initiative-status.enum.js";
import { InitiativeType } from "./enums/initiative-type.enum.js";
import { EntityStatus } from "./enums/entity-status.enum.js";
import { BusinessCriticality } from "./enums/business-criticality.enum.js";
import { FitLevel } from "./enums/fit-level.enum.js";
import { StrategicImportance } from "./enums/strategic-importance.enum.js";
import { HostingType } from "./enums/hosting-type.enum.js";
import { IntegrationProtocol } from "./enums/integration-protocol.enum.js";
import { IntegrationDeliveryPattern } from "./enums/integration-delivery-pattern.enum.js";
import { IntegrationFrequency } from "./enums/integration-frequency.enum.js";
import { DataObjectOperation } from "./enums/data-object-operation.enum.js";

export type Severity = "critical" | "warning" | "info";
export type Category =
  | "structural_integrity"
  | "data_quality"
  | "architecture_consistency"
  | "lifecycle_coherence"
  | "network_analysis"
  | "portfolio_health"
  | "compliance_risk"
  | "technology_risk"
  | "initiative_alignment"
  | "organizational_coverage"
  | "cross_mapping_consistency"
  | "redundancy"
  | "migration_planning"
  | "data_governance"
  | "complexity"
  | "strategic_alignment";

export interface RelatedEntity {
  entityType: string;
  entityId: string;
  entityName?: string;
  role: string;
}

export interface AnalysisFinding {
  checkId: string;
  category: Category;
  severity: Severity;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  message: string;
  relatedEntities?: RelatedEntity[];
}

interface WS {
  organizations?: Array<{
    id: string;
    name: string;
    parentId?: string;
    status?: string;
  }>;
  businessCapabilities?: Array<{
    id: string;
    name: string;
    parentId?: string;
    organizationId: string;
    level?: number;
    strategicImportance?: string;
  }>;
  dataObjects?: Array<{
    id: string;
    name: string;
    classification?: string;
    piiFlag?: boolean;
    pciFlag?: boolean;
    retentionPeriod?: string | null;
    organizationId: string;
    capabilityIds?: string[];
  }>;
  itComponents?: Array<{
    id: string;
    name: string;
    vendor?: string;
    licenseType?: string;
    organizationId?: string;
    lifecyclePlanDate?: string;
    lifecyclePhaseInDate?: string;
    lifecycleActiveDate?: string;
    lifecyclePhaseOutDate?: string;
    lifecycleEndOfLifeDate?: string;
  }>;
  applications?: Array<{
    id: string;
    name: string;
    organizationId: string;
    businessCriticality?: string;
    functionalFit?: string;
    technicalFit?: string;
    timeClassification?: string;
    hostingType?: string;
    cloudProvider?: string;
    subtype?: string;
    dataClassification?: string;
    gdprRelevant?: boolean;
    pciDssRelevant?: boolean;
    soxRelevant?: boolean;
    lifecyclePlanDate?: string;
    lifecyclePhaseInDate?: string;
    lifecycleActiveDate?: string;
    lifecyclePhaseOutDate?: string;
    lifecycleEndOfLifeDate?: string;
    ownerUserId?: string;
    capabilities?: Array<{ capabilityId: string }>;
    itComponents?: Array<{ itComponentId: string }>;
    dataObjects?: Array<{ dataObjectId: string; operations?: string[] }>;
    interfaces?: Array<{ id: string; direction: string; protocol?: string }>;
  }>;
  integrations?: Array<{
    id: string;
    name: string;
    sourceApplicationId: string;
    targetApplicationId: string;
    sourceInterfaceId?: string;
    targetInterfaceId?: string;
    protocol?: string;
    dataFormat?: string;
    authentication?: string;
    frequency?: string;
    deliveryPattern?: string;
    lifecyclePlanDate?: string;
    lifecyclePhaseInDate?: string;
    lifecycleActiveDate?: string;
    lifecyclePhaseOutDate?: string;
    lifecycleEndOfLifeDate?: string;
    dataObjects?: Array<{ dataObjectId: string; operations?: string[] }>;
    middlewares?: Array<{ itComponentId: string }>;
  }>;
  initiatives?: Array<{
    id: string;
    name: string;
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    applicationImpacts?: Array<{ applicationId: string; impactType: string }>;
  }>;
}

// === Lifecycle Status Helper ===

import type { LifecycleStatusType } from "./enums/lifecycle-status.enum.js";

interface LifecycleEntity {
  lifecyclePlanDate?: string;
  lifecyclePhaseInDate?: string;
  lifecycleActiveDate?: string;
  lifecyclePhaseOutDate?: string;
  lifecycleEndOfLifeDate?: string;
}

function getLifecycleStatus(entity: LifecycleEntity): LifecycleStatusType {
  const today = new Date().toISOString().split("T")[0];
  if (entity.lifecycleEndOfLifeDate && entity.lifecycleEndOfLifeDate <= today)
    return LifecycleStatus.END_OF_LIFE;
  if (entity.lifecyclePhaseOutDate && entity.lifecyclePhaseOutDate <= today)
    return LifecycleStatus.PHASE_OUT;
  if (entity.lifecycleActiveDate && entity.lifecycleActiveDate <= today)
    return LifecycleStatus.ACTIVE;
  if (entity.lifecyclePhaseInDate && entity.lifecyclePhaseInDate <= today)
    return LifecycleStatus.PHASE_IN;
  if (entity.lifecyclePlanDate) return LifecycleStatus.PLAN;
  return LifecycleStatus.UNKNOWN;
}

export function analyzeWorkspace(data: unknown): AnalysisFinding[] {
  const ws = data as WS;
  const findings: AnalysisFinding[] = [];

  checkStructuralIntegrity(ws, findings);
  checkDataQuality(ws, findings);
  checkArchitectureConsistency(ws, findings);
  checkLifecycleCoherence(ws, findings);
  checkNetworkAnalysis(ws, findings);
  checkDataFlowConsistency(ws, findings);
  checkComplianceRisk(ws, findings);
  checkPortfolioHealth(ws, findings);
  checkTechnologyRisk(ws, findings);
  checkInitiativeAlignment(ws, findings);
  checkOrganizationalCoverage(ws, findings);
  checkCrossMappingConsistency(ws, findings);
  checkRedundancy(ws, findings);
  checkMigrationPlanning(ws, findings);
  checkDataGovernance(ws, findings);
  checkComplexity(ws, findings);
  checkStrategicAlignment(ws, findings);

  return findings;
}

// === Structural Integrity ===

function checkStructuralIntegrity(ws: WS, findings: AnalysisFinding[]) {
  // S1: Duplicate entity names within type
  const checkDuplicates = (
    items: Array<{ id: string; name: string }> | undefined,
    entityType: string,
  ) => {
    if (!items) return;
    const nameCount = new Map<string, string[]>();
    for (const item of items) {
      const ids = nameCount.get(item.name) ?? [];
      ids.push(item.id);
      nameCount.set(item.name, ids);
    }
    for (const [name, ids] of nameCount) {
      if (ids.length > 1) {
        findings.push({
          checkId: "S1",
          category: "structural_integrity",
          severity: "warning",
          entityType,
          message: `Duplicate name "${name}" found on ${ids.length} entities: ${ids.join(", ")}`,
        });
      }
    }
  };
  checkDuplicates(ws.applications, "Application");
  checkDuplicates(ws.integrations, "Integration");
  checkDuplicates(ws.itComponents, "ITComponent");
  checkDuplicates(ws.dataObjects, "DataObject");

  // S2: Self-referencing integrations
  for (const int of ws.integrations ?? []) {
    if (int.sourceApplicationId === int.targetApplicationId) {
      findings.push({
        checkId: "S2",
        category: "structural_integrity",
        severity: "warning",
        entityType: "Integration",
        entityId: int.id,
        entityName: int.name,
        message: `Self-referencing integration (source and target are the same application)`,
      });
    }
  }

  // S3: Duplicate integration pairs
  const pairSet = new Set<string>();
  for (const int of ws.integrations ?? []) {
    const pair = `${int.sourceApplicationId}→${int.targetApplicationId}`;
    if (pairSet.has(pair)) {
      findings.push({
        checkId: "S3",
        category: "structural_integrity",
        severity: "warning",
        entityType: "Integration",
        entityId: int.id,
        entityName: int.name,
        message: `Duplicate integration pair (same source→target already exists)`,
      });
    }
    pairSet.add(pair);
  }

  // S4: Interface direction consistency (source interface should be output, target interface should be input)
  const interfaceMap = new Map<string, { direction: string; appId: string }>();
  for (const app of ws.applications ?? []) {
    for (const iface of app.interfaces ?? []) {
      interfaceMap.set(iface.id, { direction: iface.direction, appId: app.id });
    }
  }
  for (const int of ws.integrations ?? []) {
    if (int.sourceInterfaceId) {
      const iface = interfaceMap.get(int.sourceInterfaceId);
      if (iface && iface.direction !== InterfaceDirection.OUTPUT) {
        findings.push({
          checkId: "S4",
          category: "structural_integrity",
          severity: "critical",
          entityType: "Integration",
          entityId: int.id,
          entityName: int.name,
          message: `Source interface "${int.sourceInterfaceId}" has direction "${iface.direction}" (expected "${InterfaceDirection.OUTPUT}")`,
        });
      }
    }
    if (int.targetInterfaceId) {
      const iface = interfaceMap.get(int.targetInterfaceId);
      if (iface && iface.direction !== InterfaceDirection.INPUT) {
        findings.push({
          checkId: "S4",
          category: "structural_integrity",
          severity: "critical",
          entityType: "Integration",
          entityId: int.id,
          entityName: int.name,
          message: `Target interface "${int.targetInterfaceId}" has direction "${iface.direction}" (expected "${InterfaceDirection.INPUT}")`,
        });
      }
    }
  }

  // S5: Interface ownership mismatch (interface belongs to wrong app)
  for (const int of ws.integrations ?? []) {
    if (int.sourceInterfaceId) {
      const iface = interfaceMap.get(int.sourceInterfaceId);
      if (iface && iface.appId !== int.sourceApplicationId) {
        findings.push({
          checkId: "S5",
          category: "structural_integrity",
          severity: "critical",
          entityType: "Integration",
          entityId: int.id,
          entityName: int.name,
          message: `Source interface "${int.sourceInterfaceId}" belongs to app "${iface.appId}", not to source app "${int.sourceApplicationId}"`,
        });
      }
    }
    if (int.targetInterfaceId) {
      const iface = interfaceMap.get(int.targetInterfaceId);
      if (iface && iface.appId !== int.targetApplicationId) {
        findings.push({
          checkId: "S5",
          category: "structural_integrity",
          severity: "critical",
          entityType: "Integration",
          entityId: int.id,
          entityName: int.name,
          message: `Target interface "${int.targetInterfaceId}" belongs to app "${iface.appId}", not to target app "${int.targetApplicationId}"`,
        });
      }
    }
  }
}

// === Data Quality ===

function checkDataQuality(ws: WS, findings: AnalysisFinding[]) {
  // DQ1: Applications missing businessCriticality
  for (const app of ws.applications ?? []) {
    if (!app.businessCriticality) {
      findings.push({
        checkId: "DQ1",
        category: "data_quality",
        severity: "critical",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Missing businessCriticality`,
      });
    }
  }

  // DQ2: Applications missing functional/technical fit
  for (const app of ws.applications ?? []) {
    if (!app.functionalFit || !app.technicalFit) {
      findings.push({
        checkId: "DQ2",
        category: "data_quality",
        severity: "warning",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Missing ${!app.functionalFit ? "functionalFit" : ""}${!app.functionalFit && !app.technicalFit ? " and " : ""}${!app.technicalFit ? "technicalFit" : ""}`,
      });
    }
  }

  // DQ3: Applications without capabilities
  for (const app of ws.applications ?? []) {
    if (!app.capabilities || app.capabilities.length === 0) {
      findings.push({
        checkId: "DQ3",
        category: "data_quality",
        severity: "warning",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Not mapped to any business capability`,
      });
    }
  }

  // DQ4: Integrations missing technical details
  for (const int of ws.integrations ?? []) {
    const missing: string[] = [];
    if (!int.protocol) missing.push("protocol");
    if (!int.dataFormat) missing.push("dataFormat");
    if (!int.authentication) missing.push("authentication");
    if (!int.frequency) missing.push("frequency");
    if (missing.length > 0) {
      findings.push({
        checkId: "DQ4",
        category: "data_quality",
        severity: "warning",
        entityType: "Integration",
        entityId: int.id,
        entityName: int.name,
        message: `Missing technical details: ${missing.join(", ")}`,
      });
    }
  }

  // DQ5: Data objects missing classification
  for (const dobj of ws.dataObjects ?? []) {
    if (!dobj.classification) {
      const severity: Severity =
        dobj.piiFlag || dobj.pciFlag ? "critical" : "warning";
      findings.push({
        checkId: "DQ5",
        category: "data_quality",
        severity,
        entityType: "DataObject",
        entityId: dobj.id,
        entityName: dobj.name,
        message: `Missing classification${dobj.piiFlag ? " (PII flagged)" : ""}${dobj.pciFlag ? " (PCI flagged)" : ""}`,
      });
    }
  }
}

// === Architecture Consistency ===

function checkArchitectureConsistency(ws: WS, findings: AnalysisFinding[]) {
  // AC1: Cloud provider set without cloud hosting
  for (const app of ws.applications ?? []) {
    if (
      app.cloudProvider &&
      app.hostingType &&
      app.hostingType !== HostingType.CLOUD &&
      app.hostingType !== HostingType.HYBRID &&
      app.hostingType !== HostingType.SAAS
    ) {
      findings.push({
        checkId: "AC1",
        category: "architecture_consistency",
        severity: "warning",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Cloud provider "${app.cloudProvider}" set but hosting type is "${app.hostingType}"`,
      });
    }
  }

  // AC2: Integration protocol/pattern mismatches
  const incompatible: Record<string, string[]> = {
    [IntegrationProtocol.KAFKA]: [IntegrationDeliveryPattern.REQUEST_RESPONSE],
    [IntegrationProtocol.SFTP]: [IntegrationFrequency.REAL_TIME],
    [IntegrationProtocol.FTP]: [IntegrationFrequency.REAL_TIME],
  };
  for (const int of ws.integrations ?? []) {
    if (int.protocol && int.deliveryPattern) {
      const badPatterns = incompatible[int.protocol];
      if (badPatterns && badPatterns.includes(int.deliveryPattern)) {
        findings.push({
          checkId: "AC2",
          category: "architecture_consistency",
          severity: "warning",
          entityType: "Integration",
          entityId: int.id,
          entityName: int.name,
          message: `Protocol "${int.protocol}" is incompatible with delivery pattern "${int.deliveryPattern}"`,
        });
      }
    }
  }
}

// === Lifecycle Coherence ===

function checkLifecycleCoherence(ws: WS, findings: AnalysisFinding[]) {
  // LC1: Date order violations
  const checkDateOrder = (
    entity: {
      id: string;
      name: string;
      lifecyclePlanDate?: string;
      lifecyclePhaseInDate?: string;
      lifecycleActiveDate?: string;
      lifecyclePhaseOutDate?: string;
      lifecycleEndOfLifeDate?: string;
    },
    entityType: string,
  ) => {
    const dates = [
      { name: "Plan", value: entity.lifecyclePlanDate },
      { name: "PhaseIn", value: entity.lifecyclePhaseInDate },
      { name: "Active", value: entity.lifecycleActiveDate },
      { name: "PhaseOut", value: entity.lifecyclePhaseOutDate },
      { name: "EndOfLife", value: entity.lifecycleEndOfLifeDate },
    ].filter((d) => d.value);

    for (let i = 0; i < dates.length - 1; i++) {
      if (dates[i].value! > dates[i + 1].value!) {
        findings.push({
          checkId: "LC1",
          category: "lifecycle_coherence",
          severity: "critical",
          entityType,
          entityId: entity.id,
          entityName: entity.name,
          message: `Lifecycle date order violation: ${dates[i].name} (${dates[i].value}) > ${dates[i + 1].name} (${dates[i + 1].value})`,
        });
      }
    }
  };
  for (const app of ws.applications ?? []) checkDateOrder(app, "Application");
  for (const int of ws.integrations ?? []) checkDateOrder(int, "Integration");
  for (const itc of ws.itComponents ?? []) checkDateOrder(itc, "ITComponent");

  // Build lookup maps for related entity references
  const appLookup = new Map<
    string,
    {
      id: string;
      name: string;
      lifecycleActiveDate?: string;
      lifecyclePhaseOutDate?: string;
      lifecycleEndOfLifeDate?: string;
    }
  >();
  for (const app of ws.applications ?? []) {
    appLookup.set(app.id, app);
  }
  const itcLookup = new Map<string, { id: string; name: string }>();
  for (const itc of ws.itComponents ?? []) {
    itcLookup.set(itc.id, itc);
  }
  const today = new Date().toISOString().split("T")[0];

  // LC2: EOL IT components used by active apps
  const eolItcIds = new Set<string>();
  for (const itc of ws.itComponents ?? []) {
    if (itc.lifecycleEndOfLifeDate && itc.lifecycleEndOfLifeDate <= today) {
      eolItcIds.add(itc.id);
    }
  }
  for (const app of ws.applications ?? []) {
    for (const ref of app.itComponents ?? []) {
      if (eolItcIds.has(ref.itComponentId)) {
        const itc = itcLookup.get(ref.itComponentId);
        findings.push({
          checkId: "LC2",
          category: "lifecycle_coherence",
          severity: "critical",
          entityType: "Application",
          entityId: app.id,
          entityName: app.name,
          message: `Uses EOL IT component "${itc?.name ?? ref.itComponentId}"`,
          relatedEntities: [
            {
              entityType: "ITComponent",
              entityId: ref.itComponentId,
              entityName: itc?.name,
              role: "eol_component",
            },
          ],
        });
      }
    }
  }

  // LC3: Active integrations to EOL/phase-out apps
  const eolAppIds = new Set<string>();
  const phaseOutAppIds = new Set<string>();
  for (const app of ws.applications ?? []) {
    if (app.lifecycleEndOfLifeDate && app.lifecycleEndOfLifeDate <= today)
      eolAppIds.add(app.id);
    else if (app.lifecyclePhaseOutDate && app.lifecyclePhaseOutDate <= today)
      phaseOutAppIds.add(app.id);
  }
  for (const int of ws.integrations ?? []) {
    const related: RelatedEntity[] = [];
    if (eolAppIds.has(int.sourceApplicationId))
      related.push({
        entityType: "Application",
        entityId: int.sourceApplicationId,
        entityName: appLookup.get(int.sourceApplicationId)?.name,
        role: "source_eol",
      });
    if (eolAppIds.has(int.targetApplicationId))
      related.push({
        entityType: "Application",
        entityId: int.targetApplicationId,
        entityName: appLookup.get(int.targetApplicationId)?.name,
        role: "target_eol",
      });
    if (related.length > 0) {
      findings.push({
        checkId: "LC3",
        category: "lifecycle_coherence",
        severity: "critical",
        entityType: "Integration",
        entityId: int.id,
        entityName: int.name,
        message: `Integration connects to End-of-Life application: ${related.map((r) => r.entityName ?? r.entityId).join(", ")}`,
        relatedEntities: related,
      });
      continue;
    }
    if (phaseOutAppIds.has(int.sourceApplicationId))
      related.push({
        entityType: "Application",
        entityId: int.sourceApplicationId,
        entityName: appLookup.get(int.sourceApplicationId)?.name,
        role: "source_phase_out",
      });
    if (phaseOutAppIds.has(int.targetApplicationId))
      related.push({
        entityType: "Application",
        entityId: int.targetApplicationId,
        entityName: appLookup.get(int.targetApplicationId)?.name,
        role: "target_phase_out",
      });
    if (related.length > 0) {
      findings.push({
        checkId: "LC3",
        category: "lifecycle_coherence",
        severity: "warning",
        entityType: "Integration",
        entityId: int.id,
        entityName: int.name,
        message: `Integration connects to Phase-Out application: ${related.map((r) => r.entityName ?? r.entityId).join(", ")}`,
        relatedEntities: related,
      });
    }
  }

  // LC4: Integration without lifecycle dates when connected apps have dates
  for (const int of ws.integrations ?? []) {
    if (int.lifecycleActiveDate) continue;
    const src = appLookup.get(int.sourceApplicationId);
    const tgt = appLookup.get(int.targetApplicationId);
    if (src?.lifecycleActiveDate || tgt?.lifecycleActiveDate) {
      const related: RelatedEntity[] = [
        {
          entityType: "Application",
          entityId: int.sourceApplicationId,
          entityName: src?.name,
          role: "source",
        },
        {
          entityType: "Application",
          entityId: int.targetApplicationId,
          entityName: tgt?.name,
          role: "target",
        },
      ];
      findings.push({
        checkId: "LC4",
        category: "lifecycle_coherence",
        severity: "warning",
        entityType: "Integration",
        entityId: int.id,
        entityName: int.name,
        message: `Integration has no lifecycle dates, but connected applications do (${src?.name ?? "?"} → ${tgt?.name ?? "?"})`,
        relatedEntities: related,
      });
    }
  }

  // LC5: App phase-out/EOL but integration has no corresponding phase-out date
  for (const int of ws.integrations ?? []) {
    if (int.lifecyclePhaseOutDate || int.lifecycleEndOfLifeDate) continue;
    const related: RelatedEntity[] = [];
    const src = appLookup.get(int.sourceApplicationId);
    const tgt = appLookup.get(int.targetApplicationId);
    if (src?.lifecyclePhaseOutDate || src?.lifecycleEndOfLifeDate) {
      related.push({
        entityType: "Application",
        entityId: int.sourceApplicationId,
        entityName: src.name,
        role: "source_retiring",
      });
    }
    if (tgt?.lifecyclePhaseOutDate || tgt?.lifecycleEndOfLifeDate) {
      related.push({
        entityType: "Application",
        entityId: int.targetApplicationId,
        entityName: tgt.name,
        role: "target_retiring",
      });
    }
    if (related.length > 0) {
      findings.push({
        checkId: "LC5",
        category: "lifecycle_coherence",
        severity: "warning",
        entityType: "Integration",
        entityId: int.id,
        entityName: int.name,
        message: `Application ${related.map((r) => `"${r.entityName}"`).join(", ")} is being retired, but integration has no phase-out/EOL date`,
        relatedEntities: related,
      });
    }
  }

  // LC6: Active applications without any lifecycle dates
  for (const app of ws.applications ?? []) {
    const hasAnyDate =
      app.lifecyclePlanDate ||
      app.lifecyclePhaseInDate ||
      app.lifecycleActiveDate ||
      app.lifecyclePhaseOutDate ||
      app.lifecycleEndOfLifeDate;
    if (!hasAnyDate) {
      findings.push({
        checkId: "LC6",
        category: "lifecycle_coherence",
        severity: "warning",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Application has no lifecycle dates — no lifecycle management`,
      });
    }
  }

  // LC7: IT components without any lifecycle dates
  for (const itc of ws.itComponents ?? []) {
    const hasAnyDate =
      itc.lifecyclePlanDate ||
      itc.lifecyclePhaseInDate ||
      itc.lifecycleActiveDate ||
      itc.lifecyclePhaseOutDate ||
      itc.lifecycleEndOfLifeDate;
    if (!hasAnyDate) {
      findings.push({
        checkId: "LC7",
        category: "lifecycle_coherence",
        severity: "info",
        entityType: "ITComponent",
        entityId: itc.id,
        entityName: itc.name,
        message: `IT component has no lifecycle dates`,
      });
    }
  }
}

// === Network Analysis ===

function checkNetworkAnalysis(ws: WS, findings: AnalysisFinding[]) {
  const appIntegrationCount = new Map<string, number>();
  for (const app of ws.applications ?? []) {
    appIntegrationCount.set(app.id, 0);
  }

  for (const int of ws.integrations ?? []) {
    appIntegrationCount.set(
      int.sourceApplicationId,
      (appIntegrationCount.get(int.sourceApplicationId) ?? 0) + 1,
    );
    appIntegrationCount.set(
      int.targetApplicationId,
      (appIntegrationCount.get(int.targetApplicationId) ?? 0) + 1,
    );
  }

  const appNameMap = new Map(
    (ws.applications ?? []).map((a) => [a.id, a.name]),
  );

  // NA1: Integration hub detection (> 10 integrations)
  for (const [appId, count] of appIntegrationCount) {
    if (count > 10) {
      findings.push({
        checkId: "NA1",
        category: "network_analysis",
        severity: count > 20 ? "critical" : "warning",
        entityType: "Application",
        entityId: appId,
        entityName: appNameMap.get(appId),
        message: `Integration hub: ${count} integrations (potential single point of failure)`,
      });
    }
  }

  // NA2: Isolated applications (zero integrations)
  for (const [appId, count] of appIntegrationCount) {
    if (count === 0) {
      findings.push({
        checkId: "NA2",
        category: "network_analysis",
        severity: "info",
        entityType: "Application",
        entityId: appId,
        entityName: appNameMap.get(appId),
        message: `Isolated application: no integrations`,
      });
    }
  }

  // NA3: Data flows without data objects
  for (const int of ws.integrations ?? []) {
    if (!int.dataObjects || int.dataObjects.length === 0) {
      findings.push({
        checkId: "NA3",
        category: "network_analysis",
        severity: "warning",
        entityType: "Integration",
        entityId: int.id,
        entityName: int.name,
        message: `Integration has no data objects mapped`,
      });
    }
  }

  // NA4: Multiple data masters (multiple apps "create" same data object)
  const dataObjectCreators = new Map<string, string[]>();
  for (const app of ws.applications ?? []) {
    for (const doRef of app.dataObjects ?? []) {
      if (doRef.operations?.includes(DataObjectOperation.CREATE)) {
        const creators = dataObjectCreators.get(doRef.dataObjectId) ?? [];
        creators.push(app.id);
        dataObjectCreators.set(doRef.dataObjectId, creators);
      }
    }
  }
  const doNameMap = new Map((ws.dataObjects ?? []).map((d) => [d.id, d.name]));
  for (const [doId, creators] of dataObjectCreators) {
    if (creators.length > 1) {
      findings.push({
        checkId: "NA4",
        category: "network_analysis",
        severity: "warning",
        entityType: "DataObject",
        entityId: doId,
        entityName: doNameMap.get(doId),
        message: `Multiple data masters: ${creators.length} apps create this data object (${creators.map((id) => appNameMap.get(id) ?? id).join(", ")})`,
      });
    }
  }
}

// === Data Flow Consistency ===

function checkDataFlowConsistency(ws: WS, findings: AnalysisFinding[]) {
  const doIdSet = new Set((ws.dataObjects ?? []).map((d) => d.id));
  const doNameMap = new Map((ws.dataObjects ?? []).map((d) => [d.id, d.name]));
  const appMap = new Map((ws.applications ?? []).map((a) => [a.id, a]));
  const appNameMap = new Map(
    (ws.applications ?? []).map((a) => [a.id, a.name]),
  );

  // DF1: Orphan data object references on integrations
  for (const int of ws.integrations ?? []) {
    for (const doRef of int.dataObjects ?? []) {
      if (!doIdSet.has(doRef.dataObjectId)) {
        findings.push({
          checkId: "DF1",
          category: "network_analysis",
          severity: "critical",
          entityType: "Integration",
          entityId: int.id,
          entityName: int.name,
          message: `References non-existent data object "${doRef.dataObjectId}"`,
        });
      }
    }
  }

  // DF2: Orphan data object references on applications
  for (const app of ws.applications ?? []) {
    for (const doRef of app.dataObjects ?? []) {
      if (!doIdSet.has(doRef.dataObjectId)) {
        findings.push({
          checkId: "DF2",
          category: "network_analysis",
          severity: "warning",
          entityType: "Application",
          entityId: app.id,
          entityName: app.name,
          message: `References non-existent data object "${doRef.dataObjectId}"`,
        });
      }
    }
  }

  // DF3 + DF4 + DF5: Integration data objects vs source/target applications
  for (const int of ws.integrations ?? []) {
    const sourceApp = appMap.get(int.sourceApplicationId);
    const targetApp = appMap.get(int.targetApplicationId);
    const sourceDoIds = new Set(
      (sourceApp?.dataObjects ?? []).map((d) => d.dataObjectId),
    );
    const targetDoIds = new Set(
      (targetApp?.dataObjects ?? []).map((d) => d.dataObjectId),
    );

    for (const doRef of int.dataObjects ?? []) {
      if (!doIdSet.has(doRef.dataObjectId)) continue; // caught by DF1
      const doName = doNameMap.get(doRef.dataObjectId) ?? doRef.dataObjectId;

      // DF3: Not in source application
      if (sourceApp && !sourceDoIds.has(doRef.dataObjectId)) {
        findings.push({
          checkId: "DF3",
          category: "network_analysis",
          severity: "warning",
          entityType: "Integration",
          entityId: int.id,
          entityName: int.name,
          message: `Data object "${doName}" not declared on source application "${appNameMap.get(int.sourceApplicationId)}"`,
        });
      }

      // DF4: Not in target application
      if (targetApp && !targetDoIds.has(doRef.dataObjectId)) {
        findings.push({
          checkId: "DF4",
          category: "network_analysis",
          severity: "warning",
          entityType: "Integration",
          entityId: int.id,
          entityName: int.name,
          message: `Data object "${doName}" not declared on target application "${appNameMap.get(int.targetApplicationId)}"`,
        });
      }

      // DF5: Operation mismatch — integration declares op that source app doesn't have
      if (sourceApp && sourceDoIds.has(doRef.dataObjectId)) {
        const sourceDO = (sourceApp.dataObjects ?? []).find(
          (d) => d.dataObjectId === doRef.dataObjectId,
        );
        const sourceOps = new Set(sourceDO?.operations ?? []);
        for (const op of doRef.operations ?? []) {
          if (!sourceOps.has(op)) {
            findings.push({
              checkId: "DF5",
              category: "network_analysis",
              severity: "warning",
              entityType: "Integration",
              entityId: int.id,
              entityName: int.name,
              message: `Operation "${op}" on data object "${doName}" not declared on source application "${appNameMap.get(int.sourceApplicationId)}"`,
            });
          }
        }
      }
    }
  }

  // DF6: No system of record — data object with no "create" anywhere
  const allCreatedDoIds = new Set<string>();
  for (const app of ws.applications ?? []) {
    for (const doRef of app.dataObjects ?? []) {
      if (doRef.operations?.includes(DataObjectOperation.CREATE)) {
        allCreatedDoIds.add(doRef.dataObjectId);
      }
    }
  }
  for (const dobj of ws.dataObjects ?? []) {
    if (!allCreatedDoIds.has(dobj.id)) {
      findings.push({
        checkId: "DF6",
        category: "network_analysis",
        severity: "warning",
        entityType: "DataObject",
        entityId: dobj.id,
        entityName: dobj.name,
        message: `No application has "create" operation — no system of record identified`,
      });
    }
  }

  // DF8: Data origin gap — app modifies data it didn't create and doesn't receive via integration
  const incomingCreateByAppDo = new Set<string>(); // "appId|doId" pairs where integration brings Create
  for (const int of ws.integrations ?? []) {
    for (const doRef of int.dataObjects ?? []) {
      if (doRef.operations?.includes(DataObjectOperation.CREATE)) {
        incomingCreateByAppDo.add(
          `${int.targetApplicationId}|${doRef.dataObjectId}`,
        );
      }
    }
  }
  for (const app of ws.applications ?? []) {
    for (const doRef of app.dataObjects ?? []) {
      const ops = doRef.operations ?? [];
      // Skip if app creates the data (it's the origin)
      if (ops.includes(DataObjectOperation.CREATE)) continue;
      // Skip if app only reads (no modification, no origin needed locally)
      if (
        !ops.includes(DataObjectOperation.UPDATE) &&
        !ops.includes(DataObjectOperation.DELETE)
      )
        continue;
      // Check if any incoming integration brings Create for this data object
      if (incomingCreateByAppDo.has(`${app.id}|${doRef.dataObjectId}`))
        continue;
      // Gap: app modifies data but doesn't create it and doesn't receive it
      const doName = doNameMap.get(doRef.dataObjectId) ?? doRef.dataObjectId;
      findings.push({
        checkId: "DF8",
        category: "network_analysis",
        severity: "warning",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Data origin gap: app has ${ops.filter((o) => o !== DataObjectOperation.READ).join("/")} on "${doName}" but neither creates it nor receives it via integration`,
        relatedEntities: [
          {
            entityType: "DataObject",
            entityId: doRef.dataObjectId,
            entityName: doName,
            role: "orphaned_data",
          },
        ],
      });
    }
  }

  // DF7: Sensitive data not mapped to any application
  const allAppDoIds = new Set<string>();
  for (const app of ws.applications ?? []) {
    for (const doRef of app.dataObjects ?? []) {
      allAppDoIds.add(doRef.dataObjectId);
    }
  }
  for (const dobj of ws.dataObjects ?? []) {
    if (
      (dobj.classification === DataClassification.CONFIDENTIAL ||
        dobj.classification === DataClassification.RESTRICTED) &&
      !allAppDoIds.has(dobj.id)
    ) {
      findings.push({
        checkId: "DF7",
        category: "network_analysis",
        severity: "warning",
        entityType: "DataObject",
        entityId: dobj.id,
        entityName: dobj.name,
        message: `Sensitive data object (${dobj.classification}) not mapped to any application`,
      });
    }
  }
}

// === Compliance & Risk ===

function checkComplianceRisk(ws: WS, findings: AnalysisFinding[]) {
  const doMap = new Map((ws.dataObjects ?? []).map((d) => [d.id, d]));

  // CR1: Auth "None" on integrations carrying sensitive data
  for (const int of ws.integrations ?? []) {
    if (
      int.authentication === IntegrationAuthentication.NONE &&
      int.dataObjects &&
      int.dataObjects.length > 0
    ) {
      const hasSensitive = int.dataObjects.some((doRef) => {
        const dobj = doMap.get(doRef.dataObjectId);
        return (
          dobj &&
          (dobj.piiFlag ||
            dobj.pciFlag ||
            dobj.classification === DataClassification.RESTRICTED ||
            dobj.classification === DataClassification.CONFIDENTIAL)
        );
      });
      if (hasSensitive) {
        findings.push({
          checkId: "CR1",
          category: "compliance_risk",
          severity: "critical",
          entityType: "Integration",
          entityId: int.id,
          entityName: int.name,
          message: `No authentication on integration carrying sensitive data`,
        });
      }
    }
  }

  // CR2: PII/PCI data on unencrypted protocols
  const unencryptedProtocols = [
    IntegrationProtocol.HTTP,
    IntegrationProtocol.FTP,
  ];
  for (const int of ws.integrations ?? []) {
    if (
      int.protocol &&
      (unencryptedProtocols as string[]).includes(int.protocol)
    ) {
      const hasPiiPci = (int.dataObjects ?? []).some((doRef) => {
        const dobj = doMap.get(doRef.dataObjectId);
        return dobj && (dobj.piiFlag || dobj.pciFlag);
      });
      if (hasPiiPci) {
        findings.push({
          checkId: "CR2",
          category: "compliance_risk",
          severity: "critical",
          entityType: "Integration",
          entityId: int.id,
          entityName: int.name,
          message: `PII/PCI data transmitted over unencrypted protocol "${int.protocol}"`,
        });
      }
    }
  }

  // CR3: PII data objects without retention period
  for (const dobj of ws.dataObjects ?? []) {
    if (dobj.piiFlag && !dobj.retentionPeriod) {
      findings.push({
        checkId: "CR3",
        category: "compliance_risk",
        severity: "warning",
        entityType: "DataObject",
        entityId: dobj.id,
        entityName: dobj.name,
        message: `PII data object without retention period`,
      });
    }
  }

  // CR4: Entity ownership gaps
  for (const app of ws.applications ?? []) {
    if (!app.ownerUserId) {
      findings.push({
        checkId: "CR4",
        category: "compliance_risk",
        severity: "warning",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `No owner assigned`,
      });
    }
  }
}

// === Portfolio Health ===

function checkPortfolioHealth(ws: WS, findings: AnalysisFinding[]) {
  const EOL_WAVE_THRESHOLD = 3;
  const STALE_PLAN_MONTHS = 12;

  const apps = ws.applications ?? [];
  const itcs = ws.itComponents ?? [];
  const appNameMap = new Map(apps.map((a) => [a.id, a.name]));
  const capNameMap = new Map(
    (ws.businessCapabilities ?? []).map((c) => [c.id, c.name]),
  );

  // Build capability-to-apps map with lifecycle status
  const capToApps = new Map<
    string,
    Array<{ id: string; name: string; status: LifecycleStatusType }>
  >();
  for (const app of apps) {
    const status = getLifecycleStatus(app);
    for (const capRef of app.capabilities ?? []) {
      const list = capToApps.get(capRef.capabilityId) ?? [];
      list.push({ id: app.id, name: app.name, status });
      capToApps.set(capRef.capabilityId, list);
    }
  }

  // PH1: EOL Wave — >3 apps/ITCs reaching EOL in same 6-month window
  const eolBuckets = new Map<
    string,
    Array<{ entityType: string; id: string; name: string; date: string }>
  >();
  const toBucket = (dateStr: string): string => {
    const d = new Date(dateStr);
    const half = d.getMonth() < 6 ? "H1" : "H2";
    return `${d.getFullYear()}-${half}`;
  };
  for (const app of apps) {
    if (app.lifecycleEndOfLifeDate) {
      const bucket = toBucket(app.lifecycleEndOfLifeDate);
      const list = eolBuckets.get(bucket) ?? [];
      list.push({
        entityType: "Application",
        id: app.id,
        name: app.name,
        date: app.lifecycleEndOfLifeDate,
      });
      eolBuckets.set(bucket, list);
    }
  }
  for (const itc of itcs) {
    if (itc.lifecycleEndOfLifeDate) {
      const bucket = toBucket(itc.lifecycleEndOfLifeDate);
      const list = eolBuckets.get(bucket) ?? [];
      list.push({
        entityType: "ITComponent",
        id: itc.id,
        name: itc.name,
        date: itc.lifecycleEndOfLifeDate,
      });
      eolBuckets.set(bucket, list);
    }
  }
  for (const [bucket, entities] of eolBuckets) {
    if (entities.length > EOL_WAVE_THRESHOLD) {
      findings.push({
        checkId: "PH1",
        category: "portfolio_health",
        severity: "critical",
        message: `EOL wave: ${entities.length} apps/IT components reaching End of Life in ${bucket} (${entities.map((e) => e.name).join(", ")})`,
        relatedEntities: entities.map((e) => ({
          entityType: e.entityType,
          entityId: e.id,
          entityName: e.name,
          role: "eol_entity",
        })),
      });
    }
  }

  // PH2: Capability Coverage Gap — capability served ONLY by phase_out/EOL apps, no plan/phase_in/active app covers it
  const healthyStatuses: LifecycleStatusType[] = [
    LifecycleStatus.PLAN,
    LifecycleStatus.PHASE_IN,
    LifecycleStatus.ACTIVE,
    LifecycleStatus.UNKNOWN,
  ];
  for (const [capId, capApps] of capToApps) {
    if (capApps.length === 0) continue;
    const hasHealthy = capApps.some((a) => healthyStatuses.includes(a.status));
    if (!hasHealthy) {
      findings.push({
        checkId: "PH2",
        category: "portfolio_health",
        severity: "critical",
        entityType: "BusinessCapability",
        entityId: capId,
        entityName: capNameMap.get(capId),
        message: `Capability served only by phase-out/EOL applications (${capApps.map((a) => a.name).join(", ")}) — no active or planned successor`,
        relatedEntities: capApps.map((a) => ({
          entityType: "Application",
          entityId: a.id,
          entityName: a.name,
          role: "retiring_app",
        })),
      });
    }
  }

  // PH3: Stale Plan — app with planDate > 12 months ago, no phaseInDate
  const today = new Date();
  const staleThreshold = new Date(today);
  staleThreshold.setMonth(staleThreshold.getMonth() - STALE_PLAN_MONTHS);
  const staleStr = staleThreshold.toISOString().split("T")[0];
  for (const app of apps) {
    if (
      app.lifecyclePlanDate &&
      app.lifecyclePlanDate < staleStr &&
      !app.lifecyclePhaseInDate
    ) {
      findings.push({
        checkId: "PH3",
        category: "portfolio_health",
        severity: "warning",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Stale plan: planned since ${app.lifecyclePlanDate} (>${STALE_PLAN_MONTHS} months ago) with no Phase In date`,
      });
    }
  }

  // PH4: Phase Out Without Successor — app in phase_out, its capabilities not covered by any plan/phase_in/active app
  for (const app of apps) {
    const status = getLifecycleStatus(app);
    if (status !== LifecycleStatus.PHASE_OUT) continue;
    const uncoveredCaps: string[] = [];
    for (const capRef of app.capabilities ?? []) {
      const capApps = capToApps.get(capRef.capabilityId) ?? [];
      const hasSuccessor = capApps.some(
        (a) => a.id !== app.id && healthyStatuses.includes(a.status),
      );
      if (!hasSuccessor)
        uncoveredCaps.push(
          capNameMap.get(capRef.capabilityId) ?? capRef.capabilityId,
        );
    }
    if (uncoveredCaps.length > 0) {
      findings.push({
        checkId: "PH4",
        category: "portfolio_health",
        severity: "warning",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Phase-out app with no successor for capabilities: ${uncoveredCaps.join(", ")}`,
      });
    }
  }

  // PH5: Zombie App — EOL date in past but still has active integrations
  const todayStr = today.toISOString().split("T")[0];
  const activeIntegrationAppIds = new Set<string>();
  for (const int of ws.integrations ?? []) {
    const intStatus = getLifecycleStatus(int);
    if (
      intStatus !== LifecycleStatus.END_OF_LIFE &&
      intStatus !== LifecycleStatus.PHASE_OUT
    ) {
      activeIntegrationAppIds.add(int.sourceApplicationId);
      activeIntegrationAppIds.add(int.targetApplicationId);
    }
  }
  for (const app of apps) {
    if (
      app.lifecycleEndOfLifeDate &&
      app.lifecycleEndOfLifeDate <= todayStr &&
      activeIntegrationAppIds.has(app.id)
    ) {
      findings.push({
        checkId: "PH5",
        category: "portfolio_health",
        severity: "info",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Zombie app: EOL date ${app.lifecycleEndOfLifeDate} is in the past but still has active integrations`,
      });
    }
  }
}

// === Technology Risk ===

function checkTechnologyRisk(ws: WS, findings: AnalysisFinding[]) {
  const VENDOR_CONCENTRATION_THRESHOLD = 0.5;
  const LICENSE_CONCENTRATION_THRESHOLD = 0.7;

  const itcs = ws.itComponents ?? [];
  const apps = ws.applications ?? [];
  const itcNameMap = new Map(itcs.map((i) => [i.id, i.name]));
  const appNameMap = new Map(apps.map((a) => [a.id, a.name]));
  const capNameMap = new Map(
    (ws.businessCapabilities ?? []).map((c) => [c.id, c.name]),
  );

  // TR1: Vendor Concentration — one vendor >50% of IT components
  const itcsWithVendor = itcs.filter((i) => i.vendor);
  if (itcsWithVendor.length > 0) {
    const vendorCount = new Map<string, string[]>();
    for (const itc of itcsWithVendor) {
      const ids = vendorCount.get(itc.vendor!) ?? [];
      ids.push(itc.id);
      vendorCount.set(itc.vendor!, ids);
    }
    for (const [vendor, ids] of vendorCount) {
      const ratio = ids.length / itcs.length;
      if (ratio > VENDOR_CONCENTRATION_THRESHOLD) {
        findings.push({
          checkId: "TR1",
          category: "technology_risk",
          severity: "warning",
          message: `Vendor concentration: "${vendor}" accounts for ${ids.length}/${itcs.length} (${Math.round(ratio * 100)}%) of IT components`,
          relatedEntities: ids.map((id) => ({
            entityType: "ITComponent",
            entityId: id,
            entityName: itcNameMap.get(id),
            role: "vendor_component",
          })),
        });
      }
    }
  }

  // Build app-to-ITCs map
  const appItcMap = new Map<string, string[]>();
  for (const app of apps) {
    appItcMap.set(
      app.id,
      (app.itComponents ?? []).map((r) => r.itComponentId),
    );
  }

  // TR2: Single-Vendor App Stack — all of app's IT components from same vendor
  for (const app of apps) {
    const appItcIds = appItcMap.get(app.id) ?? [];
    if (appItcIds.length < 2) continue;
    const vendors = new Set<string>();
    let allHaveVendor = true;
    for (const itcId of appItcIds) {
      const itc = itcs.find((i) => i.id === itcId);
      if (itc?.vendor) vendors.add(itc.vendor);
      else allHaveVendor = false;
    }
    if (allHaveVendor && vendors.size === 1) {
      const vendor = [...vendors][0];
      findings.push({
        checkId: "TR2",
        category: "technology_risk",
        severity: "info",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Single-vendor stack: all ${appItcIds.length} IT components from "${vendor}"`,
      });
    }
  }

  // TR3: EOL IT Component still used by active apps (listing all affected apps)
  const todayStr = new Date().toISOString().split("T")[0];
  for (const itc of itcs) {
    if (!itc.lifecycleEndOfLifeDate || itc.lifecycleEndOfLifeDate > todayStr)
      continue;
    const affectedApps: RelatedEntity[] = [];
    for (const app of apps) {
      const status = getLifecycleStatus(app);
      if (
        status !== LifecycleStatus.ACTIVE &&
        status !== LifecycleStatus.PHASE_IN &&
        status !== LifecycleStatus.UNKNOWN
      )
        continue;
      const usesItc = (app.itComponents ?? []).some(
        (r) => r.itComponentId === itc.id,
      );
      if (usesItc) {
        affectedApps.push({
          entityType: "Application",
          entityId: app.id,
          entityName: app.name,
          role: "affected_app",
        });
      }
    }
    if (affectedApps.length > 0) {
      findings.push({
        checkId: "TR3",
        category: "technology_risk",
        severity: "warning",
        entityType: "ITComponent",
        entityId: itc.id,
        entityName: itc.name,
        message: `EOL IT component (${itc.lifecycleEndOfLifeDate}) still used by ${affectedApps.length} active app(s): ${affectedApps.map((a) => a.entityName).join(", ")}`,
        relatedEntities: affectedApps,
      });
    }
  }

  // TR4: License Type Concentration — one license type >70%
  const itcsWithLicense = itcs.filter((i) => i.licenseType);
  if (itcsWithLicense.length > 0) {
    const licenseCount = new Map<string, number>();
    for (const itc of itcsWithLicense) {
      licenseCount.set(
        itc.licenseType!,
        (licenseCount.get(itc.licenseType!) ?? 0) + 1,
      );
    }
    for (const [license, count] of licenseCount) {
      const ratio = count / itcs.length;
      if (ratio > LICENSE_CONCENTRATION_THRESHOLD) {
        findings.push({
          checkId: "TR4",
          category: "technology_risk",
          severity: "info",
          message: `License type concentration: "${license}" accounts for ${count}/${itcs.length} (${Math.round(ratio * 100)}%) of IT components`,
        });
      }
    }
  }

  // TR5: Orphaned IT Component — not linked to any app
  const usedItcIds = new Set<string>();
  for (const app of apps) {
    for (const ref of app.itComponents ?? []) usedItcIds.add(ref.itComponentId);
  }
  for (const int of ws.integrations ?? []) {
    for (const mw of int.middlewares ?? []) usedItcIds.add(mw.itComponentId);
  }
  for (const itc of itcs) {
    if (!usedItcIds.has(itc.id)) {
      findings.push({
        checkId: "TR5",
        category: "technology_risk",
        severity: "info",
        entityType: "ITComponent",
        entityId: itc.id,
        entityName: itc.name,
        message: `Orphaned IT component: not linked to any application or integration`,
      });
    }
  }

  // TR6: Technology Diversity per Capability — apps serving same capability share zero IT components
  const capToAppItcs = new Map<
    string,
    Array<{ appId: string; appName: string; itcIds: Set<string> }>
  >();
  for (const app of apps) {
    const appItcIds = new Set(
      (app.itComponents ?? []).map((r) => r.itComponentId),
    );
    for (const capRef of app.capabilities ?? []) {
      const list = capToAppItcs.get(capRef.capabilityId) ?? [];
      list.push({ appId: app.id, appName: app.name, itcIds: appItcIds });
      capToAppItcs.set(capRef.capabilityId, list);
    }
  }
  for (const [capId, capApps] of capToAppItcs) {
    if (capApps.length < 2) continue;
    // Check if all pairs share zero IT components
    const allItcIds = capApps.flatMap((a) => [...a.itcIds]);
    if (allItcIds.length === 0) continue; // no ITCs mapped at all
    const sharedCount = new Map<string, number>();
    for (const id of allItcIds)
      sharedCount.set(id, (sharedCount.get(id) ?? 0) + 1);
    const hasShared = [...sharedCount.values()].some((c) => c > 1);
    if (!hasShared) {
      findings.push({
        checkId: "TR6",
        category: "technology_risk",
        severity: "info",
        entityType: "BusinessCapability",
        entityId: capId,
        entityName: capNameMap.get(capId),
        message: `Technology diversity: ${capApps.length} apps serving this capability share zero IT components (${capApps.map((a) => a.appName).join(", ")})`,
      });
    }
  }
}

// === Initiative Alignment ===

function checkInitiativeAlignment(ws: WS, findings: AnalysisFinding[]) {
  const apps = ws.applications ?? [];
  const initiatives = ws.initiatives ?? [];
  const appNameMap = new Map(apps.map((a) => [a.id, a.name]));
  const todayStr = new Date().toISOString().split("T")[0];

  // Build app-to-initiative impacts map
  const appInitiatives = new Map<
    string,
    Array<{
      initId: string;
      initName: string;
      impactType: string;
      startDate?: string;
      endDate?: string;
    }>
  >();
  for (const init of initiatives) {
    for (const impact of init.applicationImpacts ?? []) {
      const list = appInitiatives.get(impact.applicationId) ?? [];
      list.push({
        initId: init.id,
        initName: init.name,
        impactType: impact.impactType,
        startDate: init.startDate,
        endDate: init.endDate,
      });
      appInitiatives.set(impact.applicationId, list);
    }
  }

  // IA1: Eliminate app without initiative (remove impact)
  for (const app of apps) {
    if (app.timeClassification !== TimeClassification.ELIMINATE) continue;
    const inits = appInitiatives.get(app.id) ?? [];
    const hasRemove = inits.some((i) => i.impactType === ImpactType.REMOVE);
    if (!hasRemove) {
      findings.push({
        checkId: "IA1",
        category: "initiative_alignment",
        severity: "warning",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Eliminate app without any initiative with "Remove" impact`,
      });
    }
  }

  // IA2: Migrate app without initiative (modify/remove impact)
  for (const app of apps) {
    if (app.timeClassification !== TimeClassification.MIGRATE) continue;
    const inits = appInitiatives.get(app.id) ?? [];
    const hasModifyOrRemove = inits.some(
      (i) =>
        i.impactType === ImpactType.MODIFY ||
        i.impactType === ImpactType.REMOVE,
    );
    if (!hasModifyOrRemove) {
      findings.push({
        checkId: "IA2",
        category: "initiative_alignment",
        severity: "warning",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Migrate app without any initiative with "Modify" or "Remove" impact`,
      });
    }
  }

  // IA3: Invest app with remove impact — contradictory
  for (const app of apps) {
    if (app.timeClassification !== TimeClassification.INVEST) continue;
    const inits = appInitiatives.get(app.id) ?? [];
    const removeInits = inits.filter((i) => i.impactType === ImpactType.REMOVE);
    for (const init of removeInits) {
      findings.push({
        checkId: "IA3",
        category: "initiative_alignment",
        severity: "warning",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Invest app has contradictory "Remove" impact from initiative "${init.initName}"`,
        relatedEntities: [
          {
            entityType: "Initiative",
            entityId: init.initId,
            entityName: init.initName,
            role: "contradictory_initiative",
          },
        ],
      });
    }
  }

  // IA4: Stale initiative — status planned/active (in_progress), endDate in past
  for (const init of initiatives) {
    if (
      !init.status ||
      (init.status !== InitiativeStatus.PLANNED &&
        init.status !== InitiativeStatus.ACTIVE)
    )
      continue;
    if (init.endDate && init.endDate < todayStr) {
      findings.push({
        checkId: "IA4",
        category: "initiative_alignment",
        severity: "info",
        entityType: "Initiative",
        entityId: init.id,
        entityName: init.name,
        message: `Stale initiative: status "${init.status}" but end date ${init.endDate} is in the past`,
      });
    }
  }

  // IA5: Initiative without application impacts
  for (const init of initiatives) {
    if (!init.applicationImpacts || init.applicationImpacts.length === 0) {
      findings.push({
        checkId: "IA5",
        category: "initiative_alignment",
        severity: "info",
        entityType: "Initiative",
        entityId: init.id,
        entityName: init.name,
        message: `Initiative has no application impacts defined`,
      });
    }
  }

  // IA6: Overlapping initiatives on same app (date ranges overlap)
  for (const [appId, inits] of appInitiatives) {
    if (inits.length < 2) continue;
    for (let i = 0; i < inits.length; i++) {
      for (let j = i + 1; j < inits.length; j++) {
        const a = inits[i];
        const b = inits[j];
        if (!a.startDate || !a.endDate || !b.startDate || !b.endDate) continue;
        // Overlap: a.start <= b.end AND b.start <= a.end
        if (a.startDate <= b.endDate && b.startDate <= a.endDate) {
          findings.push({
            checkId: "IA6",
            category: "initiative_alignment",
            severity: "warning",
            entityType: "Application",
            entityId: appId,
            entityName: appNameMap.get(appId),
            message: `Overlapping initiatives on same app: "${a.initName}" (${a.startDate}–${a.endDate}) and "${b.initName}" (${b.startDate}–${b.endDate})`,
            relatedEntities: [
              {
                entityType: "Initiative",
                entityId: a.initId,
                entityName: a.initName,
                role: "overlapping_initiative",
              },
              {
                entityType: "Initiative",
                entityId: b.initId,
                entityName: b.initName,
                role: "overlapping_initiative",
              },
            ],
          });
        }
      }
    }
  }

  // IA7: Decommission initiative (remove impact) but app has integrations not addressed by same initiative
  const integrations = ws.integrations ?? [];
  for (const init of initiatives) {
    const removeAppIds = (init.applicationImpacts ?? [])
      .filter((i) => i.impactType === ImpactType.REMOVE)
      .map((i) => i.applicationId);
    const allImpactedAppIds = new Set(
      (init.applicationImpacts ?? []).map((i) => i.applicationId),
    );
    for (const appId of removeAppIds) {
      const unaddressed: RelatedEntity[] = [];
      for (const int of integrations) {
        if (
          int.sourceApplicationId === appId &&
          !allImpactedAppIds.has(int.targetApplicationId)
        ) {
          unaddressed.push({
            entityType: "Integration",
            entityId: int.id,
            entityName: int.name,
            role: "unaddressed_integration",
          });
        }
        if (
          int.targetApplicationId === appId &&
          !allImpactedAppIds.has(int.sourceApplicationId)
        ) {
          unaddressed.push({
            entityType: "Integration",
            entityId: int.id,
            entityName: int.name,
            role: "unaddressed_integration",
          });
        }
      }
      if (unaddressed.length > 0) {
        findings.push({
          checkId: "IA7",
          category: "initiative_alignment",
          severity: "warning",
          entityType: "Application",
          entityId: appId,
          entityName: appNameMap.get(appId),
          message: `App has "Remove" impact from initiative "${init.name}" but ${unaddressed.length} integration(s) connect to apps not addressed by the same initiative`,
          relatedEntities: [
            {
              entityType: "Initiative",
              entityId: init.id,
              entityName: init.name,
              role: "decommission_initiative",
            },
            ...unaddressed,
          ],
        });
      }
    }
  }

  // IA8: Completed initiative with remove impact, but app still active
  for (const init of initiatives) {
    if (init.status !== InitiativeStatus.COMPLETED) continue;
    for (const impact of init.applicationImpacts ?? []) {
      if (impact.impactType !== ImpactType.REMOVE) continue;
      const app = apps.find((a) => a.id === impact.applicationId);
      if (!app) continue;
      const status = getLifecycleStatus(app);
      if (
        status === LifecycleStatus.ACTIVE ||
        status === LifecycleStatus.PHASE_IN ||
        status === LifecycleStatus.UNKNOWN
      ) {
        findings.push({
          checkId: "IA8",
          category: "initiative_alignment",
          severity: "info",
          entityType: "Application",
          entityId: app.id,
          entityName: app.name,
          message: `Completed initiative "${init.name}" had "Remove" impact, but app is still ${status}`,
          relatedEntities: [
            {
              entityType: "Initiative",
              entityId: init.id,
              entityName: init.name,
              role: "completed_initiative",
            },
          ],
        });
      }
    }
  }
}

// === Organizational Coverage ===

function checkOrganizationalCoverage(ws: WS, findings: AnalysisFinding[]) {
  const OWNERSHIP_CONCENTRATION_THRESHOLD = 10;

  const apps = ws.applications ?? [];
  const orgs = ws.organizations ?? [];
  const appNameMap = new Map(apps.map((a) => [a.id, a.name]));

  // OC1: Active org without applications
  const orgsWithApps = new Set(apps.map((a) => a.organizationId));
  for (const org of orgs) {
    if (org.status === EntityStatus.ARCHIVED) continue;
    if (!orgsWithApps.has(org.id)) {
      findings.push({
        checkId: "OC1",
        category: "organizational_coverage",
        severity: "info",
        entityType: "Organization",
        entityId: org.id,
        entityName: org.name,
        message: `Active organization has no applications`,
      });
    }
  }

  // OC2: Ownership concentration — one user owns >10 apps
  const ownerApps = new Map<string, string[]>();
  for (const app of apps) {
    if (!app.ownerUserId) continue;
    const list = ownerApps.get(app.ownerUserId) ?? [];
    list.push(app.id);
    ownerApps.set(app.ownerUserId, list);
  }
  for (const [userId, appIds] of ownerApps) {
    if (appIds.length > OWNERSHIP_CONCENTRATION_THRESHOLD) {
      findings.push({
        checkId: "OC2",
        category: "organizational_coverage",
        severity: "warning",
        message: `Ownership concentration: user ${userId} owns ${appIds.length} applications (>${OWNERSHIP_CONCENTRATION_THRESHOLD})`,
        relatedEntities: appIds.map((id) => ({
          entityType: "Application",
          entityId: id,
          entityName: appNameMap.get(id),
          role: "owned_app",
        })),
      });
    }
  }

  // OC4: Org losing all active apps (all apps phase_out/EOL)
  const orgAppStatuses = new Map<string, LifecycleStatusType[]>();
  for (const app of apps) {
    const status = getLifecycleStatus(app);
    const list = orgAppStatuses.get(app.organizationId) ?? [];
    list.push(status);
    orgAppStatuses.set(app.organizationId, list);
  }
  for (const [orgId, statuses] of orgAppStatuses) {
    if (statuses.length === 0) continue;
    const allRetiring = statuses.every(
      (s) =>
        s === LifecycleStatus.PHASE_OUT || s === LifecycleStatus.END_OF_LIFE,
    );
    if (allRetiring) {
      const org = orgs.find((o) => o.id === orgId);
      findings.push({
        checkId: "OC4",
        category: "organizational_coverage",
        severity: "warning",
        entityType: "Organization",
        entityId: orgId,
        entityName: org?.name,
        message: `Organization losing all active apps: all ${statuses.length} applications are in phase-out or end-of-life`,
      });
    }
  }

  // OC5: Cross-org integration (source app org != target app org)
  const appOrgMap = new Map(apps.map((a) => [a.id, a.organizationId]));
  const orgNameMap = new Map(orgs.map((o) => [o.id, o.name]));
  for (const int of ws.integrations ?? []) {
    const srcOrg = appOrgMap.get(int.sourceApplicationId);
    const tgtOrg = appOrgMap.get(int.targetApplicationId);
    if (srcOrg && tgtOrg && srcOrg !== tgtOrg) {
      findings.push({
        checkId: "OC5",
        category: "organizational_coverage",
        severity: "info",
        entityType: "Integration",
        entityId: int.id,
        entityName: int.name,
        message: `Cross-org integration: source org "${orgNameMap.get(srcOrg) ?? srcOrg}" != target org "${orgNameMap.get(tgtOrg) ?? tgtOrg}"`,
        relatedEntities: [
          {
            entityType: "Organization",
            entityId: srcOrg,
            entityName: orgNameMap.get(srcOrg),
            role: "source_org",
          },
          {
            entityType: "Organization",
            entityId: tgtOrg,
            entityName: orgNameMap.get(tgtOrg),
            role: "target_org",
          },
        ],
      });
    }
  }
}

// === Cross-Mapping Consistency ===

function checkCrossMappingConsistency(ws: WS, findings: AnalysisFinding[]) {
  const apps = ws.applications ?? [];
  const dataObjects = ws.dataObjects ?? [];
  const doMap = new Map(dataObjects.map((d) => [d.id, d]));
  const capNameMap = new Map(
    (ws.businessCapabilities ?? []).map((c) => [c.id, c.name]),
  );
  const orgNameMap = new Map(
    (ws.organizations ?? []).map((o) => [o.id, o.name]),
  );
  const appOrgMap = new Map(apps.map((a) => [a.id, a.organizationId]));

  // CM1: App serves capability X, uses data object A, but A.capabilityIds doesn't include X
  // Only flag if dataObject.capabilityIds is non-empty
  for (const app of apps) {
    const appCapIds = new Set(
      (app.capabilities ?? []).map((c) => c.capabilityId),
    );
    for (const doRef of app.dataObjects ?? []) {
      const dobj = doMap.get(doRef.dataObjectId);
      if (!dobj || !dobj.capabilityIds || dobj.capabilityIds.length === 0)
        continue;
      const doCapIds = new Set(dobj.capabilityIds);
      for (const capId of appCapIds) {
        if (!doCapIds.has(capId)) {
          findings.push({
            checkId: "CM1",
            category: "cross_mapping_consistency",
            severity: "warning",
            entityType: "Application",
            entityId: app.id,
            entityName: app.name,
            message: `App serves capability "${capNameMap.get(capId) ?? capId}" and uses data object "${dobj.name}", but data object's capabilityIds don't include this capability`,
            relatedEntities: [
              {
                entityType: "DataObject",
                entityId: dobj.id,
                entityName: dobj.name,
                role: "data_object",
              },
              {
                entityType: "BusinessCapability",
                entityId: capId,
                entityName: capNameMap.get(capId),
                role: "capability",
              },
            ],
          });
        }
      }
    }
  }

  // CM2: Data object org != app org (cross-org data usage)
  for (const app of apps) {
    for (const doRef of app.dataObjects ?? []) {
      const dobj = doMap.get(doRef.dataObjectId);
      if (!dobj) continue;
      if (dobj.organizationId !== app.organizationId) {
        findings.push({
          checkId: "CM2",
          category: "cross_mapping_consistency",
          severity: "info",
          entityType: "Application",
          entityId: app.id,
          entityName: app.name,
          message: `Uses data object "${dobj.name}" from different org "${orgNameMap.get(dobj.organizationId) ?? dobj.organizationId}"`,
          relatedEntities: [
            {
              entityType: "DataObject",
              entityId: dobj.id,
              entityName: dobj.name,
              role: "cross_org_data_object",
            },
          ],
        });
      }
    }
  }

  // CM3: IT component org != app org
  const itcMap = new Map((ws.itComponents ?? []).map((i) => [i.id, i]));
  for (const app of apps) {
    for (const itcRef of app.itComponents ?? []) {
      const itc = itcMap.get(itcRef.itComponentId);
      if (!itc || !itc.organizationId) continue;
      if (itc.organizationId !== app.organizationId) {
        findings.push({
          checkId: "CM3",
          category: "cross_mapping_consistency",
          severity: "info",
          entityType: "Application",
          entityId: app.id,
          entityName: app.name,
          message: `Uses IT component "${itc.name}" from different org "${orgNameMap.get(itc.organizationId) ?? itc.organizationId}"`,
          relatedEntities: [
            {
              entityType: "ITComponent",
              entityId: itc.id,
              entityName: itc.name,
              role: "cross_org_component",
            },
          ],
        });
      }
    }
  }
}

// === Redundancy & Rationalization ===

function checkRedundancy(ws: WS, findings: AnalysisFinding[]) {
  const LEAF_CAP_APP_THRESHOLD = 3;

  const apps = ws.applications ?? [];
  const caps = ws.businessCapabilities ?? [];
  const dataObjects = ws.dataObjects ?? [];
  const appNameMap = new Map(apps.map((a) => [a.id, a.name]));
  const capNameMap = new Map(caps.map((c) => [c.id, c.name]));

  // Determine leaf capabilities (no other capability has parentId == this id)
  const parentIds = new Set(
    caps.filter((c) => c.parentId).map((c) => c.parentId!),
  );
  const leafCapIds = new Set(
    caps.filter((c) => !parentIds.has(c.id)).map((c) => c.id),
  );

  // Build capability-to-active-apps map
  const capToActiveApps = new Map<
    string,
    Array<{ id: string; name: string; subtype?: string; time?: string }>
  >();
  for (const app of apps) {
    const status = getLifecycleStatus(app);
    if (
      status !== LifecycleStatus.ACTIVE &&
      status !== LifecycleStatus.PHASE_IN &&
      status !== LifecycleStatus.UNKNOWN
    )
      continue;
    for (const capRef of app.capabilities ?? []) {
      const list = capToActiveApps.get(capRef.capabilityId) ?? [];
      list.push({
        id: app.id,
        name: app.name,
        subtype: app.subtype,
        time: app.timeClassification,
      });
      capToActiveApps.set(capRef.capabilityId, list);
    }
  }

  // RR1: Leaf capability served by 3+ active apps
  for (const capId of leafCapIds) {
    const capApps = capToActiveApps.get(capId) ?? [];
    if (capApps.length >= LEAF_CAP_APP_THRESHOLD) {
      findings.push({
        checkId: "RR1",
        category: "redundancy",
        severity: "info",
        entityType: "BusinessCapability",
        entityId: capId,
        entityName: capNameMap.get(capId),
        message: `Leaf capability served by ${capApps.length} active apps (potential redundancy): ${capApps.map((a) => a.name).join(", ")}`,
        relatedEntities: capApps.map((a) => ({
          entityType: "Application",
          entityId: a.id,
          entityName: a.name,
          role: "redundant_app",
        })),
      });
    }
  }

  // RR2: Same capability, same subtype, 2+ active apps
  for (const [capId, capApps] of capToActiveApps) {
    if (capApps.length < 2) continue;
    const subtypeGroups = new Map<
      string,
      Array<{ id: string; name: string }>
    >();
    for (const app of capApps) {
      if (!app.subtype) continue;
      const list = subtypeGroups.get(app.subtype) ?? [];
      list.push({ id: app.id, name: app.name });
      subtypeGroups.set(app.subtype, list);
    }
    for (const [subtype, groupApps] of subtypeGroups) {
      if (groupApps.length >= 2) {
        findings.push({
          checkId: "RR2",
          category: "redundancy",
          severity: "warning",
          entityType: "BusinessCapability",
          entityId: capId,
          entityName: capNameMap.get(capId),
          message: `${groupApps.length} active ${subtype} apps serve same capability: ${groupApps.map((a) => a.name).join(", ")}`,
          relatedEntities: groupApps.map((a) => ({
            entityType: "Application",
            entityId: a.id,
            entityName: a.name,
            role: "duplicate_app",
          })),
        });
      }
    }
  }

  // RR3: Duplicate data object names (case-insensitive)
  const doNameGroups = new Map<string, Array<{ id: string; name: string }>>();
  for (const dobj of dataObjects) {
    const key = dobj.name.toLowerCase();
    const list = doNameGroups.get(key) ?? [];
    list.push({ id: dobj.id, name: dobj.name });
    doNameGroups.set(key, list);
  }
  for (const [, group] of doNameGroups) {
    if (group.length > 1) {
      findings.push({
        checkId: "RR3",
        category: "redundancy",
        severity: "info",
        entityType: "DataObject",
        message: `Duplicate data object names (case-insensitive): ${group.map((d) => `"${d.name}" (${d.id})`).join(", ")}`,
        relatedEntities: group.map((d) => ({
          entityType: "DataObject",
          entityId: d.id,
          entityName: d.name,
          role: "duplicate_name",
        })),
      });
    }
  }

  // RR4: Tolerate app + invest app on same capability (rationalization signal)
  for (const [capId, capApps] of capToActiveApps) {
    const tolerateApps = capApps.filter(
      (a) => a.time === TimeClassification.TOLERATE,
    );
    const investApps = capApps.filter(
      (a) => a.time === TimeClassification.INVEST,
    );
    if (tolerateApps.length > 0 && investApps.length > 0) {
      findings.push({
        checkId: "RR4",
        category: "redundancy",
        severity: "info",
        entityType: "BusinessCapability",
        entityId: capId,
        entityName: capNameMap.get(capId),
        message: `Rationalization signal: tolerate (${tolerateApps.map((a) => a.name).join(", ")}) and invest (${investApps.map((a) => a.name).join(", ")}) apps on same capability`,
        relatedEntities: [
          ...tolerateApps.map((a) => ({
            entityType: "Application",
            entityId: a.id,
            entityName: a.name,
            role: "tolerate_app",
          })),
          ...investApps.map((a) => ({
            entityType: "Application",
            entityId: a.id,
            entityName: a.name,
            role: "invest_app",
          })),
        ],
      });
    }
  }
}

// === Migration Planning ===

function checkMigrationPlanning(ws: WS, findings: AnalysisFinding[]) {
  const apps = ws.applications ?? [];
  const integrations = ws.integrations ?? [];
  const initiatives = ws.initiatives ?? [];
  const appNameMap = new Map(apps.map((a) => [a.id, a.name]));
  const appMap = new Map(apps.map((a) => [a.id, a]));

  // Build source/target integration maps for eliminate apps
  const sourceIntegrations = new Map<
    string,
    Array<{ id: string; name: string; targetId: string }>
  >();
  const targetIntegrations = new Map<
    string,
    Array<{ id: string; name: string; sourceId: string }>
  >();
  for (const int of integrations) {
    const intStatus = getLifecycleStatus(int);
    if (intStatus === LifecycleStatus.END_OF_LIFE) continue;
    const srcList = sourceIntegrations.get(int.sourceApplicationId) ?? [];
    srcList.push({
      id: int.id,
      name: int.name,
      targetId: int.targetApplicationId,
    });
    sourceIntegrations.set(int.sourceApplicationId, srcList);
    const tgtList = targetIntegrations.get(int.targetApplicationId) ?? [];
    tgtList.push({
      id: int.id,
      name: int.name,
      sourceId: int.sourceApplicationId,
    });
    targetIntegrations.set(int.targetApplicationId, tgtList);
  }

  // MP1: Eliminate app is TARGET of active integrations
  for (const app of apps) {
    if (app.timeClassification !== TimeClassification.ELIMINATE) continue;
    const tgtInts = targetIntegrations.get(app.id) ?? [];
    if (tgtInts.length > 0) {
      findings.push({
        checkId: "MP1",
        category: "migration_planning",
        severity: "critical",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Eliminate app is target of ${tgtInts.length} active integration(s): ${tgtInts.map((i) => i.name).join(", ")}`,
        relatedEntities: tgtInts.map((i) => ({
          entityType: "Integration",
          entityId: i.id,
          entityName: i.name,
          role: "inbound_integration",
        })),
      });
    }
  }

  // MP2: Eliminate app is SOURCE of active integrations
  for (const app of apps) {
    if (app.timeClassification !== TimeClassification.ELIMINATE) continue;
    const srcInts = sourceIntegrations.get(app.id) ?? [];
    if (srcInts.length > 0) {
      findings.push({
        checkId: "MP2",
        category: "migration_planning",
        severity: "critical",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Eliminate app is source of ${srcInts.length} active integration(s): ${srcInts.map((i) => i.name).join(", ")}`,
        relatedEntities: srcInts.map((i) => ({
          entityType: "Integration",
          entityId: i.id,
          entityName: i.name,
          role: "outbound_integration",
        })),
      });
    }
  }

  // MP3: Mission-critical app marked eliminate
  for (const app of apps) {
    if (
      app.timeClassification === TimeClassification.ELIMINATE &&
      app.businessCriticality === BusinessCriticality.MISSION_CRITICAL
    ) {
      findings.push({
        checkId: "MP3",
        category: "migration_planning",
        severity: "critical",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Mission-critical application marked as "Eliminate" — high risk`,
      });
    }
  }

  // MP4: Consolidation initiative targets a tolerate/eliminate app
  for (const init of initiatives) {
    if (init.type !== InitiativeType.CONSOLIDATION) continue;
    for (const impact of init.applicationImpacts ?? []) {
      const app = appMap.get(impact.applicationId);
      if (!app) continue;
      if (
        app.timeClassification === TimeClassification.TOLERATE ||
        app.timeClassification === TimeClassification.ELIMINATE
      ) {
        findings.push({
          checkId: "MP4",
          category: "migration_planning",
          severity: "warning",
          entityType: "Initiative",
          entityId: init.id,
          entityName: init.name,
          message: `Consolidation initiative targets ${app.timeClassification} app "${app.name}"`,
          relatedEntities: [
            {
              entityType: "Application",
              entityId: app.id,
              entityName: app.name,
              role: "consolidation_target",
            },
          ],
        });
      }
    }
  }
}

// === Data Governance ===

function checkDataGovernance(ws: WS, findings: AnalysisFinding[]) {
  const PCI_SCOPE_THRESHOLD = 3;

  const apps = ws.applications ?? [];
  const dataObjects = ws.dataObjects ?? [];
  const integrations = ws.integrations ?? [];
  const doMap = new Map(dataObjects.map((d) => [d.id, d]));
  const appNameMap = new Map(apps.map((a) => [a.id, a.name]));
  const appMap = new Map(apps.map((a) => [a.id, a]));

  // Build set of all data objects referenced by any app
  const allAppDoIds = new Set<string>();
  for (const app of apps) {
    for (const doRef of app.dataObjects ?? []) {
      allAppDoIds.add(doRef.dataObjectId);
    }
  }

  // DG1: Data object not referenced by ANY app (unmanaged)
  // Note: DF7 already covers sensitive data specifically. DG1 covers ALL unmapped data objects.
  for (const dobj of dataObjects) {
    if (!allAppDoIds.has(dobj.id)) {
      // Don't flag if already flagged by DF7 (sensitive data specifically)
      if (
        dobj.classification === DataClassification.CONFIDENTIAL ||
        dobj.classification === DataClassification.RESTRICTED
      )
        continue;
      findings.push({
        checkId: "DG1",
        category: "data_governance",
        severity: "warning",
        entityType: "DataObject",
        entityId: dobj.id,
        entityName: dobj.name,
        message: `Data object not referenced by any application (unmanaged data)`,
      });
    }
  }

  // DG2: Sensitive data through unauthenticated integration (auth=null/undefined — CR1 catches auth=None)
  for (const int of integrations) {
    // Skip if authentication is explicitly set (including None — CR1 handles that case)
    if (int.authentication) continue;
    // auth is null/undefined — not configured at all
    const sensitiveDoNames: string[] = [];
    for (const doRef of int.dataObjects ?? []) {
      const dobj = doMap.get(doRef.dataObjectId);
      if (
        dobj &&
        (dobj.classification === DataClassification.CONFIDENTIAL ||
          dobj.classification === DataClassification.RESTRICTED ||
          dobj.piiFlag ||
          dobj.pciFlag)
      ) {
        sensitiveDoNames.push(dobj.name);
      }
    }
    if (sensitiveDoNames.length > 0) {
      findings.push({
        checkId: "DG2",
        category: "data_governance",
        severity: "critical",
        entityType: "Integration",
        entityId: int.id,
        entityName: int.name,
        message: `Sensitive data (${sensitiveDoNames.join(", ")}) transmitted through integration with no authentication configured`,
      });
    }
  }

  // DG4: Restricted/PCI data on tolerate/eliminate apps
  for (const app of apps) {
    if (
      app.timeClassification !== TimeClassification.TOLERATE &&
      app.timeClassification !== TimeClassification.ELIMINATE
    )
      continue;
    const sensitiveObjects: RelatedEntity[] = [];
    for (const doRef of app.dataObjects ?? []) {
      const dobj = doMap.get(doRef.dataObjectId);
      if (
        dobj &&
        (dobj.classification === DataClassification.RESTRICTED || dobj.pciFlag)
      ) {
        sensitiveObjects.push({
          entityType: "DataObject",
          entityId: dobj.id,
          entityName: dobj.name,
          role: "sensitive_data",
        });
      }
    }
    if (sensitiveObjects.length > 0) {
      findings.push({
        checkId: "DG4",
        category: "data_governance",
        severity: "warning",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `${app.timeClassification} app handles ${sensitiveObjects.length} restricted/PCI data object(s): ${sensitiveObjects.map((d) => d.entityName).join(", ")}`,
        relatedEntities: sensitiveObjects,
      });
    }
  }

  // DG6: PCI data object referenced by >3 apps (scope sprawl)
  const pciDoAppCount = new Map<string, string[]>();
  for (const app of apps) {
    for (const doRef of app.dataObjects ?? []) {
      const dobj = doMap.get(doRef.dataObjectId);
      if (dobj?.pciFlag) {
        const list = pciDoAppCount.get(dobj.id) ?? [];
        list.push(app.id);
        pciDoAppCount.set(dobj.id, list);
      }
    }
  }
  for (const [doId, appIds] of pciDoAppCount) {
    if (appIds.length > PCI_SCOPE_THRESHOLD) {
      const dobj = doMap.get(doId);
      findings.push({
        checkId: "DG6",
        category: "data_governance",
        severity: "warning",
        entityType: "DataObject",
        entityId: doId,
        entityName: dobj?.name,
        message: `PCI data object referenced by ${appIds.length} apps (>${PCI_SCOPE_THRESHOLD}) — PCI scope sprawl: ${appIds.map((id) => appNameMap.get(id) ?? id).join(", ")}`,
        relatedEntities: appIds.map((id) => ({
          entityType: "Application",
          entityId: id,
          entityName: appNameMap.get(id),
          role: "pci_scope_app",
        })),
      });
    }
  }
}

// === Complexity Indicators ===

function checkComplexity(ws: WS, findings: AnalysisFinding[]) {
  const GOD_APP_CAP_THRESHOLD = 10;
  const FAN_OUT_THRESHOLD = 8;
  const FAN_IN_THRESHOLD = 8;
  const ORG_DEPTH_THRESHOLD = 5;
  const CAP_DEPTH_THRESHOLD = 4;
  const APP_DATA_OBJECTS_THRESHOLD = 15;

  const apps = ws.applications ?? [];
  const integrations = ws.integrations ?? [];
  const orgs = ws.organizations ?? [];
  const caps = ws.businessCapabilities ?? [];
  const appNameMap = new Map(apps.map((a) => [a.id, a.name]));

  // CX1: God app — serves >10 capabilities
  for (const app of apps) {
    const capCount = (app.capabilities ?? []).length;
    if (capCount > GOD_APP_CAP_THRESHOLD) {
      findings.push({
        checkId: "CX1",
        category: "complexity",
        severity: "warning",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `God app: serves ${capCount} capabilities (>${GOD_APP_CAP_THRESHOLD})`,
      });
    }
  }

  // CX2: Integration fan-out — app is source of >8 integrations
  const sourceCount = new Map<string, number>();
  const targetCount = new Map<string, number>();
  for (const int of integrations) {
    sourceCount.set(
      int.sourceApplicationId,
      (sourceCount.get(int.sourceApplicationId) ?? 0) + 1,
    );
    targetCount.set(
      int.targetApplicationId,
      (targetCount.get(int.targetApplicationId) ?? 0) + 1,
    );
  }
  for (const [appId, count] of sourceCount) {
    if (count > FAN_OUT_THRESHOLD) {
      findings.push({
        checkId: "CX2",
        category: "complexity",
        severity: "warning",
        entityType: "Application",
        entityId: appId,
        entityName: appNameMap.get(appId),
        message: `Integration fan-out: source of ${count} integrations (>${FAN_OUT_THRESHOLD})`,
      });
    }
  }

  // CX3: Integration fan-in — app is target of >8 integrations
  for (const [appId, count] of targetCount) {
    if (count > FAN_IN_THRESHOLD) {
      findings.push({
        checkId: "CX3",
        category: "complexity",
        severity: "info",
        entityType: "Application",
        entityId: appId,
        entityName: appNameMap.get(appId),
        message: `Integration fan-in: target of ${count} integrations (>${FAN_IN_THRESHOLD})`,
      });
    }
  }

  // CX4: Deep hierarchy — org >5 levels, capability >4 levels
  const computeDepths = (
    items: Array<{ id: string; parentId?: string }>,
    maxThreshold: number,
    entityType: string,
    entityNameMap: Map<string, string>,
  ) => {
    const parentMap = new Map<string, string | undefined>();
    for (const item of items) parentMap.set(item.id, item.parentId);
    for (const item of items) {
      let depth = 1;
      let current: string | undefined = item.parentId;
      const visited = new Set<string>([item.id]);
      while (current && !visited.has(current)) {
        visited.add(current);
        depth++;
        current = parentMap.get(current);
      }
      if (depth > maxThreshold) {
        findings.push({
          checkId: "CX4",
          category: "complexity",
          severity: "info",
          entityType,
          entityId: item.id,
          entityName: entityNameMap.get(item.id),
          message: `Deep hierarchy: ${depth} levels (>${maxThreshold})`,
        });
      }
    }
  };
  const orgNameMap = new Map(orgs.map((o) => [o.id, o.name]));
  const capNameMap = new Map(caps.map((c) => [c.id, c.name]));
  computeDepths(orgs, ORG_DEPTH_THRESHOLD, "Organization", orgNameMap);
  computeDepths(caps, CAP_DEPTH_THRESHOLD, "BusinessCapability", capNameMap);

  // CX5: App with >15 data objects
  for (const app of apps) {
    const doCount = (app.dataObjects ?? []).length;
    if (doCount > APP_DATA_OBJECTS_THRESHOLD) {
      findings.push({
        checkId: "CX5",
        category: "complexity",
        severity: "info",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `App has ${doCount} data objects (>${APP_DATA_OBJECTS_THRESHOLD})`,
      });
    }
  }

  // CX6: Circular integration chain (cycle detection via DFS)
  // Build adjacency list: app -> set of apps it integrates to (source -> target)
  const adjacency = new Map<string, Set<string>>();
  for (const int of integrations) {
    const targets = adjacency.get(int.sourceApplicationId) ?? new Set<string>();
    targets.add(int.targetApplicationId);
    adjacency.set(int.sourceApplicationId, targets);
  }
  const visited = new Set<string>();
  const inStack = new Set<string>();
  const reportedCycles = new Set<string>();

  const dfs = (nodeId: string): void => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    inStack.add(nodeId);
    for (const neighbor of adjacency.get(nodeId) ?? []) {
      if (inStack.has(neighbor)) {
        // Found cycle — report it (sort to deduplicate)
        const cycleKey = [nodeId, neighbor].sort().join("→");
        if (!reportedCycles.has(cycleKey)) {
          reportedCycles.add(cycleKey);
          findings.push({
            checkId: "CX6",
            category: "complexity",
            severity: "warning",
            message: `Circular integration chain detected: ${appNameMap.get(nodeId) ?? nodeId} → ${appNameMap.get(neighbor) ?? neighbor} → ... → ${appNameMap.get(nodeId) ?? nodeId}`,
            relatedEntities: [
              {
                entityType: "Application",
                entityId: nodeId,
                entityName: appNameMap.get(nodeId),
                role: "cycle_node",
              },
              {
                entityType: "Application",
                entityId: neighbor,
                entityName: appNameMap.get(neighbor),
                role: "cycle_node",
              },
            ],
          });
        }
      } else if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
    inStack.delete(nodeId);
  };
  for (const appId of adjacency.keys()) {
    if (!visited.has(appId)) dfs(appId);
  }
}

// === Strategic Alignment ===

function checkStrategicAlignment(ws: WS, findings: AnalysisFinding[]) {
  const apps = ws.applications ?? [];
  const caps = ws.businessCapabilities ?? [];
  const initiatives = ws.initiatives ?? [];
  const capNameMap = new Map(caps.map((c) => [c.id, c.name]));
  const appNameMap = new Map(apps.map((a) => [a.id, a.name]));

  // Determine leaf capabilities
  const parentIds = new Set(
    caps.filter((c) => c.parentId).map((c) => c.parentId!),
  );
  const leafCapIds = new Set(
    caps.filter((c) => !parentIds.has(c.id)).map((c) => c.id),
  );

  // Build capability-to-apps map
  const capToApps = new Map<
    string,
    Array<{
      id: string;
      name: string;
      functionalFit?: string;
      technicalFit?: string;
      time?: string;
    }>
  >();
  for (const app of apps) {
    for (const capRef of app.capabilities ?? []) {
      const list = capToApps.get(capRef.capabilityId) ?? [];
      list.push({
        id: app.id,
        name: app.name,
        functionalFit: app.functionalFit,
        technicalFit: app.technicalFit,
        time: app.timeClassification,
      });
      capToApps.set(capRef.capabilityId, list);
    }
  }

  // Build app-to-initiative impacts for checking initiative coverage
  const appHasInitiative = new Set<string>();
  for (const init of initiatives) {
    for (const impact of init.applicationImpacts ?? []) {
      appHasInitiative.add(impact.applicationId);
    }
  }

  // SA1: Invest app without any lifecycle dates
  for (const app of apps) {
    if (app.timeClassification !== TimeClassification.INVEST) continue;
    const hasAnyDate =
      app.lifecyclePlanDate ||
      app.lifecyclePhaseInDate ||
      app.lifecycleActiveDate ||
      app.lifecyclePhaseOutDate ||
      app.lifecycleEndOfLifeDate;
    if (!hasAnyDate) {
      findings.push({
        checkId: "SA1",
        category: "strategic_alignment",
        severity: "warning",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Invest app has no lifecycle dates — investment not tracked`,
      });
    }
  }

  // SA2: Tolerate app with no phase-out date and no initiative
  for (const app of apps) {
    if (app.timeClassification !== TimeClassification.TOLERATE) continue;
    if (!app.lifecyclePhaseOutDate && !appHasInitiative.has(app.id)) {
      findings.push({
        checkId: "SA2",
        category: "strategic_alignment",
        severity: "info",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Tolerate app with no phase-out date and no initiative — no exit strategy`,
      });
    }
  }

  // SA3: Critical/high capability served only by insufficient-fit apps
  for (const cap of caps) {
    if (cap.strategicImportance !== StrategicImportance.HIGH) continue;
    const capApps = capToApps.get(cap.id) ?? [];
    if (capApps.length === 0) continue;
    const allInsufficient = capApps.every(
      (a) =>
        a.functionalFit === FitLevel.INSUFFICIENT ||
        a.technicalFit === FitLevel.INSUFFICIENT,
    );
    if (allInsufficient) {
      findings.push({
        checkId: "SA3",
        category: "strategic_alignment",
        severity: "warning",
        entityType: "BusinessCapability",
        entityId: cap.id,
        entityName: cap.name,
        message: `High-importance capability served only by insufficient-fit apps: ${capApps.map((a) => a.name).join(", ")}`,
        relatedEntities: capApps.map((a) => ({
          entityType: "Application",
          entityId: a.id,
          entityName: a.name,
          role: "insufficient_fit_app",
        })),
      });
    }
  }

  // SA4: Low-importance capability with invest apps
  for (const cap of caps) {
    if (cap.strategicImportance !== StrategicImportance.LOW) continue;
    const capApps = capToApps.get(cap.id) ?? [];
    const investApps = capApps.filter(
      (a) => a.time === TimeClassification.INVEST,
    );
    if (investApps.length > 0) {
      findings.push({
        checkId: "SA4",
        category: "strategic_alignment",
        severity: "info",
        entityType: "BusinessCapability",
        entityId: cap.id,
        entityName: cap.name,
        message: `Low-importance capability has invest app(s): ${investApps.map((a) => a.name).join(", ")}`,
        relatedEntities: investApps.map((a) => ({
          entityType: "Application",
          entityId: a.id,
          entityName: a.name,
          role: "invest_app",
        })),
      });
    }
  }

  // SA5: Mission-critical app with insufficient fit
  for (const app of apps) {
    if (app.businessCriticality !== BusinessCriticality.MISSION_CRITICAL)
      continue;
    if (
      app.functionalFit === FitLevel.INSUFFICIENT ||
      app.technicalFit === FitLevel.INSUFFICIENT
    ) {
      const issues: string[] = [];
      if (app.functionalFit === FitLevel.INSUFFICIENT)
        issues.push("functional");
      if (app.technicalFit === FitLevel.INSUFFICIENT) issues.push("technical");
      findings.push({
        checkId: "SA5",
        category: "strategic_alignment",
        severity: "critical",
        entityType: "Application",
        entityId: app.id,
        entityName: app.name,
        message: `Mission-critical app with insufficient ${issues.join(" and ")} fit`,
      });
    }
  }

  // SA6: Leaf capability not served by any app
  for (const capId of leafCapIds) {
    const capApps = capToApps.get(capId) ?? [];
    if (capApps.length === 0) {
      findings.push({
        checkId: "SA6",
        category: "strategic_alignment",
        severity: "info",
        entityType: "BusinessCapability",
        entityId: capId,
        entityName: capNameMap.get(capId),
        message: `Leaf capability not served by any application`,
      });
    }
  }
}
