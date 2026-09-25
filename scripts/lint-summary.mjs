import { readFileSync } from 'node:fs';

const log = readFileSync('.planning/check.log', 'utf16le').replace(/\0/g, '');
const lines = log.split(/\r?\n/);

const warnings = [];
let current = null;

for (const line of lines) {
    const file = line.match(/,-\[(.+):(\d+):(\d+)\]/);
    const rule = line.match(/!\s*(?:eslint|typescript)\(([^)]+)\):\s*(.+)/);

    if (file && !rule) {
        current = {
            file: file[1],
            line: Number(file[2]),
            column: Number(file[3]),
        };
        continue;
    }

    if (rule && current) {
        warnings.push({ ...current, rule: rule[1], message: rule[2] });
        current = null;
    }
}

const byRule = warnings.reduce((acc, warning) => {
    acc[warning.rule] ??= 0;
    acc[warning.rule] += 1;
    return acc;
}, {});

console.log(
    JSON.stringify({ total: warnings.length, byRule, warnings }, null, 2),
);
