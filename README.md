# Universal School Management Platform

The Universal School Management Platform is a reusable school product that joins a public, configurable CMS with internal school operations. It is designed for a Saudi-first launch, with bilingual Arabic and English experiences, RTL and LTR layouts, and a path to serve GCC and international organizations.

The product supports two deployment modes from one tenant-aware codebase:

- **Shared SaaS:** multiple organizations operate in one platform installation with strict data isolation.
- **Dedicated deployment:** a client receives an isolated deployment and database when contractual, regulatory, or customization needs require it.

The current project phase is **Phase 3: V1 implementation**, with the public CMS, admissions, SIS, teaching operations, portals, reporting, notifications, and finance foundations under active development.

## Who this is for

- **Platform operators** manage organizations and shared platform capabilities.
- **School administrators** manage a school or branch, its public site, people, and daily operations.
- **Teachers and finance staff** perform only the workflows assigned to their roles.
- **Parents and guardians** use a responsive web portal to view authorized information and pay fees.
- **Prospective families** discover a school and submit admissions enquiries through its public site.

## Documentation

- [Product definition](docs/PRODUCT.md) — audience, scope, workflows, roles, and non-functional requirements.
- [Architecture](docs/ARCHITECTURE.md) — system shape, tenant isolation, module seams, security, and integrations.
- [Delivery roadmap](docs/ROADMAP.md) — Phase 0 through Phase 4, dependencies, and exit criteria.
- [Decision register](docs/DECISIONS.md) — confirmed assumptions, deferred choices, and links to their source decisions.
- [Validation strategy](docs/VALIDATION.md) — traceability and phase-level acceptance scenarios.
- [Phase 1 acceptance gate](docs/PHASE-1-ACCEPTANCE.md) — executable foundation checks and Phase 2 entry criteria.
- [Domain language](CONTEXT.md) — canonical vocabulary for product, engineering, and implementation work.
- [Wayfinder map](.wayfinder/Universal%20School%20Management%20Platform%20%E2%80%94%20CMS%20%2B%20ERP.md) — the original decision map and its resolved tickets.

## Current baseline

The first commercial release is Saudi-first, uses a hybrid-ready tenancy model, and is built with Laravel 13, Inertia.js 3, React 19, TypeScript, Tailwind CSS 4, and MySQL. V1 is responsive web only. Stripe is the first payment provider, and ZATCA integration is scheduled after core finance workflows are proven.

Phase 1 implementation has started with the Laravel application bootstrap and the Organization → School → Branch hierarchy. Tenant-owned models use an explicit current-organization scope, and the database enforces organization ownership for schools and branches. The authorization baseline now includes platform, organization, school, finance, and teacher roles with tenant-aware gates. Localization now resolves English and Arabic per request, exposes RTL/LTR metadata to Inertia, and restores the application locale after each request. Immutable, tenant-scoped audit logging now records actors, targets, before/after payloads, request metadata, and platform-level events. Tenant-aware queue middleware now restores organization context for background jobs and clears it after execution, with database and failed-job tables available for durable queue processing. The shared Inertia shell now exposes a typed user, organization, capability, locale, and direction contract for React layouts, applies document `lang`/`dir`, and includes a persistent locale switcher. Media metadata is organization-scoped, private files use the local private disk, and downloads require authenticated signed URLs. Operational readiness now checks database connectivity, private storage writability, and queue configuration through a safe `/health/ready` endpoint. Local and testing environments have idempotent demo fixtures plus a guarded `foundation:smoke` command for schema and hierarchy verification.

