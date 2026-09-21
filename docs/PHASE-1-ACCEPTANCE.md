# Phase 1 acceptance gate

This checklist is the release gate for the platform foundation. It converts the roadmap exit criteria into repeatable evidence and identifies the conditions required before Phase 2 MVP work begins.

## Execution commands

Run these commands from the project root in a PHP-enabled development environment:

```bash
composer install
npm install
php artisan migrate:fresh --seed
php artisan foundation:smoke
php artisan test
npm run types:check
npm run build
```

The seed command is intentionally restricted to local and testing environments. Never run `migrate:fresh --seed` against a shared or production database.

## Acceptance checklist

| Area | Acceptance condition | Evidence | Status |
| --- | --- | --- | --- |
| Bootstrap | Laravel, Inertia, React, TypeScript, Tailwind, and MySQL configuration loads successfully. | `php artisan about`, `npm run build` | Pending runtime validation |
| Schema | Organization, School, Branch, users, audit, media, jobs, and failed-jobs tables migrate successfully. | `php artisan migrate:fresh --seed` | Pending runtime validation |
| Tenant isolation | Tenant-owned model queries resolve only the active Organization. | `TenantFoundationTest`, `AuditFoundationTest`, `MediaFoundationTest` | Implemented; runtime pending |
| Referential integrity | A Branch cannot reference a School belonging to another Organization. | `TenantFoundationTest` | Implemented; runtime pending |
| Authentication context | Authenticated routes bind and then clear `currentOrganization`. | `TenantFoundationTest` | Implemented; runtime pending |
| Authorization | Role gates combine role and Organization ownership; platform operators use an explicit override. | `AuthorizationFoundationTest` | Implemented; runtime pending |
| Localization | English and Arabic resolve per request and expose LTR/RTL metadata. | `LocalizationFoundationTest`, `InertiaContextTest` | Implemented; runtime pending |
| Shared UI | React receives typed user, organization, capability, locale, and direction data. | `npm run types:check`, `npm run build` | Implemented; runtime pending |
| Audit | High-value events preserve actor, tenant, target, before/after data, and request metadata; records cannot be changed or deleted. | `AuditFoundationTest` | Implemented; runtime pending |
| Queue context | Tenant-aware jobs restore organization context and clear it after execution. | `QueueFoundationTest` | Implemented; runtime pending |
| Media security | Files are private, organization-owned, and downloadable only through authenticated signed URLs. | `MediaFoundationTest` | Implemented; runtime pending |
| Operations | Readiness reports database, storage, and queue status without secrets. | `HealthCheckTest`, `GET /health/ready` | Implemented; runtime pending |
| Development setup | Demo fixtures are idempotent and never seeded automatically in production. | `DemoSchoolSeeder`, `DatabaseSeeder`, `foundation:smoke` | Implemented; runtime pending |

## Phase 2 entry criteria

Phase 2 may begin only when the runtime validation statuses above are confirmed in a PHP- and Node-enabled environment, the smoke command succeeds after a clean migration, and the following operational choices are recorded:

1. The local development database and queue driver are documented for the team.
2. A supported storage disk and media retention policy are selected for the first deployment environment.
3. The public School hostname/subdomain strategy is approved for CMS and admissions routing.
4. The initial School Admin workflow is approved, including who can publish public content and accept applications.
5. The first Phase 2 data model slice is agreed: CMS pages, media ownership, admissions applications, Students, Guardians, and Academic Years.
6. No unresolved Phase 1 security or tenant-isolation failure remains open.

## Evidence retention

Attach the output of the smoke command, PHPUnit result, TypeScript check, and production build to the Phase 1 review record. Any failure must identify the affected invariant, reproduction command, owner, and remediation decision before the gate can be marked complete.
