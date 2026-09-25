import { readFileSync, writeFileSync, statSync } from 'node:fs';
import ts from 'typescript';

const logPath = process.argv[2] ?? '.planning/check-latest.log';
const isJson = logPath.endsWith('.json');
const recordsByFile = new Map();

if (isJson) {
    const sourceText = readFileSync(logPath, 'utf16le')
        .replace(/\0/g, '')
        .replace(/^\uFEFF/, '');
    const diagnostics = JSON.parse(sourceText).diagnostics;

    for (const diagnostic of diagnostics) {
        if (diagnostic.code !== 'eslint(no-unused-vars)') {
            continue;
        }

        const name = diagnostic.message.match(/'(.*?)'/)?.[1];
        const span = diagnostic.labels?.[0]?.span;
        if (!name || !span) {
            continue;
        }

        const file = diagnostic.filename.replace(/\\/g, '/');
        const fileRecords = recordsByFile.get(file) ?? [];
        fileRecords.push({
            file,
            line: span.line,
            column: span.column,
            name,
        });
        recordsByFile.set(file, fileRecords);
    }
} else {
    const sourceText = readFileSync(logPath, 'utf16le').replace(/\0/g, '');
    const lines = sourceText.split(/\r?\n/);
    let current = null;

    for (const line of lines) {
        const file = line.match(/,-\[(.+):(\d+):(\d+)\]/);
        const rule = line.match(/!\s*(?:eslint|typescript)\(([^)]+)\):\s*(.+)/);

        if (file && !rule) {
            current = {
                file: file[1].replace(/\\/g, '/'),
                line: Number(file[2]),
                column: Number(file[3]),
            };
            continue;
        }

        if (rule && current) {
            if (rule[1] !== 'no-unused-vars') {
                current = null;
                continue;
            }

            const name = rule[2].match(/'(.*?)'/)?.[1];
            if (!name) {
                current = null;
                continue;
            }

            const fileRecords = recordsByFile.get(current.file) ?? [];
            fileRecords.push({ ...current, name });
            recordsByFile.set(current.file, fileRecords);
            current = null;
        }
    }
}

let updatedFiles = 0;
let applied = 0;

for (const [file, records] of recordsByFile) {
    if (!statSync(file).isFile()) {
        continue;
    }

    const text = readFileSync(file, 'utf8');
    const kind = file.endsWith('.tsx')
        ? ts.ScriptKind.TSX
        : file.endsWith('.ts')
          ? ts.ScriptKind.TS
          : ts.ScriptKind.JS;
    const sourceFile = ts.createSourceFile(
        file,
        text,
        ts.ScriptTarget.Latest,
        true,
        kind,
    );
    const pending = new Set(records.map((record) => JSON.stringify(record)));
    const edits = [];

    const matchesRecord = (node) => {
        const position = sourceFile.getLineAndCharacterOfPosition(
            node.getStart(sourceFile),
        );
        const record = records.find(
            (candidate) =>
                candidate.name === node.getText(sourceFile) &&
                candidate.line === position.line + 1 &&
                candidate.column === position.character + 1,
        );

        if (!record) {
            return null;
        }

        const key = JSON.stringify(record);
        if (!pending.has(key)) {
            return null;
        }

        pending.delete(key);
        return record;
    };

    const addEdit = (start, end, replacement) => {
        edits.push({ start, end, replacement });
    };

    const renameIdentifier = (node, record) => {
        addEdit(node.getStart(sourceFile), node.end, `_${record.name}`);
    };

    const visit = (node) => {
        if (ts.isImportDeclaration(node)) {
            const clause = node.importClause;
            const namedBindings = clause?.namedBindings;

            if (namedBindings && ts.isNamedImports(namedBindings)) {
                const names = namedBindings.elements
                    .map((element) => element.name.text)
                    .filter((name) =>
                        records.some((record) => record.name === name),
                    );

                for (const element of namedBindings.elements) {
                    if (names.includes(element.name.text)) {
                        const position =
                            sourceFile.getLineAndCharacterOfPosition(
                                element.name.getStart(sourceFile),
                            );
                        const record = records.find(
                            (candidate) =>
                                candidate.name === element.name.text &&
                                candidate.line === position.line + 1 &&
                                candidate.column === position.character + 1,
                        );

                        if (record) {
                            pending.delete(JSON.stringify(record));
                        }
                    }
                }

                if (names.length === namedBindings.elements.length) {
                    const lineStart =
                        text.lastIndexOf('\n', node.getStart(sourceFile)) + 1;
                    addEdit(lineStart, Math.min(text.length, node.end + 1), '');
                } else if (names.length > 0) {
                    const raw = text.slice(
                        namedBindings.getStart(sourceFile),
                        namedBindings.end,
                    );
                    const inner = raw.slice(1, -1);
                    const isMultiline = inner.includes('\n');
                    const indent = isMultiline
                        ? (inner
                              .slice(inner.indexOf('\n') + 1)
                              .match(/^\s*/)?.[0] ?? '    ')
                        : ' ';
                    const kept = inner
                        .split(',')
                        .map((part) => part.trim())
                        .filter(
                            (part) =>
                                part.length > 0 &&
                                !names.some((name) =>
                                    new RegExp(`(^|\\s)${name}(\\s|$)`).test(
                                        part,
                                    ),
                                ),
                        );
                    const lineStart =
                        text.lastIndexOf('\n', node.getStart(sourceFile)) + 1;
                    const baseIndent = text.slice(
                        lineStart,
                        node.getStart(sourceFile),
                    );
                    const replacement = isMultiline
                        ? `{\n${indent}${kept.join(`,\n${indent}`)},\n${baseIndent}}`
                        : `{ ${kept.join(', ')} }`;
                    addEdit(
                        namedBindings.getStart(sourceFile),
                        namedBindings.end,
                        replacement,
                    );
                }
            }
        }

        if (ts.isVariableDeclaration(node)) {
            if (ts.isIdentifier(node.name)) {
                const record = matchesRecord(node.name);
                if (record) {
                    renameIdentifier(node.name, record);
                }
            }
        }

        if (ts.isBindingElement(node)) {
            if (ts.isIdentifier(node.name)) {
                const record = matchesRecord(node.name);
                if (record) {
                    renameIdentifier(node.name, record);
                }
            }
        }

        if (ts.isParameter(node)) {
            ts.forEachChild(node.name, (child) => {
                if (ts.isIdentifier(child)) {
                    const record = matchesRecord(child);
                    if (record) {
                        renameIdentifier(child, record);
                    }
                }
            });
        }

        if (
            ts.isTypeAliasDeclaration(node) ||
            ts.isFunctionDeclaration(node) ||
            ts.isClassDeclaration(node)
        ) {
            if (node.name) {
                const record = matchesRecord(node.name);
                if (record) {
                    renameIdentifier(node.name, record);
                }
            }
        }

        ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    if (edits.length === 0) {
        continue;
    }

    edits.sort((a, b) => b.start - a.start);
    let next = text;
    for (const edit of edits) {
        next =
            next.slice(0, edit.start) + edit.replacement + next.slice(edit.end);
    }

    writeFileSync(file, next);
    updatedFiles += 1;
    applied += edits.length;
}

console.log(
    JSON.stringify(
        {
            filesWithEdits: updatedFiles,
            edits: applied,
            pending: pendingTotal(recordsByFile),
        },
        null,
        2,
    ),
);

function pendingTotal(recordsByFile) {
    let total = 0;
    for (const records of recordsByFile.values()) {
        total += records.length;
    }
    return total;
}
