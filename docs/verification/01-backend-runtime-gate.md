# Backend Runtime Gate Verification — Wave 1a

**Repository:** C:\Users\moham\Downloads\projects\school.system  
**Date:** 2026-09-25  
**Task:** Prove the PHP backend boots, migrates, seeds, and generates Wayfinder routes.  
**Database:** Disposable SQLite file (database/verification.sqlite) — no real database touched.

---

## 1. Environment Versions

| Tool         | Version                                  |
| ------------ | ---------------------------------------- |
| PHP          | 8.6.0beta2 (cli) NTS Visual C++ 2026 x64 |
| Composer     | 2.10.3                                   |
| Node         | v24.21.0                                 |
| npm          | 11.19.0                                  |
| Laravel      | 13.32.0                                  |
| SQLite (PDO) | Bundled PHP driver                       |

## 2. Pre-existing Working-Tree State

Captured **before** any changes:

` M .gitignore
 M README.md
 M app/Http/Controllers/PaymentController.php
 M app/Http/Requests/PaymentRequest.php
 M docs/FINAL_PRE_LAUNCH_REVIEW.md
 M docs/README.md
 M tests/Feature/FinanceNegativeValidationTest.php
?? docs/AUDIT.md
?? docs/VERIFY-NATIVE-RELEASE-PROMPT.md`

7 pre-existing modified files + 2 untracked files. None of these were touched by this verification task.

## 3. Configured Database Connection (from .env)

- DB_CONNECTION=mysql
- DB_HOST=127.0.0.1
- DB_PORT=3306
- DB_DATABASE=laravel
- DB_USERNAME=_**REDACTED**_
- DB_PASSWORD=_**REDACTED**_
- APP_KEY=base64:_**[REDACTED]**_ (valid, present)

The .env.example template defaults to sqlite. The .env was configured for MySQL. All verification steps below used **PowerShell env-var overrides** (DB_CONNECTION=sqlite, DB_DATABASE=<abs path>\database\verification.sqlite) so .env was never modified.

## 4. Composer Install

`$ composer install --ignore-platform-reqs
Verifying lock file contents can be installed on current platform.
Deprecation Notice: Constant MB_ONIGURUMA_VERSION is deprecated since 8.6 ...
Nothing to install, update or remove
Generating optimized autoload files
Class Tests\Feature\RegistrationSecurityTest located in ./tests/Feature/Auth/RegistrationSecurityTest.php does not comply with psr-4 autoloading standard (rule: Tests\ => ./tests). Skipping.`

**Result:** Success (exit 0).  
**Note:** A plain composer install failed because composer.lock pins
ette/schema v1.3.6 and
ette/utils v4.1.5, both of which require PHP 8.1–8.5, while the runtime is PHP 8.6.0beta2. Per task rules, composer update was **not** run; --ignore-platform-reqs was used instead. The lockfile is out of sync with the PHP runtime, not with composer.json.  
**Note:** PSR-4 autoloading warning for Tests\Feature\RegistrationSecurityTest at ests/Feature/Auth/RegistrationSecurityTest.php — skipped by Composer, not a blocker for backend runtime verification.

## 5. APP_KEY & Disposable DB

- APP_KEY was already present in .env; php artisan key:generate was **not** run.
- Created empty disposable SQLite file at database/verification.sqlite.

## 6. Migration + Seed (migrate:fresh --seed)

**Command:**

`powershell
='sqlite'
='C:\...\database\verification.sqlite'
php artisan config:clear
php artisan migrate:fresh --seed --force
`

**Result:** PASS (exit 0).  
**Migrations applied:** 52 / 52 — all DONE.  
**Seeders run:** 1 (Database\Seeders\DemoSchoolSeeder) — RUNNING then DONE (662 ms).

Full migration list (all 52):

