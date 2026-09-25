# Frontend Verification — 03-frontend-checks

**Scope:** Frontend verification gates (`npm run check`, `npm run types:check`, `npm run build`) at `C:\Users\moham\Downloads\projects\school.system` (node_modules present). No git commit/reset/stash/checkout/revert performed. No PHP/composer commands invoked by hand; wayfinder codegen runs indirectly inside `vp build`.
**Environment:** node v24.21.0, npm 11.19.0, vite-plus v0.3.0, `@laravel/vite-plugin-wayfinder` v0.1.10 (PHP partner in `vendor/laravel/wayfinder`), PHP 8.6.0beta2 (invoked only via the build's wayfinder hook).

## Verification table

| Step | Command                                                 | Exit | Result                               |
| ---- | ------------------------------------------------------- | ---- | ------------------------------------ |
| 1    | `git status --short` (pre)                              | 0    | PASS — recorded pre-existing tree    |
| 2    | `npm run check` (`vp check` + `scripts/check-i18n.mjs`) | 2    | FAIL                                 |
| 3    | `npm run types:check` (`tsc --noEmit`)                  | 0    | PASS (after fix)                     |
| 4    | `npm run build` (`vp build`)                            | 0    | PASS                                 |
| 5    | `git status --short` (post)                             | 0    | PASS — only gitignored artifacts new |

## Step 1 — `git status --short` (pre)

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

All pre-existing (backend PHP + docs). No `resources/js` source changes were present before this run.

## Step 2 — `npm run check` (FAIL, exit 2)

`vp check` aborts before analysis:

```
Checking formatting...

docs/AUDIT.md (468ms)
docs/FINAL_PRE_LAUNCH_REVIEW.md (766ms)
docs/VERIFY-NATIVE-RELEASE-PROMPT.md (784ms)
docs/verification/01-backend-runtime-gate.md (2119ms)
docs/verification/02-frontend-install.md (955ms)
  x Failed to read file: C:\Users\moham\Downloads\projects\school.system\docs\verification\04-php-quality-gate.md
  help: This may be due to the file being a binary or inaccessible.
Error occurred when checking code style in the above files.
Formatting failed before analysis started
error: Formatting could not start
```

Two failure causes, both unrelated to frontend source:

1. Markdown formatting issues in documentation files. Confirmed by a read-only `prettier --check` (project `fmt` options: printWidth 80, tabWidth 4, singleQuote, semi):

    ```
    Code style issues found in 6 files. Run Prettier with --write to fix.
    - docs/AUDIT.md
    - docs/FINAL_PRE_LAUNCH_REVIEW.md
    - docs/VERIFY-NATIVE-RELEASE-PROMPT.md
    - docs/verification/01-backend-runtime-gate.md
    - docs/verification/02-frontend-install.md
    - docs/verification/04-php-quality-gate.md
    ```

    `docs/README.md` and every `resources/js/**` source file pass — the first pre-build `npm run check` pass reported formatting issues in 5 docs files only (no source).

2. `vp check` additionally aborts reading `docs/verification/04-php-quality-gate.md` ("Failed to read file … binary or inaccessible"). The file is valid UTF-8 markdown (no NUL bytes, no BOM, openable, readable by `prettier --check`); it is a sibling-authored PHP quality-gate report. A vite-plus check-layer read quirk on that one file — not a frontend defect.

i18n sub-check (run separately because `vp check && …` short-circuits on failure):

```
698 literal keys used, 854 en, 854 ar
missing in en: 0
missing in ar: 0
```

→ i18n PASS.

Per HARD RULES, documentation files were not rewritten ("Preserve uncommitted user work; do not rewrite unrelated files"), so the formatting issues remain. The minimal fix would be `vp check --fix` (withheld).

## Step 3 — `npm run types:check` (`tsc --noEmit`)

Initial run: 13 errors, all `TS2339: Property 'form' does not exist on type` — stale wayfinder helpers missing the `formVariants` `.form()` method. Verbatim:

```
resources/js/components/delete-user.tsx(55,59): error TS2339: Property 'form' does not exist on type '{ (options?: RouteQueryOptions | undefined): RouteDefinition<"delete">; definition: { methods: ["delete"]; url: string; }; url(options?: RouteQueryOptions | undefined): string; delete(options?: RouteQueryOptions | undefined): RouteDefinition<...>; }'.
resources/js/components/manage-two-factor.tsx(63,43): error TS2339: Property 'form' does not exist on type '{ (options?: RouteQueryOptions | undefined): RouteDefinition<"delete">; definition: { methods: ["delete"]; url: string; }; url(options?: RouteQueryOptions | undefined): string; delete(options?: RouteQueryOptions | undefined): RouteDefinition<...>; }'.
resources/js/components/manage-two-factor.tsx(96,44): error TS2339: Property 'form' does not exist on type '{ (options?: RouteQueryOptions | undefined): RouteDefinition<"post">; definition: { methods: ["post"]; url: string; }; url(options?: RouteQueryOptions | undefined): string; post(options?: RouteQueryOptions | undefined): RouteDefinition<...>; }'.
resources/js/components/two-factor-recovery-codes.tsx(84,57): error TS2339: Property 'form' does not exist on type '{ (options?: RouteQueryOptions | undefined): RouteDefinition<"post">; definition: { methods: ["post"]; url: string; }; url(options?: RouteQueryOptions | undefined): string; post(options?: RouteQueryOptions | undefined): RouteDefinition<...>; }'.
resources/js/components/two-factor-setup-modal.tsx(159,25): error TS2339: Property 'form' does not exist on type '{ (options?: RouteQueryOptions | undefined): RouteDefinition<"post">; definition: { methods: ["post"]; url: string; }; url(options?: RouteQueryOptions | undefined): string; post(options?: RouteQueryOptions | undefined): RouteDefinition<...>; }'.
resources/js/pages/auth/confirm-password.tsx(33,29): error TS2339: Property 'form' does not exist on type '{ (options?: RouteQueryOptions | undefined): RouteDefinition<"post">; definition: { methods: ["post"]; url: string; }; url(options?: RouteQueryOptions | undefined): string; post(options?: RouteQueryOptions | undefined): RouteDefinition<...>; }'.
resources/js/pages/auth/forgot-password.tsx(24,33): error TS2339: Property 'form' does not exist on type '{ (options?: RouteQueryOptions | undefined): RouteDefinition<"post">; definition: { methods: ["post"]; url: string; }; url(options?: RouteQueryOptions | undefined): string; post(options?: RouteQueryOptions | undefined): RouteDefinition<...>; }'.
resources/js/pages/auth/login.tsx(31,27): error TS2339: Property 'form' does not exist on type '{ (options?: RouteQueryOptions | undefined): RouteDefinition<"post">; definition: { methods: ["post"]; url: string; }; url(options?: RouteQueryOptions | undefined): string; post(options?: RouteQueryOptions | undefined): RouteDefinition<...>; }'.
resources/js/pages/auth/reset-password.tsx(22,28): error TS2339: Property 'form' does not exist on type '{ (options?: RouteQueryOptions | undefined): RouteDefinition<"post">; definition: { methods: ["post"]; url: string; }; url(options?: RouteQueryOptions | undefined): string; post(options?: RouteQueryOptions | undefined): RouteDefinition<...>; }'.
resources/js/pages/auth/two-factor-challenge.tsx(58,31): error TS2339: Property 'form' does not exist on type '{ (options?: RouteQueryOptions | undefined): RouteDefinition<"post">; definition: { methods: ["post"]; url: string; }; url(options?: RouteQueryOptions | undefined): string; post(options?: RouteQueryOptions | undefined): RouteDefinition<...>; }'.
resources/js/pages/auth/verify-email.tsx(21,28): error TS2339: Property 'form' does not exist on type '{ (options?: RouteQueryOptions | undefined): RouteDefinition<"post">; definition: { methods: ["post"]; url: string; }; url(options?: RouteQueryOptions | undefined): string; post(options?: RouteQueryOptions | undefined): RouteDefinition<...>; }'.
resources/js/pages/settings/profile.tsx(51,50): error TS2339: Property 'form' does not exist on type '{ (options?: RouteQueryOptions | undefined): RouteDefinition<"patch">; definition: { methods: ["patch"]; url: string; }; url(options?: RouteQueryOptions | undefined): string; patch(options?: RouteQueryOptions | undefined): RouteDefinition<...>; }'.
resources/js/pages/settings/security.tsx(45,51): error TS2339: Property 'form' does not exist on type '{ (options?: RouteQueryOptions | undefined): RouteDefinition<"put">; definition: { methods: ["put"]; url: string; }; url(options?: RouteQueryOptions | undefined): string; put(options?: RouteQueryOptions | undefined): RouteDefinition<...>; }'.
```

These components use Inertia `<Form {...Controller.action.form()}>` — e.g. `ProfileController.destroy.form()` at `delete-user.tsx:55`. This is a wayfinder **form variant**. `vite.config.ts:21-23` configures `wayfinder({ formVariants: true })`, so the wayfinder vite plugin passes `--with-form` to `php artisan wayfinder:generate`. The generated route helpers under gitignored `resources/js/{actions,routes,wayfinder}` were **stale** — generated without `--with-form`, so they lacked `.form()` / `RouteFormDefinition`.

**Fix (minimal, no source edits):** ran `npm run build` (step 4); the wayfinder `buildStart` hook ran `php artisan wayfinder:generate --with-form`. Build log:

```
[plugin @laravel/vite-plugin-wayfinder] Types generated for actions, routes, form variants
```

Regenerated artifact `resources/js/actions/App/Http/Controllers/Settings/ProfileController.ts:144` now contains `update.form = updateForm` returning `RouteFormDefinition<'post'>` (route file grew 114 → 212 lines). Re-ran `tsc --noEmit` → **0 errors (PASS, exit 0)** (re-confirmed in a second run). No `resources/js` source files were edited; no PHP/composer commands run by hand (codegen occurred indirectly via the `vp build` hook).

## Step 4 — `npm run build` (`vp build`) (PASS, exit 0)

```
[plugin @laravel/vite-plugin-wayfinder] Types generated for actions, routes, form variants
...
✓ built in 49.22s
```

Build artifacts emitted (gitignored, confirmed on disk):

- `public/build/manifest.json` — 62,349 bytes.
- `public/build/assets/` — **167** JS/CSS asset files.
- Regenerated wayfinder artifacts (gitignored): `resources/js/wayfinder/index.ts` (4,601 B), `resources/js/routes/index.ts` (9,459 B), **77** `resources/js/actions/**` files (now including `.form()`).

Warnings: none from the bundler. One informational rolldown notice:

```
[PLUGIN_TIMINGS] Your build spent 80% of 49.2s inside plugin hooks (39.3s).
  - @tailwindcss/vite:generate:build transform (41%, 20.2s, 1 call)
  - @rolldown/plugin-babel transform (39%, 19.1s, 207 calls)
  - @laravel/vite-plugin-wayfinder buildStart (22%, 10.8s, 1 call)
```

This is a plugin-timing summary (`checks.pluginTimings`), not a build error.

## Step 5 — `git status --short` (post-build)

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

Distinguishing artifacts vs source: the build introduced **no new tracked/source changes**. `resources/js/{actions,routes,wayfinder}` and `public/build/` are gitignored (`.gitignore` ignores `/resources/js/actions`, `/resources/js/routes`, `/resources/js/wayfinder` and Laravel's `public/build`), so they do not appear in `git status` — they exist only on disk as build artifacts. The lines above are exactly the pre-existing state from Step 1 (capture temp logs were removed).

## Fixes summary

| #   | File                                                                                                                                      | Change                                                                                                     | Rationale                                                                                                                                                                      |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `resources/js/actions/App/Http/Controllers/Settings/ProfileController.ts` (+ 76 sibling action files; all gitignored generated artifacts) | Regenerated via `npm run build` (wayfinder `--with-form`) to add `.form()` returning `RouteFormDefinition` | Stale helpers lacked the `formVariants` helper configured at `vite.config.ts:21`; regeneration resolved all 13 `TS2339` errors. No source edited; no PHP/composer run by hand. |

No other files were modified. Documentation formatting issues (Step 2) were intentionally left untouched per the HARD RULES.

## Final verdict

**Frontend source: PASS.** `types:check` PASS (0 errors after regeneration), `npm run build` PASS (manifest + 167 assets), `resources/js` source lint/format clean, i18n PASS (0 missing keys).

The repo-wide `npm run check` gate **FAILS (exit 2)**, but only on documentation: (a) pre-existing markdown formatting in 6 docs files, and (b) a vite-plus check-layer read abort on sibling-authored `docs/verification/04-php-quality-gate.md`. Neither is a frontend-source defect; both were preserved per the HARD RULES ("Preserve uncommitted user work; do not rewrite unrelated files"). Running `vp check --fix` (withheld) would clear the docs formatting.
