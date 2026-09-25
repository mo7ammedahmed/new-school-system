/**
 * Fails when a translation key used in the frontend is missing from either
 * dictionary. A missing key renders as the raw key in the UI (the shell shows
 * "feeStructures.form.title" instead of a label), which is invisible to the
 * type checker and to the route sweep.
 *
 * Run: node scripts/check-i18n.mjs
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const jsRoot = join(root, 'resources', 'js');

const { en } = await import(pathToFileURL(join(jsRoot, 'i18n', 'en.ts')).href);
const { ar } = await import(pathToFileURL(join(jsRoot, 'i18n', 'ar.ts')).href);

const flatten = (obj, prefix = '', out = new Set()) => {
    for (const [key, value] of Object.entries(obj)) {
        const path = prefix ? `${prefix}.${key}` : key;

        if (value && typeof value === 'object') {
            flatten(value, path, out);
        } else {
            out.add(path);
        }
    }

    return out;
};

const enKeys = flatten(en);
const arKeys = flatten(ar);

const files = [];

const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
        const path = join(dir, entry);

        if (statSync(path).isDirectory()) {
            walk(path);
        } else if (path.endsWith('.ts') || path.endsWith('.tsx')) {
            files.push(path);
        }
    }
};

walk(jsRoot);

// Only literal keys are checked. `t(`roles.${value}`)` is dynamic and is
// covered by the dictionaries sharing one shape.
const used = new Map();
const literal = /\bt\(\s*'([A-Za-z0-9_.]+)'/g;

for (const file of files) {
    const source = readFileSync(file, 'utf8');

    for (const match of source.matchAll(literal)) {
        if (!used.has(match[1])) {
            used.set(match[1], file.slice(root.length + 1));
        }
    }
}

const missingEn = [...used].filter(([key]) => !enKeys.has(key));
const missingAr = [...used].filter(([key]) => !arKeys.has(key));
const report = (label, entries) => {
    console.log(`${label}: ${entries.length}`);

    for (const [key, file] of entries) {
        console.log(`  ${key}  <-  ${file}`);
    }
};

console.log(
    `${used.size} literal keys used, ${enKeys.size} en, ${arKeys.size} ar`,
);
report('missing in en', missingEn);
report('missing in ar', missingAr);

if (missingEn.length > 0 || missingAr.length > 0) {
    process.exit(1);
}
