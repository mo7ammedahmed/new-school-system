# Frontend Install Verification

---

## Section: 2026-09-25T13:09Z - npm ci run (node_modules/ absent -> installed)

### Environment

- node v24.21.0
- npm 11.19.0
- package manager: npm; lockfile present (package-lock.json)

### Pre-existing working-tree state (git status --short)

```
 M .gitignore
 M README.md
 M app/Http/Controllers/PaymentController.php
 M app/Http/Requests/PaymentRequest.php
 M database/migrations/2026_09_14_000012_add_student_id_to_applications_table.php
 M docs/FINAL_PRE_LAUNCH_REVIEW.md
 M docs/README.md
 M tests/Feature/FinanceNegativeValidationTest.php
?? docs/AUDIT.md
?? docs/VERIFY-NATIVE-RELEASE-PROMPT.md
?? docs/verification/
```

All changes are pre-existing user work; none were touched by this run.

### Vite config (vite.config.ts)

- Build tool: vite-plus (vite-plus v0.3.0, defineConfig/lazyPlugins from vite-plus)
- Plugins (in order):
    1. laravel (laravel-vite-plugin) - input ['resources/css/app.css', 'resources/js/app.tsx'], refresh: true
    2. inertia (@inertiajs/vite)
    3. react (@vitejs/plugin-react)
    4. babel (@rolldown/plugin-babel) with reactCompilerPreset()
    5. tailwindcss (@tailwindcss/vite)
    6. wayfinder (@laravel/vite-plugin-wayfinder) with formVariants: true
- Aliases: none defined in this config (no resolve.alias); rely on vite-plus defaults + TS paths.
- Required env vars: none enforced by the config (no envDir/envPrefix overrides visible).
- Wayfinder routes auto-generation: @laravel/vite-plugin-wayfinder is registered as a plugin. It generates resources/js/routes/** and resources/js/wayfinder/** at build/dev start. These paths are excluded from lint (lint.ignorePatterns) and fmt, confirming they are produced at build time, not committed.
- server.watch.ignored excludes **/.agents/**, **/.claude/**, **/.cursor/**, **/.junie/**, **/vendor/**.

### scripts/check-i18n.mjs requirements

- Imports resources/js/i18n/en.ts and resources/js/i18n/ar.ts (must exist and export objects).
- Walks resources/js/** for .ts/.tsx files.
- Regex extracts literal t('key.path') calls (single-quoted, [A-Za-z0-9_.]+).
- Fails (exit 1) if any used literal key is missing from en or ar dictionaries.
- Requires Node ESM support (await import(pathToFileURL(...))); run via node scripts/check-i18n.mjs.

### npm ci result

- Command: npm ci (first attempt)
- Exit status: 0
- Output: added 248 packages, and audited 249 packages in 1m
- Packages installed: 248 (audited 249)
- npm audit --production: 0 vulnerabilities

### Binaries confirmed

- node_modules/.bin/vp - v0.3.0 (vite-plus v0.3.0)
- node_modules/.bin/tsc - v5.9.3

### Blocking errors

- None. First npm ci attempt succeeded; no retry needed.

### Report file

- Written to: docs/verification/02-frontend-install.md (this file)