`0001_01_01_000000_create_users_table .. DONE
0001_01_01_000001_create_cache_table .. DONE
0001_01_01_000002_create_jobs_table .. DONE
2024_01_01_000000_create_passkeys_table .. DONE
2025_08_14_170933_add_two_factor_columns_to_users_table .. DONE
2026_09_14_000001_create_organization_hierarchy .. DONE
2026_09_14_000002_add_organization_id_to_users_table .. DONE
2026_09_14_000003_add_role_to_users_table .. DONE
2026_09_14_000004_create_audit_logs_table .. DONE
2026_09_14_000005_create_queue_tables .. DONE
2026_09_14_000006_create_media_table .. DONE
2026_09_14_000007_create_pages_table .. DONE
2026_09_14_000008_create_applications_table .. DONE
2026_09_14_000009_create_students_guardians_tables .. DONE
2026_09_14_000010_create_academic_structure_tables .. DONE
2026_09_14_000011_create_attendance_tables .. DONE
2026_09_14_000012_add_student_id_to_applications_table .. DONE
2026_09_14_000013_create_notices_tables .. DONE
2026_09_14_000014_create_assessments_table .. DONE
2026_09_14_000015_create_report_card_snapshots_table .. DONE
2026_09_14_000016_create_notifications_table .. DONE
2026_09_14_143947_create_organizations_table .. DONE
2026_09_14_144527_create_schools_table .. DONE
2026_09_14_144720_create_branches_table .. DONE
2026_09_14_145312_add_organization_id_to_users_table .. DONE
2026_09_14_145322_add_organization_id_to_users_table .. DONE
2026_09_14_150000_add_organization_id_to_branches_table .. DONE
2026_09_15_000017_create_fee_structures_table .. DONE
2026_09_15_000018_create_invoices_table .. DONE
2026_09_15_000019_create_installments_table .. DONE
2026_09_15_000020_create_payment_intents_table .. DONE
2026_09_15_000021_create_payment_webhook_events_table .. DONE
2026_09_15_000022_create_receipts_table .. DONE
2026_09_16_000023_add_provider_reference_unique_to_receipts_table .. DONE
2026_09_16_000024_create_notification_preferences_table .. DONE
2026_09_16_000025_add_email_enabled_to_notification_preferences .. DONE
2026_09_16_000026_create_notification_deliveries_table .. DONE
2026_09_16_000027_create_queue_worker_heartbeats_table .. DONE
2026_09_16_000028_create_site_contents_table .. DONE
2026_09_20_000030_drop_sections_class_unique .. DONE
2026_09_20_000040_create_school_memberships_table .. DONE
2026_09_20_000050_backfill_school_memberships .. DONE
2026_09_20_000100_create_school_schedule_tables .. DONE
2026_09_20_000200_create_timetable_tables .. DONE
2026_09_21_000001_change_user_role_default_to_guardian .. DONE
2026_09_21_000002_create_exam_schedule_tables .. DONE
2026_09_21_000003_add_user_id_to_students_table .. DONE
2026_09_21_173457_add_columns_to_guardians_table .. DONE
2026_09_22_000001_create_payments_table .. DONE
2026_09_23_000000_add_performance_indexes .. DONE
2026_09_23_000001_add_installment_indexes .. DONE
2026_09_25_000001_create_settings_table .. DONE`

## 7. Rollback Validation (migrate:reset)

**First attempt — FAILED.** Rollback halted on migration 2026_09_14_000012_add_student_id_to_applications_table:

`
0001_01_01_000002_create_jobs_table .. 22.75ms DONE
0001_01_01_000001_create_cache_table .. 16.30ms DONE
0001_01_01_000000_create_users_table .. 23.44ms DONE

RuntimeException

This database driver does not support dropping foreign keys by name.

at vendor\laravel\framework\src\Illuminate\Database\Schema\Grammars\SQLiteGrammar.php:607
`

The down() method called $table->dropForeign('applications_organization_id_student_id_foreign') and $table->dropForeign('applications_student_id_foreign') — dropping foreign keys **by name string**, which SQLite does not support.

### Fix applied

**File:** database/migrations/2026_09_14_000012_add_student_id_to_applications_table.php:28-29  
**Rationale:** SQLite's SQLiteGrammar::compileDropForeign() throws when a foreign key is dropped by name (string). Passing a **column array** instead causes Laravel to derive the constraint name via the standard _foreign convention, which SQLite supports. The generated names match the original string names exactly, so MySQL behavior is unchanged.

`diff

-            ->dropForeign('applications_organization_id_student_id_foreign');
-            ->dropForeign('applications_student_id_foreign');

*            ->dropForeign(['organization_id', 'student_id']);
*            ->dropForeign(['student_id']);

`

**Second attempt (after fix) — PASS.** All 52 migrations rolled back successfully:

`
2026_09_25_000001_create_settings_table .. 10.97ms DONE
...
0001_01_01_000000_create_users_table .. 23.44ms DONE

=== ROLLBACK_EXIT=True ===
`

## 8. Idempotent Re-apply + Status

**Re-apply:** php artisan migrate --seed --force — 52 migrations DONE, seeding DONE (DemoSchoolSeeder, 349 ms). Exit 0.

**Status:** php artisan migrate:status — all 52 migrations show Ran (Batch 1).

## 9. Wayfinder Route Generation

`
$ php artisan wayfinder:generate

[Wayfinder] Generated actions in C:\...\resources\js\actions
[Wayfinder] Generated routes in C:\...\resources\js\routes
`