Phase 2 has now started with the public CMS foundation: bilingual School pages, draft/published state, and tenant-safe public routes keyed by Organization and School slugs. Authorized School and Organization Admins can create, update, publish, and audit page content through the protected CMS administration routes. Public admissions applications now create tenant-owned pending records, while authorized school staff can review and transition application status with audit events. The SIS identity slice now includes tenant-scoped Students, Guardians, explicit relationship metadata, and linked-guardian student access checks. Academic Years, Classes, Sections, and Enrollments now provide school-safe academic placement and prevent duplicate yearly enrollment. Teacher assignments and attendance recording now enforce section assignment and active enrollment boundaries. Staff can manage academic structure, enrollments, and teacher assignments through protected Inertia operations pages. Accepting an application now creates the Student and Guardian relationship exactly once and records the conversion audit event; accepted applications can then be assigned to an Academic Year and Class without duplicate enrollment. Guardians now have a protected portal showing only linked students, current enrollment summaries, attendance summaries, and published whole-school or linked-student notices. Teachers now have a protected workspace showing only assigned sections and their active rosters, with attendance entry, recent history, and audited correction controls. Authorized staff now have a filtered attendance reporting page and CSV export, while teachers remain limited to assigned sections. Teachers can record section-scoped assessments, and Guardians can see progress summaries only for linked Students. Authorized staff and linked Guardians can now view a printable report card combining enrollment, attendance, and assessments. School administrators can issue term-scoped immutable report-card snapshots so historical reports remain stable after later data corrections. Linked Guardians and authorized staff can download snapshot-specific printable copies, with every download recorded in the audit log. The notification inbox now stores tenant-scoped in-app messages and queues notice, assessment, and report-card events only to eligible linked guardians; delivery is retry-idempotent and audited. Phase 3 finance foundations now include School-scoped fee structures, SAR minor-unit pricing, authorized finance administration, auditable invoice issuance with snapshotted line items and totals, Guardian invoice visibility limited to linked Students with audit logging on invoice views, transactional one-to-twelve installment schedules with rounding-safe minor-unit allocation, provider-neutral payment intent initiation for eligible Guardians with idempotency protection and audit logging, Stripe PaymentIntent creation when configured, signed idempotent webhook reconciliation for success and failure events, immutable receipts per successful PaymentIntent, Guardian payment history, secure receipt downloads, Finance Staff outstanding-balance reports with CSV export, a reconciliation dashboard summarizing collected revenue, failed payments, and open balances, failed-payment retry, bounded manual payment matching, a visible failed-payment queue, scheduled due/overdue Guardian reminders, bilingual per-user notification preferences, queued bilingual email delivery with auditable delivery status, protected delivery monitoring with manual resend auditing, 24-hour delivery metrics, configurable failure/queue thresholds, and scheduled bilingual administrator alerts.

See [the roadmap](docs/ROADMAP.md) for the order in which these commitments become deliverable software.

Queue worker observability now includes worker heartbeats, queue backlog, recent failed jobs, stale-worker detection, configurable thresholds, and hourly bilingual administrator alerts.

Automated Feature coverage now covers localized email delivery, disabled notification channels, delivery idempotency, organization isolation in monitoring, queue worker heartbeat upserts, and threshold-based administrator alerts.

Finance workflow tests now cover rounding-safe invoice installments, Guardian access isolation, signed Stripe webhook reconciliation, and duplicate webhook idempotency.

Authorization and tenant-isolation tests now cover cross-organization Finance reports, Guardian student links, notification ownership, and delivery resend boundaries.

Negative Finance tests now cover invalid installment counts, invalid due dates, zero or over-limit manual payments, and idempotency-key reuse across installments.

Notification and Queue failure tests now cover SMTP exceptions, failed delivery state transitions, queue retry propagation, in-app deduplication, and stale-worker alerts.

Finance reporting regression tests now cover printable linked receipts, Guardian receipt isolation, partial-payment balances, and paid-installment exclusion from outstanding reports.

Scheduler integration tests now cover daily installment reminders, hourly notification and queue health commands, threshold behavior, and stable unique IDs for repeated reminder jobs.

Audit integrity tests now cover immutable audit records, explicit tenant attribution for queued notifications, and complete metadata for manual payment reconciliation.

A static code-quality review cleaned unused test imports and bindings, verified route references, and reviewed the unique notification job and scheduler integrations against the current Laravel APIs.

Production deployment guidance is available in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md), covering migrations, config cache, persistent queue workers, scheduler setup, worker heartbeats, Stripe webhooks, smoke checks, and rollback safeguards.

Before production launch, run `php artisan app:release-check` and review [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md). The gate checks production configuration, required tables, asynchronous queues, database connectivity, Stripe secret pairing, and critical operational prerequisites.

Security hardening includes baseline security headers, IP-based Stripe webhook throttling, secure session-cookie settings, and regression tests for the protections.

Database integrity findings and migration ownership are documented in [`docs/DATABASE_INTEGRITY.md`](docs/DATABASE_INTEGRITY.md). Duplicate generated hierarchy migrations were neutralized as no-ops so fresh installs retain one canonical schema owner.

The consolidated launch decision and remaining Go/No-Go gates are documented in [`docs/FINAL_PRE_LAUNCH_REVIEW.md`](docs/FINAL_PRE_LAUNCH_REVIEW.md). Current status is **NO-GO until the project runtime executes migrations, tests, static analysis, and production-like release checks**.
