import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
// @ts-ignore — CJS default export resolution issue with Node16 moduleResolution
import Ajv2020 from "ajv/dist/2020.js";
// @ts-ignore — ajv-formats default export typing mismatch
import addFormats from "ajv-formats";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

interface WorkspaceData {
  version?: string;
  organizations?: Array<{ id: string; parentId?: string }>;
  businessCapabilities?: Array<{ id: string; parentId?: string; organizationId: string }>;
  dataObjects?: Array<{
    id: string;
    parentId?: string;
    organizationId: string;
    capabilityIds?: string[];
  }>;
  itComponents?: Array<{ id: string; organizationId: string }>;
  applications?: Array<{
    id: string;
    organizationId: string;
    capabilities?: Array<{ capabilityId: string }>;
    itComponents?: Array<{ itComponentId: string }>;
    dataObjects?: Array<{ dataObjectId: string }>;
    interfaces?: Array<{ id: string }>;
  }>;
  integrations?: Array<{
    id: string;
    sourceApplicationId: string;
    targetApplicationId: string;
    organizationId: string;
    sourceInterfaceId?: string;
    targetInterfaceId?: string;
    middlewares?: Array<{ itComponentId: string }>;
    dataObjects?: Array<{ dataObjectId: string }>;
  }>;
  initiatives?: Array<{
    id: string;
    organizationId: string;
    applicationImpacts?: Array<{ applicationId: string }>;
  }>;
}

/**
 * Standalone workspace JSON validator.
 * Same logic as the API validator but without NestJS dependency.
 *
 * Validation stages:
 * 1. JSON Schema validation (structure, types, required fields, enum values)
 * 2. Referential integrity within JSON (all cross-references resolve)
 * 3. Circular parentId detection (organizations, capabilities, data objects)
 */
export class WorkspaceValidator {
  private readonly schemaPath: string;

  constructor() {
    this.schemaPath = path.resolve(__dirname, "..", "data", "workspace.v1.schema.json");
  }

  // @ts-ignore — Ajv2020 import type resolution
  private compileSchema(): ReturnType<Ajv2020["compile"]> {
    // @ts-ignore — Ajv2020 constructor
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    // @ts-ignore — ajv-formats callable default export
    addFormats(ajv);
    const schema = JSON.parse(fs.readFileSync(this.schemaPath, "utf-8")) as Record<string, unknown>;
    return ajv.compile(schema);
  }

  validateWorkspaceData(data: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    // Stage 1: JSON Schema (re-read from disk each time to pick up changes)
    const validate = this.compileSchema();
    const schemaValid = validate(data);
    if (!schemaValid && validate.errors) {
      for (const err of validate.errors) {
        errors.push({
          path: err.instancePath || "/",
          message: `${err.message || "Schema validation error"}${err.params ? ` (${JSON.stringify(err.params)})` : ""}`,
        });
      }
    }

    if (typeof data !== "object" || data === null) {
      return { valid: false, errors };
    }

    const ws = data as WorkspaceData;

    // Stage 2: Referential integrity
    errors.push(...this.checkReferentialIntegrity(ws));

    // Stage 3: Circular references
    errors.push(...this.checkCircularReferences(ws));

    return { valid: errors.length === 0, errors };
  }