**Result:** PASS (exit 0).  
**Wayfinder files generated:**

| Path                | File count |
| ------------------- | ---------- |
|                     |
| esources/js/actions | 77         |
|                     |
| esources/js/routes  | 74         |
| **Total**           | **151**    |

Git status: wayfinder output files are gitignored (/resources/js/actions, /resources/js/routes, /resources/js/wayfinder in .gitignore), so git status does **not** report them as modified. This is expected and correct.

## 10. App Boot & Routes

`$ php artisan about
 Laravel Version .. 13.32.0
 PHP Version .. 8.6.0beta2
 Environment .. local
 Debug Mode .. OFF
 Database .. sqlite`

`$ php artisan route:list --json  →  218 routes (parsed from JSON)`

**Result:** PASS — app boots and 218 routes register without exception.

---

## Verification Summary Table

| Step             | Command                                                                                | Exit                         | Result                                           |
| ---------------- | -------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------ |
| 1                | php -v / composer --version /                                                          |
| ode -v /         |
| pm -v            | 0                                                                                      | PASS                         |
| 2                | git status --short                                                                     | 0                            | PASS (7 modified, 2 untracked — pre-existing)    |
| 3                | .env / config/database.php inspection                                                  | —                            | PASS (MySQL configured; used SQLite override)    |
| 4                | composer install --ignore-platform-reqs                                                | 0                            | PASS (lockfile out of sync with PHP 8.6 runtime) |
| 5                | php artisan key:generate (skipped — key present) / create database/verification.sqlite | 0                            | PASS                                             |
| 6                | php artisan migrate:fresh --seed --force                                               | 0                            | PASS (52 migrations, 1 seeder)                   |
| 7                | php artisan migrate:reset --force (2nd attempt)                                        | 0                            | PASS (fixed 1 broken migration down())           |
| 8                | php artisan migrate --seed --force + migrate:status                                    | 0                            | PASS (idempotent; 52 all "Ran")                  |
| 9                | php artisan wayfinder:generate                                                         | 0                            | PASS (151 files: 77 actions + 74 routes)         |
| 10               | php artisan about +                                                                    |
| oute:list --json | 0                                                                                      | PASS (app boots; 218 routes) |

## Errors Encountered & Root Causes

| #                                      | Error                                                                                                                                        | Root cause                                                 | Fix                                                                                                                               | Status        |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 1                                      | composer install fails: lock file requires PHP 8.1–8.5, runtime is PHP 8.6.0beta2                                                            | composer.lock pins                                         |
| ette/schema v1.3.6 /                   |
| ette/utils v4.1.5 which cap PHP at 8.5 | Ran with --ignore-platform-reqs (did not run composer update per rules)                                                                      | Resolved                                                   |
| 2                                      | PSR-4 autoload warning: Tests\Feature\RegistrationSecurityTest at ests/Feature/Auth/                                                         | Class location doesn't match PSR-4 Tests\ => tests map     | Skipped — not a runtime blocker; flagged for parallel agent                                                                       | Not a blocker |
| 3                                      | SQLite: This database driver does not support dropping foreign keys by name in 2026_09_14_000012_add_student_id_to_applications_table down() | dropForeign('string_name') not supported by SQLite grammar | Changed to dropForeign(['column_array']) — column-array syntax works on both SQLite and MySQL, deriving the same constraint names | Resolved      |

## Fixes Applied (file:line)

1. **database/migrations/2026_09_14_000012_add_student_id_to_applications_table.php:28-29** — Replaced two string-based dropForeign() calls with column-array-based calls to support SQLite rollback while preserving MySQL behavior.

## Remaining Blockers

None for the backend runtime gate. The following items are noted but **not** in scope for this task:

- composer.lock is out of sync with PHP 8.6 runtime (packages
  ette/schema,
  ette/utils cap at PHP 8.5). A composer update would resolve this but was **not** executed per task rules.
- PSR-4 autoloading mismatch for ests/Feature/Auth/RegistrationSecurityTest.php — flagged for the parallel test-suite agent.

## Counts

| Metric                             | Count                     |
| ---------------------------------- | ------------------------- |
| Migration files on disk            | 52                        |
| Migrations applied                 | 52                        |
| Seeders executed                   | 1 (DemoSchoolSeeder)      |
| Wayfinder files generated          | 151 (77 in ctions/, 74 in |
| outes/)                            |
| Routes registered                  | 218                       |
| Migrations rolled back (validate)  | 52 / 52                   |
| Migrations re-applied (idempotent) | 52 / 52                   |

---

_Report written by release-verification engineer. No git commits were made. No real databases were modified._
