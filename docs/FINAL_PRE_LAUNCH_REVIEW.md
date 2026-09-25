# Final Pre-Launch Review

## Current decision

**Status: NO-GO for production deployment.** Native verification completed on 2026-09-25 with every code gate green. The strict release check still fails on local production configuration (`APP_ENV`, HTTPS `APP_URL`, and mail transport), and the deployment migration history still requires review.

## Completed review areas

| Area                                    | Result                                                                    | Evidence                                                                                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tenant isolation and authorization      | Implemented and covered by Feature tests                                  | AuthorizationIsolationTest, existing foundation tests                                                                                               |
| Finance workflows                       | Implemented and covered                                                   | FinanceWorkflowTest, FinanceNegativeValidationTest                                                                                                  |
| Finance reports and receipts            | Implemented and covered                                                   | FinanceReportingRegressionTest                                                                                                                      |
| Notifications and email delivery        | Implemented and covered                                                   | NotificationDeliveryTest                                                                                                                            |
| Queue health and scheduler commands     | Implemented and covered                                                   | QueueWorkerHealthTest, SchedulerCommandIntegrationTest                                                                                              |
| Audit immutability and attribution      | Implemented and covered                                                   | AuditIntegrityRegressionTest, immutable model hooks                                                                                                 |
| Security headers and webhook throttling | Implemented and covered                                                   | SecurityHeaders, SecurityHardeningTest                                                                                                              |
| Public website and admissions funnel    | Implemented                                                               | Complete bilingual homepage with real links, public pages, school CTA, admissions form, privacy consent, SEO metadata, sitemap, and robots endpoint |
| Authenticated dashboard overview        | Implemented with live-record data wiring                                  | DashboardController and DashboardPayloadService; production smoke validation remains required                                                       |
| Release gate and operations             | Implemented and automated; native strict check has configuration failures | `php artisan app:release-check --strict`, `scripts/verify-native-release.sh`, docs/DEPLOYMENT.md                                                    |
| Migration integrity                     | Duplicate generated migrations identified and neutralized                 | docs/DATABASE_INTEGRITY.md, docs/MIGRATION_INSPECTION.md                                                                                            |

## Mandatory go-live gates

The native verification gate is automated and was executed locally on 2026-09-25 with `bash scripts/verify-native-release.sh`. Evidence is recorded per step under `.verification/<run-id>/`. The completed results are:

1. Dependency install from lockfiles: PASS.
2. Migration audit: PASS — 52 repository migrations, 52 applied, no drift, all seven documented duplicate no-ops recorded.
3. Migration rollback (`migrate:reset`) and re-apply on a disposable SQLite database: PASS.
4. Wayfinder generation (`wayfinder:generate --with-form`): PASS; generated actions and routes present.
5. `npm run check`: PASS; 698 literal translation keys, none missing in `en` or `ar`.
6. `npm run types:check`: PASS.
7. `npm run build`: PASS.
8. `composer lint:check`: PASS.
9. `composer types:check`: PASS.
10. `php artisan test`: PASS, 216 tests and 1,044 assertions.
11. `php artisan schedule:list`: PASS; three scheduled commands registered.
12. `php artisan app:release-check --strict`: FAIL; three local configuration failures (APP_ENV, APP_URL HTTPS, mail transport).

Any required failure is a no-go condition. The full gate is automated and re-runnable: `bash scripts/verify-native-release.sh` (routine local/CI validation) and `RELEASE_MODE=ci bash scripts/verify-native-release.sh` (full production-like release gate). Both fail on any required gate failure and write per-step evidence to `.verification/<run-id>/`. CI runs them through `.github/workflows/native-release.yml`. Only the three local-configuration items in item 7 are tolerated in local mode; they are hard failures in release mode.

The deployment database must be inspected before promoting the no-op duplicate migration correction. The exact export, comparison, and duplicate-handling procedure is in [docs/MIGRATION_INSPECTION.md](MIGRATION_INSPECTION.md), and the corresponding pre-deploy checklist items are in [docs/RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md). If any duplicate migration has already been recorded in the database migration table, do not rewrite migration history; create a reviewed forward migration instead and take a backup first.

Production must use HTTPS, APP_DEBUG=false, a stable APP_KEY, persistent sessions and cache, a real mail transport, an asynchronous queue, and SESSION_SECURE_COOKIE=true. Stripe secret and webhook secret must both be present and the registered webhook must use POST /webhooks/stripe with signature verification enabled.

At least one persistent queue worker and one scheduler process must be running. Worker heartbeat records must update regularly, queue:check-health must pass, and failed-job monitoring must have an owner. The Stripe webhook replay test must demonstrate one receipt for a repeated event. Guardian and Finance smoke tests must demonstrate tenant isolation in the deployed environment.

## Release sequence

1. Snapshot the production database and confirm restore access.
2. Inspect the current migrations table and compare it with the repository migration set.
3. Deploy code and dependencies with the previous release retained for rollback.
4. Run migrations, clear stale caches, and rebuild config, route, and view caches.
5. Start or restart queue workers and scheduler processes.
6. Run `php artisan app:release-check --strict`.
7. Execute public, Guardian, Finance, receipt, webhook, notification, and monitoring smoke tests.
8. Confirm audit events and worker heartbeats are visible.
9. Approve traffic only after all gates pass.

## Known limitations before approval

Native verification now passes every code gate: dependency install, disposable-database migration and rollback validation, migration audit, Wayfinder generation, frontend check, TypeScript, the production build, Pint, PHPStan, the test suite (216 tests, 1,044 assertions), and scheduler registration. The local strict release check fails because production-like `APP_ENV`, HTTPS `APP_URL`, and a mail transport are not configured; those three are the only expected local failures and `RELEASE_MODE=local` tolerates them by design. The deployment database must still be inspected before release. Live Stripe and mail delivery, browser smoke tests, and production queue execution remain deployment checks. The GitHub Actions workflow has not yet executed on GitHub, so the CI release gate is unproven.

## Rollback posture

Rollback must restore application code and configuration without deleting immutable receipts, payment intents, webhook events, or audit logs. If a migration has already changed production state, use a forward corrective migration rather than editing applied history. Preserve failed jobs and webhook payloads for incident analysis.
