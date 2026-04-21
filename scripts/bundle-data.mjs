/**
 * Pre-build script: bundles static data into dist/data/ so the published
 * package is self-contained at runtime.
 *
 * 1. Copies ./data/workspace.v1.schema.json → dist/data/
 * 2. Generates dist/data/enums.json (label maps) from ./enums/*.enum.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'dist', 'data');
const enumsSourceDir = path.join(root, 'lib', 'enums');
const dataSourceDir = path.join(root, 'data');

fs.mkdirSync(dataDir, { recursive: true });

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
