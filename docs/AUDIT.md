# Repository Audit

## Executive decision

**Status: NO-GO for production deployment, with the native code verification gate passed.**

The repository has progressed beyond an initial scaffold. It contains a substantial Laravel 13 application with Inertia 3, React 19, TypeScript, multi-tenant organization boundaries, authorization gates, finance, attendance, scheduling, notifications, audit logging, deployment documentation, and a broad automated test suite.

The remaining uncertainty is operational rather than primarily structural: the Laravel runtime, migrations, PHPUnit, Pint, PHPStan, Wayfinder generation, and the strict release check must be executed successfully in a native local environment or CI runner. Code review and static inspection are not substitutes for those checks.

## Native verification result

The local native verification run completed on 2026-09-25 via
`bash scripts/verify-native-release.sh` (evidence under `.verification/20260925T171925Z/`):

| Check                     | Result        | Evidence                                                                         |
| ------------------------- | ------------- | -------------------------------------------------------------------------------- |
| Dependency install        | PASS          | `composer install`, `npm ci` from lockfiles                                      |
| Migration audit           | PASS          | 52 repository migrations, 52 applied, no drift, all 7 documented no-ops recorded |
| Migration rollback        | PASS          | `migrate:reset` and re-apply on a disposable SQLite database                     |
| Wayfinder generation      | PASS          | `wayfinder:generate --with-form`; generated actions and routes present           |
| Frontend check            | PASS          | `npm run check`; 698 literal keys, 0 missing in `en` or `ar`                     |
| TypeScript                | PASS          | `npm run types:check`                                                            |
| Production frontend build | PASS          | `npm run build`                                                                  |
| Pint                      | PASS          | `composer lint:check`                                                            |
| PHPStan                   | PASS          | `composer types:check`, zero errors                                              |
| PHPUnit                   | PASS          | 216 tests, 1,044 assertions                                                      |
| Strict release check      | EXPECTED FAIL | Three local environment failures: APP_ENV, APP_URL HTTPS, and mail transport     |
| Scheduler registration    | PASS          | Three scheduled commands listed                                                  |

This proves the application can execute its main automated verification suite in the current environment. It does not approve production: the strict release configuration and the target deployment migration history still require remediation and review.

## Current evidence

| Area                                     | Current assessment                                                                                               | Required proof                                                                        |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Organization -> School -> Branch tenancy | Implemented with tenant-aware models, scopes, gates, and isolation tests                                         | Fresh and refresh migrations plus focused authorization tests                         |
| Authorization and role boundaries        | Gates and feature coverage are present for organization, school, finance, teacher, guardian, and platform access | Full PHPUnit run and cross-organization regression tests                              |
| Finance and Stripe reconciliation        | Core invoice, installment, payment, receipt, webhook, and idempotency paths are implemented                      | Full tests plus signed webhook replay and production-like configuration               |
| Localization                             | English and Arabic resources are checked by `scripts/check-i18n.mjs`                                             | Frontend check and browser smoke validation                                           |
| Frontend quality                         | Native TypeScript check and production build passed; Wayfinder types were generated during the build             | Browser smoke validation and CI repetition                                            |
| Database integrity                       | Disposable-database audit is clean: 52/52 applied, no drift, all 7 documented no-ops recorded                    | Inspect the deployed `migrations` table before promotion                              |
| CI/CD                                    | `scripts/verify-native-release.sh` and `.github/workflows/native-release.yml` are present                        | Run the release gate in `RELEASE_MODE=ci` against a production-like environment       |
| Payments roadmap                         | Stripe is the active provider; ZATCA, Moyasar, Tap, and HyperPay are deferred                                    | Keep deferred integrations out of the launch scope until finance workflows are proven |
| Documentation alignment                  | Launch documentation is being reconciled with the native verification result                                     | Keep the release decision synchronized with deployment evidence                       |

## Highest-priority risks

### 1. Runtime behavior is not yet proven

The most important gap is the absence of a successful end-to-end native run. A passing frontend check alone does not establish that Laravel can bootstrap, migrate, generate Wayfinder artifacts, execute tests, or complete the strict release check.

### 2. Migration history needs deployment-specific inspection

Several duplicate migrations remain in the repository as intentional no-ops. This preserves migration-history compatibility, but the correct deployment action depends on whether each migration has already been recorded in the target database. Do not rewrite applied migration history. Back up the database and use a reviewed forward migration when correction is required.

### 3. Release automation now exists but is unproven in CI

`scripts/verify-native-release.sh` and `.github/workflows/native-release.yml` are now present. The script has been executed natively; the workflow has not yet run on GitHub Actions. Until the first green CI run, the release gate is still effectively manual and remains vulnerable to environment drift.

### 4. Large frontend modules carry maintenance risk

The page-level and feature-level modules have been decomposed:

