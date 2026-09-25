# Final Pre-Launch Review

## Current decision

**Status: NO-GO until environment validation is completed.** The application foundation and core MVP slices are implemented, including tenant isolation, RBAC, bilingual localization, admissions, SIS, teaching operations, notifications, finance, Stripe reconciliation, receipts, reporting, audit logging, queue health, and deployment documentation. PHP and Composer are available, but the Laravel runtime cannot complete bootstrap from the mounted FUSE filesystem, so the release cannot yet be approved from this sandbox.

## Completed review areas

| Area                                    | Result                                                    | Evidence                                                                                                                                                                            |
| --------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tenant isolation and authorization      | Implemented and covered by Feature tests                  | AuthorizationIsolationTest, existing foundation tests                                                                                                                               |
| Finance workflows                       | Implemented and covered                                   | FinanceWorkflowTest, FinanceNegativeValidationTest                                                                                                                                  |
| Finance reports and receipts            | Implemented and covered                                   | FinanceReportingRegressionTest                                                                                                                                                      |
| Notifications and email delivery        | Implemented and covered                                   | NotificationDeliveryTest                                                                                                                                                            |
| Queue health and scheduler commands     | Implemented and covered                                   | QueueWorkerHealthTest, SchedulerCommandIntegrationTest                                                                                                                              |
| Audit immutability and attribution      | Implemented and covered                                   | AuditIntegrityRegressionTest, immutable model hooks                                                                                                                                 |
| Security headers and webhook throttling | Implemented and covered                                   | SecurityHeaders, SecurityHardeningTest                                                                                                                                              |
| Public website and admissions funnel    | Implemented                                               | Complete bilingual homepage with real links, public pages, school CTA, admissions form, privacy consent, SEO metadata, sitemap, and robots endpoint                                 |
| Authenticated dashboard overview        | UI implemented; data wiring pending                       | Bilingual operational summary with safe school-context navigation; live metrics and task counts must be supplied by the authenticated dashboard response before production approval |
| Release gate and operations             | Documented and implemented                                | pp:release-check, docs/DEPLOYMENT.md                                                                                                                                                |
| Migration integrity                     | Duplicate generated migrations identified and neutralized | docs/DATABASE_INTEGRITY.md                                                                                                                                                          |

## Mandatory go-live gates

Before approving release, run the native verification gate from a native checkout or CI runner. This gate is **not yet scripted as a single file** (see Known Limitations); the equivalent manual steps are:

1. composer install (validates repository whitespace and Composer manifests)
2. Fresh and refresh migration/seed validation against a disposable SQLite database
3. Wayfinder generation (php artisan wayfinder:generate)
4.

pm ci (frontend dependency installation) 5. Frontend lint and type checks (
pm run check) 6. Production build (
pm run build) 7. composer lint:check (Pint) 8. composer types:check (PHPStan) 9. php artisan test (PHPUnit) 10. php artisan app:release-check --strict

Any failure is a no-go condition. A single-file script (scripts/verify-native-release.sh) and GitHub Actions workflow (.github/workflows/native-release.yml) **do not yet exist**; they are tracked as future work. The manual gate above must pass before production approval.

The deployment database must be inspected before promoting the no-op duplicate migration correction. If any duplicate migration has already been recorded in the database migration table, do not rewrite migration history; create a reviewed forward migration instead and take a backup first.

Production must use HTTPS, APP_DEBUG=false, a stable APP_KEY, persistent sessions and cache, a real mail transport, an asynchronous queue, and SESSION_SECURE_COOKIE=true. Stripe secret and webhook secret must both be present and the registered webhook must use POST /webhooks/stripe with signature verification enabled.

At least one persistent queue worker and one scheduler process must be running. Worker heartbeat records must update regularly, queue:check-health must pass, and failed-job monitoring must have an owner. The Stripe webhook replay test must demonstrate one receipt for a repeated event. Guardian and Finance smoke tests must demonstrate tenant isolation in the deployed environment.

## Release sequence

1. Snapshot the production database and confirm restore access.
2. Inspect the current migrations table and compare it with the repository migration set.
3. Deploy code and dependencies with the previous release retained for rollback.
4. Run migrations, clear stale caches, and rebuild config, route, and view caches.
5. Start or restart queue workers and scheduler processes.
6. Run pp:release-check --strict.
7. Execute public, Guardian, Finance, receipt, webhook, notification, and monitoring smoke tests.
8. Confirm audit events and worker heartbeats are visible.
9. Approve traffic only after all gates pass.

## Known limitations before approval

Frontend dependency installation and formatting/lint validation have passed in a native temporary workspace. The typed Inertia resolver, locale reload call, and teacher attendance FormData handling were corrected. Full TypeScript and production bundling remain dependent on Wayfinder generation, which requires the Laravel runtime. The mounted validation environment still cannot complete Laravel bootstrap: even php artisan --version and the focused PHPUnit run exceed the bounded timeout before producing output. PHPUnit, Pint, PHPStan, migrations, Wayfinder generation, and live Stripe/mail tests therefore remain unverified until the native gate (manual steps listed above) or a future CI workflow completes successfully. The no-op migration remediation also requires verification against the actual deployment database before release.

## Rollback posture

Rollback must restore application code and configuration without deleting immutable receipts, payment intents, webhook events, or audit logs. If a migration has already changed production state, use a forward corrective migration rather than editing applied history. Preserve failed jobs and webhook payloads for incident analysis.
