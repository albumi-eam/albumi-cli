/**
 * Pre-build script: bundles static data into dist/data/ so the published
 * package is self-contained at runtime.
 *
 * 1. If ALBUMI_APP_REPO points at the albumi.app repo (or a sibling ../albumi.app
 *    exists), refresh ./data/workspace.v1.schema.json from the canonical source
 *    under albumi.app/web/public/schemas/. Fails on drift if --strict is set.
 * 2. Copies ./data/workspace.v1.schema.json → dist/data/
 * 3. Generates dist/data/enums.json (label maps) from ./enums/*.enum.ts
 *
 * The canonical source of the workspace metalanguage is
 *   albumi.app/web/public/schemas/workspace.v1.schema.json
 * This script bundles it so @albumi/cli works offline and pinned to its CLI version.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'dist', 'data');
const enumsSourceDir = path.join(root, 'lib', 'enums');
const dataSourceDir = path.join(root, 'data');
const strict = process.argv.includes('--strict');

fs.mkdirSync(dataDir, { recursive: true });

// --- 0. Refresh local schema from canonical albumi.app source (if reachable) ---
const canonicalRoot =
  process.env.ALBUMI_APP_REPO ||
  (fs.existsSync(path.resolve(root, '..', 'albumi.app')) ? path.resolve(root, '..', 'albumi.app') : null);
if (canonicalRoot) {
  const canonical = path.join(canonicalRoot, 'web', 'public', 'schemas', 'workspace.v1.schema.json');
  if (fs.existsSync(canonical)) {
    const local = path.join(dataSourceDir, 'workspace.v1.schema.json');
    const a = fs.readFileSync(canonical, 'utf-8');
    const b = fs.existsSync(local) ? fs.readFileSync(local, 'utf-8') : '';
    if (a !== b) {
      if (strict) {
        console.error(
          `Schema drift detected:\n  local:     ${local}\n  canonical: ${canonical}\n` +
          `Fix: run \`npm run build\` in albumi-cli locally, then commit the updated data/workspace.v1.schema.json.`
        );
        process.exit(1);
      }
      fs.writeFileSync(local, a);
      console.log(`Synced schema ← ${canonical}`);
    } else {
      console.log(`Schema in sync with ${canonical}`);
    }
  } else {
    console.warn(`Canonical schema not found at ${canonical} — using local copy.`);
  }
} else {
  console.warn('ALBUMI_APP_REPO not set and no sibling albumi.app found — using local copy.');
}

// --- 1. Copy schema ---
const schemaSource = path.join(dataSourceDir, 'workspace.v1.schema.json');
const schemaDest = path.join(dataDir, 'workspace.v1.schema.json');
fs.copyFileSync(schemaSource, schemaDest);
console.log(`Copied schema → dist/data/workspace.v1.schema.json`);

// --- 2. Generate enums.json from local enums/*.enum.ts ---
const enumData = {};
for (const file of fs.readdirSync(enumsSourceDir).filter(f => f.endsWith('.ts') && f !== 'index.ts')) {
  const content = fs.readFileSync(path.join(enumsSourceDir, file), 'utf-8');
  const labelMatches = content.matchAll(/export\s+const\s+(\w+Label)\s*(?::\s*Record<[^>]+>)?\s*=\s*\{([^}]+)\}/g);
  for (const match of labelMatches) {
    const name = match[1];
    const entries = {};
    const pairs = match[2].matchAll(/\[?\w+\.?(\w+)\]?\s*:\s*['"]([^'"]+)['"]/g);
    for (const pair of pairs) {
      entries[pair[1]] = pair[2];
    }
    if (Object.keys(entries).length > 0) {
      enumData[name] = entries;
    }
  }
}

const enumsJsonPath = path.join(dataDir, 'enums.json');
fs.writeFileSync(enumsJsonPath, JSON.stringify(enumData, null, 2));
console.log(`Generated enums.json (${Object.keys(enumData).length} label maps) → dist/data/enums.json`);
console.log('Bundle complete.');