| Original module                                      | Now                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/admin/schedule/exams/index.tsx` (1,320 lines) | `components/admin/schedule/` — `types`, `labels`, `Calendar`, `ExamPeriods`, `ExamScheduleHeader`, `ExamAlerts`, `ExamDayAgenda`, `ExamPaperForm`, `ExamPapersTable`, and the `useExamSchedule` hook                                                                                                             |
| `pages/dashboard.tsx` (842 lines)                    | `components/dashboard/` — `types`, `format`, `empty`, `useDashboardData`, `stat-grid`, `quick-actions-widget`, `attendance-summary-widget`, `admissions-pipeline-widget`, `finance-widgets`, `assessment-widget`, `timetable-widget`, `outstanding-invoices-widget`, `upcoming-exams-widget`, `activity-widgets` |
| `pages/admin/theme/index.tsx` (763 lines)            | `components/admin/theme/` — `types`, `labels`, `useThemeForm`, `theme-toolbar`, `theme-group-section`, `theme-token-field`, `theme-contrast-panel`, `theme-actions`                                                                                                                                              |
| `components/data-display/data-table.tsx` (657 lines) | `components/data-display/` — `data-table-types`, `data-table-helpers`, `use-data-table`, `data-table-toolbar`, `data-table-pagination`                                                                                                                                                                           |

`components/ui/sidebar.tsx` (720 lines) was intentionally **not** split. It is the vendored shadcn/ui `sidebar` primitive, `vite.config.ts` excludes `resources/js/components/ui/*` from linting to keep it close to upstream, and the file is already a flat set of small exported primitives with no application logic. Splitting it would invent app-specific seams and make future upstream syncs harder.

Refactoring these modules was a maintainability improvement, not a launch blocker. Each extraction was checked for i18n-key and CSS-class parity against the original before the frontend gate was re-run.

### 5. The lockfile caps three transitive packages at PHP 8.5

`composer.lock` pins `nette/schema` v1.3.6 (`8.1 - 8.5`), `nette/utils` v4.1.5 (`8.2 - 8.5`), and `dragonmantank/cron-expression` v3.6.0 (`^8.2|^8.3|^8.4|^8.5`), while `composer.json` requires `php: ^8.3`. No stable release of any of the three currently declares PHP 8.6 support — only `dev-master` / `v1.4.x-dev` / `4.1.x-dev` / `3.x-dev` branches do. Therefore:

- CI pins PHP 8.3, where `composer install` succeeds without extra flags.
- A developer running PHP 8.6 (including the 8.6 beta used for local verification) must install with `--ignore-platform-reqs`, or export `COMPOSER_INSTALL_FLAGS=--ignore-platform-reqs` for the verification script.
- Do **not** resolve this by moving to dev branches. Re-run `composer update nette/schema nette/utils dragonmantank/cron-expression --with-all-dependencies` once stable PHP 8.6-compatible releases exist, then confirm a clean `composer install` without the flag.

## Verification order

Run `bash scripts/verify-native-release.sh` for the full sequence, or follow it manually:

1. Confirm PHP, Composer, Node, and the package manager versions.
2. Install PHP and frontend dependencies without suppressing errors.
3. Create a disposable test database and run fresh migrations and seeders.
4. Run migration refresh/rollback validation where supported by the project.
5. Generate Wayfinder artifacts with `php artisan wayfinder:generate --with-form`. The `--with-form` flag mirrors the `formVariants: true` option in `vite.config.ts`; without it the generated routes lose their `.form()` helper and `npm run types:check` fails on the auth and settings pages.
6. Run frontend lint/checks, TypeScript, and the production build.
7. Run Pint, PHPStan, and PHPUnit.
8. Run `php artisan app:release-check --strict`.
9. Inspect the target database migration table and complete deployment smoke tests.

Any failed required check keeps the decision at **NO-GO** until the failure is understood and fixed.

## Exit criteria for GO

The project can move to **GO** only when all of the following are true:

- Fresh and refresh migration paths complete successfully on the supported database engine.
- Wayfinder generation completes and generated frontend imports resolve.
- Frontend checks, TypeScript, production build, Pint, PHPStan, and PHPUnit pass.
- The strict release check passes with production-like configuration.
- The deployment migration table has been inspected and duplicate no-op migrations are understood.
- Queue worker, scheduler, mail, storage, session, and cache prerequisites are operational.
- Stripe webhook signature verification and replay idempotency are demonstrated.
- Guardian and finance smoke tests demonstrate tenant isolation.
- The release checklist and pre-launch review reflect the actual verification results.

## Related documents

- [Final pre-launch review](FINAL_PRE_LAUNCH_REVIEW.md)
- [Database integrity review](DATABASE_INTEGRITY.md)
- [Migration inspection procedure](MIGRATION_INSPECTION.md)
- [Deployment guide](DEPLOYMENT.md)
- [Release checklist](RELEASE_CHECKLIST.md)
- [Native verification prompt](VERIFY-NATIVE-RELEASE-PROMPT.md)