  private checkReferentialIntegrity(ws: WorkspaceData): ValidationError[] {
    const errors: ValidationError[] = [];

    const orgIds = new Set((ws.organizations ?? []).map((o) => o.id));
    const capIds = new Set((ws.businessCapabilities ?? []).map((c) => c.id));
    const doIds = new Set((ws.dataObjects ?? []).map((d) => d.id));
    const itcIds = new Set((ws.itComponents ?? []).map((i) => i.id));
    const appIds = new Set((ws.applications ?? []).map((a) => a.id));

    const interfaceIds = new Set<string>();
    for (const app of ws.applications ?? []) {
      for (const iface of app.interfaces ?? []) {
        interfaceIds.add(iface.id);
      }
    }

    for (const [i, org] of (ws.organizations ?? []).entries()) {
      if (org.parentId && !orgIds.has(org.parentId)) {
        errors.push({ path: `/organizations/${i}/parentId`, message: `References non-existent organization "${org.parentId}"` });
      }
    }

    for (const [i, cap] of (ws.businessCapabilities ?? []).entries()) {
      if (cap.parentId && !capIds.has(cap.parentId)) {
        errors.push({ path: `/businessCapabilities/${i}/parentId`, message: `References non-existent capability "${cap.parentId}"` });
      }
      if (!orgIds.has(cap.organizationId)) {
        errors.push({ path: `/businessCapabilities/${i}/organizationId`, message: `References non-existent organization "${cap.organizationId}"` });
      }
    }

    for (const [i, dobj] of (ws.dataObjects ?? []).entries()) {
      if (dobj.parentId && !doIds.has(dobj.parentId)) {
        errors.push({ path: `/dataObjects/${i}/parentId`, message: `References non-existent data object "${dobj.parentId}"` });
      }
      if (!orgIds.has(dobj.organizationId)) {
        errors.push({ path: `/dataObjects/${i}/organizationId`, message: `References non-existent organization "${dobj.organizationId}"` });
      }
      for (const [j, capId] of (dobj.capabilityIds ?? []).entries()) {
        if (!capIds.has(capId)) {
          errors.push({ path: `/dataObjects/${i}/capabilityIds/${j}`, message: `References non-existent capability "${capId}"` });
        }
      }
    }

    for (const [i, itc] of (ws.itComponents ?? []).entries()) {
      if (!orgIds.has(itc.organizationId)) {
        errors.push({ path: `/itComponents/${i}/organizationId`, message: `References non-existent organization "${itc.organizationId}"` });
      }
    }

    for (const [i, app] of (ws.applications ?? []).entries()) {
      if (!orgIds.has(app.organizationId)) {
        errors.push({ path: `/applications/${i}/organizationId`, message: `References non-existent organization "${app.organizationId}"` });
      }
      for (const [j, cap] of (app.capabilities ?? []).entries()) {
        if (!capIds.has(cap.capabilityId)) {
          errors.push({ path: `/applications/${i}/capabilities/${j}/capabilityId`, message: `References non-existent capability "${cap.capabilityId}"` });
        }
      }
      for (const [j, itc] of (app.itComponents ?? []).entries()) {
        if (!itcIds.has(itc.itComponentId)) {
          errors.push({ path: `/applications/${i}/itComponents/${j}/itComponentId`, message: `References non-existent IT component "${itc.itComponentId}"` });
        }
      }
      for (const [j, doRef] of (app.dataObjects ?? []).entries()) {
        if (!doIds.has(doRef.dataObjectId)) {
          errors.push({ path: `/applications/${i}/dataObjects/${j}/dataObjectId`, message: `References non-existent data object "${doRef.dataObjectId}"` });
        }
      }
    }

    for (const [i, int] of (ws.integrations ?? []).entries()) {
      if (!appIds.has(int.sourceApplicationId)) {
        errors.push({ path: `/integrations/${i}/sourceApplicationId`, message: `References non-existent application "${int.sourceApplicationId}"` });
      }
      if (!appIds.has(int.targetApplicationId)) {
        errors.push({ path: `/integrations/${i}/targetApplicationId`, message: `References non-existent application "${int.targetApplicationId}"` });
      }
      if (!orgIds.has(int.organizationId)) {
        errors.push({ path: `/integrations/${i}/organizationId`, message: `References non-existent organization "${int.organizationId}"` });
      }
      if (int.sourceInterfaceId && !interfaceIds.has(int.sourceInterfaceId)) {
        errors.push({ path: `/integrations/${i}/sourceInterfaceId`, message: `References non-existent interface "${int.sourceInterfaceId}"` });
      }
      if (int.targetInterfaceId && !interfaceIds.has(int.targetInterfaceId)) {
        errors.push({ path: `/integrations/${i}/targetInterfaceId`, message: `References non-existent interface "${int.targetInterfaceId}"` });
      }
      for (const [j, mw] of (int.middlewares ?? []).entries()) {
        if (!itcIds.has(mw.itComponentId)) {
          errors.push({ path: `/integrations/${i}/middlewares/${j}/itComponentId`, message: `References non-existent IT component "${mw.itComponentId}"` });
        }
      }
      for (const [j, doRef] of (int.dataObjects ?? []).entries()) {
        if (!doIds.has(doRef.dataObjectId)) {
          errors.push({ path: `/integrations/${i}/dataObjects/${j}/dataObjectId`, message: `References non-existent data object "${doRef.dataObjectId}"` });
        }
        // Integration operations must be CUD only — read is not valid on integrations
        // (integrations carry data changes, not read operations; reading is a local app operation)
        const ops = (doRef as { operations?: string[] }).operations;
        if (ops && ops.includes("read")) {
          errors.push({
            path: `/integrations/${i}/dataObjects/${j}/operations`,
            message: `Integration operations must be CUD only (create/update/delete). "read" is not valid — integrations carry data changes, not read operations.`,
          });
        }
      }
    }

    for (const [i, init] of (ws.initiatives ?? []).entries()) {
      if (!orgIds.has(init.organizationId)) {
        errors.push({ path: `/initiatives/${i}/organizationId`, message: `References non-existent organization "${init.organizationId}"` });
      }
      for (const [j, impact] of (init.applicationImpacts ?? []).entries()) {
        if (!appIds.has(impact.applicationId)) {
          errors.push({ path: `/initiatives/${i}/applicationImpacts/${j}/applicationId`, message: `References non-existent application "${impact.applicationId}"` });
        }
      }
    }

    return errors;
  }

  private checkCircularReferences(ws: WorkspaceData): ValidationError[] {
    const errors: ValidationError[] = [];

    const check = (items: Array<{ id: string; parentId?: string }>, entityType: string, pathPrefix: string) => {
      const parentMap = new Map<string, string>();
      for (const item of items) {
        if (item.parentId) parentMap.set(item.id, item.parentId);
      }

      const visited = new Set<string>();
      const inStack = new Set<string>();

      for (const item of items) {
        if (visited.has(item.id)) continue;
        const trail: string[] = [];
        let current: string | undefined = item.id;

        while (current && !visited.has(current)) {
          if (inStack.has(current)) {
            errors.push({ path: `/${pathPrefix}`, message: `Circular parentId reference detected involving ${entityType} "${current}"` });
            break;
          }
          inStack.add(current);
          trail.push(current);
          current = parentMap.get(current);
        }

        for (const id of trail) {
          visited.add(id);
          inStack.delete(id);
        }
      }
    };

    check(ws.organizations ?? [], "organization", "organizations");
    check(ws.businessCapabilities ?? [], "capability", "businessCapabilities");
    check(ws.dataObjects ?? [], "data object", "dataObjects");

    return errors;
  }
}
