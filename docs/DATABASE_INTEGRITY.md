# Database Integrity Review

## Queue migration duplication

The Laravel baseline migration `0001_01_01_000002_create_jobs_table` creates `jobs`, `job_batches`, and `failed_jobs`. The later project migration `2026_09_14_000005_create_queue_tables` previously attempted to create `jobs` and `failed_jobs` again, causing fresh SQLite/MySQL migrations to fail with a table-already-exists error. That migration is now intentionally a no-op and remains in the repository to preserve migration-history compatibility.

Before production deployment, inspect the production `migrations` table. If `2026_09_14_000005_create_queue_tables` is already recorded, do not edit migration history or roll it back; deploy the no-op version and continue with forward migrations. If it is not recorded, the no-op version will be applied safely after the canonical Laravel queue tables.

The canonical organization hierarchy is owned by `2026_09_14_000001_create_organization_hierarchy.php`, which creates `organizations`, `schools`, and `branches` with organization-scoped unique keys and composite branch-to-school ownership. The later timestamped organization, school, and branch create migrations were duplicate generated artifacts and are now explicit no-op migrations so a fresh install does not attempt to create the same tables twice. The duplicate user organization migration is also a no-op; the canonical nullable foreign key and tenant index are owned by `2026_09_14_000002_add_organization_id_to_users_table.php`.

The complete duplicate set is now neutralized: `2026_09_14_000005_create_queue_tables`, `2026_09_14_143947_create_organizations_table`, `2026_09_14_144527_create_schools_table`, `2026_09_14_144720_create_branches_table`, `2026_09_14_145312_add_organization_id_to_users_table`, `2026_09_14_145322_add_organization_id_to_users_table`, and `2026_09_14_150000_add_organization_id_to_branches_table`. No later migration should recreate or alter those canonical columns.

The `guardians` table now has the required unique `(organization_id, id)` key before `guardian_student` is created. MySQL requires that exact referenced-column index for the composite tenant foreign key; SQLite did not surface this requirement, so both engines must be covered by the migration definition.

Nullable relationship IDs are handled with a single-column `SET NULL` foreign key plus a tenant-scoped composite key using `RESTRICT`. MySQL rejects `SET NULL` on a composite key when the required `organization_id` column is non-nullable. This applies to enrollment `section_id` and application `student_id`; the tenant column remains mandatory and cannot be cleared by a relationship deletion.

All high-risk composite unique indexes now use explicit short names rather than Laravel-generated names. This covers attendance sessions and records, teacher assignments, academic years/classes/sections/enrollments, assessments, payment idempotency, provider intents, receipt provider references, and notification deliveries. MySQL limits identifiers to 64 characters; SQLite does not enforce that limit, so explicit names are required for cross-database parity.

Payment idempotency is protected by unique organization/user/key and provider/provider-intent constraints. Webhook replay is protected by the provider/event ID unique key. Receipts are protected by unique organization/receipt number and unique payment intent. Notification and delivery deduplication remain application-level because their keys include recipient and channel semantics.

Audit logs, payment intents, receipts, and webhook events use immutable application behavior or replay constraints. Existing organization foreign keys cascade in the initial schema; production operators must therefore treat organization deletion as prohibited and use a reviewed archival procedure instead of deleting tenant records. No destructive tenant-delete workflow is exposed by the application.

Before release, run migrations against a disposable copy of the production schema and verify that all migration batches complete in timestamp order. Never edit an already-applied migration in a deployed environment without a coordinated migration plan; the duplicate no-op correction is intended for the current unreleased migration set and must be reviewed against the deployment database before promotion.
