# Delivery roadmap

Each phase is a release gate, not only a feature list. Work may be parallelized within a phase once the stated dependencies are satisfied, but a phase is not complete until its exit criteria are demonstrated.

| Phase | Objective                                                  | Depends on                       |
| ----- | ---------------------------------------------------------- | -------------------------------- |
| 0     | Establish a shared product and engineering baseline.       | Confirmed product direction      |
| 1     | Build secure, tenant-aware application foundations.        | Phase 0                          |
| 2     | Deliver the public-site, admissions, and core SIS MVP.     | Phase 1                          |
| 3     | Deliver V1 finance, academics, and parent responsive web.  | Phase 2                          |
| 4     | Add Saudi compliance and prioritized expansion capability. | Proven Phase 3 finance workflows |

## Phase 0: Product and technical foundation

**Deliverables:** project overview, product definition, domain glossary, architecture baseline, decision register, validation strategy, implementation backlog structure, and acceptance criteria.

**Entry criteria:** Saudi-first launch, hybrid-ready tenancy, MySQL application scoping, Stripe-first payments, responsive-web V1, and Phase 4 ZATCA timing are confirmed.

**Exit criteria:** every planned V1 capability is either defined in the product documentation, marked deferred in the decision register, or represented by a future Wayfinder decision. The documentation links can be followed from the root README without relying on private conversation context.

## Phase 1: Platform foundation

**Deliverables:** Laravel/Inertia/React/Tailwind application bootstrap; Organization, School, and Branch hierarchy; Tenant Context; authentication; RBAC and policies; audit infrastructure; queues; localization; RTL/LTR UI foundations; media security; development/test environments; and the [Phase 1 acceptance gate](PHASE-1-ACCEPTANCE.md).

**Dependencies:** Phase 0 baseline and a selected hosting/developer environment for implementation.

**Exit criteria:** automated tests prove that users and jobs cannot read or write records outside their Organization; scoped uniqueness and route binding are enforced; Arabic and English layouts render in both directions; authorization-sensitive actions produce audit records; the foundation smoke command succeeds after a clean migration; and the runtime/build checks in the [Phase 1 acceptance gate](PHASE-1-ACCEPTANCE.md) are recorded as passing.

## Phase 2: MVP: Public presence and core SIS

**Deliverables:** per-School public sites; bilingual CMS pages and media; theme and domain configuration; SEO settings; admissions forms and workflow; candidate documents; Student and Guardian records; Academic Years; classes and sections; Enrollment; attendance; staff dashboard; and authorized exports.

**Started:** The first slice adds bilingual CMS Page records with draft/published state and a public Organization/School slug route that renders only published content belonging to the resolved School. CMS administration now supports authorized School/Organization Admin creation, updates, publication, and audit events. Admissions intake now accepts bilingual public applications into a tenant-owned pending workflow with authorized staff status transitions. Student and Guardian records now support explicit tenant-scoped relationships and linked-guardian access checks. Academic Years, Classes, Sections, and Enrollments now provide tenant-safe academic placement with one enrollment per Student and Academic Year. Teacher assignments and section-bound attendance sessions now restrict teachers to assigned sections and enrolled students. Protected staff pages now manage academic years, classes, sections, enrollments, and teacher assignments. Accepting an application now idempotently creates the Student and Guardian relationship while preserving audit history, and accepted applications can be idempotently placed into the School’s Academic Year and Class. The Guardian portal now exposes only linked students, current enrollment summaries, per-student attendance summaries/recent records, and published school notices targeted by school or linked student. Teachers now have an assigned-section workspace with roster-limited attendance entry, recent session history, and audited corrections. Authorized staff now have filtered attendance summaries by date range and tenant-safe CSV export with audit events. Teachers can now record section-scoped assessments, while Guardians see progress summaries only for linked Students. Authorized staff and linked Guardians can now view a printable report card combining enrollment, attendance, and assessments. School administrators can now issue term-scoped immutable report-card snapshots for historical viewing. Linked Guardians and authorized staff can securely download snapshot-specific printable copies, with each download audited. Tenant-scoped in-app notifications are now queued for published notices, recorded assessments, and issued report cards; recipients are limited to linked guardians, delivery is retry-idempotent, and dispatches are audited.

**Dependencies:** Phase 1 tenant, access, locale, storage, queue, and audit foundations.

**Exit criteria:** a prospective family can submit an application on the correct School site; authorized staff can accept it into an Enrollment; a Teacher can record attendance only for assigned classes; and unrelated tenant or Guardian access is rejected.

## Phase 3: V1: Finance, academics, and parent responsive web

**Deliverables:** fee structures; invoices; installments; payment intents; Stripe payment adapter and webhook processing; receipts; outstanding-balance and revenue reporting; grades; report cards; notifications; and a responsive Guardian portal.

**Dependencies:** Phase 2 Student, Guardian, Enrollment, class, and audit foundations; Stripe account, credentials, webhook configuration, and test environment.

**Started:** The finance foundation now provides tenant- and School-scoped fee structures with Saudi Riyal minor-unit amounts, authorized fee management, and auditable invoice issuance for enrolled School students. Invoice line items and totals are snapshotted at issuance so later fee changes do not rewrite historical obligations. Payment intents, installments, receipts, provider adapters, and webhook reconciliation remain the next finance slices.

The Guardian portal now displays only invoices belonging to the authenticated Guardian’s linked Students, with tenant-scoped queries and an audited invoice-view event. Payment initiation and receipt history are now available; receipt downloads remain intentionally deferred to a reporting slice.

Invoices can now be issued as one to twelve scheduled installments. Installment totals are calculated in SAR minor units inside a database transaction, the first installment receives any rounding remainder, and both staff and eligible Guardians can view the schedule.

Eligible Guardians can now create a provider-neutral Stripe payment intent for an unpaid installment. Requests require an idempotency key, reject key reuse across installments, snapshot the outstanding amount, and record an audit event; provider checkout and webhook confirmation remain separate steps.

The Stripe adapter now creates PaymentIntents when `STRIPE_SECRET` is configured and forwards the same idempotency key to Stripe. A CSRF-exempt webhook endpoint verifies the raw request body with `Stripe-Signature` and `STRIPE_WEBHOOK_SECRET`, deduplicates event IDs, and reconciles `payment_intent.succeeded` and `payment_intent.payment_failed` without trusting browser redirects.

Verified successful payments now create one immutable receipt per PaymentIntent, update installment and invoice state transactionally, and queue a deduplicated in-app success notification. Guardians can view their linked students’ receipt history; receipt downloads remain a subsequent reporting slice.

Guardians and authorized Finance Staff can now download receipt-specific printable HTML documents through relationship- and school-scoped authorization, with each download audited. Finance Staff can also view and export tenant-scoped outstanding installment balances with due dates, paid amounts, and remaining balances.

The Finance reconciliation page now summarizes collected revenue from immutable receipts, receipt count, failed PaymentIntent count and amount, and outstanding balances, alongside the detailed outstanding-installment table and CSV export. Receipt output remains printable HTML until a PDF runtime is added to the application deployment.

Finance Staff can now create a new idempotent Stripe retry for a failed PaymentIntent, or manually match a verified external payment reference against an outstanding installment. Manual matches are amount-bounded, reference-deduplicated, transactionally update installment and invoice state, issue an immutable manual receipt, and record an audit event.

The Finance page now includes a failed-payment queue with a visible Retry action. A scheduled `finance:send-installment-reminders` command runs daily at 07:00 and queues deduplicated tenant-scoped in-app reminders for installments due tomorrow or already overdue, only to linked Guardians.

Notification preferences now let each authenticated user enable or disable categories and choose English or Arabic. Queued installment and payment notifications resolve localized templates at delivery time, so preference changes apply without rewriting existing notifications.

Important financial notifications can now also be queued as bilingual email messages when a mail transport is configured. Email delivery records track `queued`, `sent`, and `failed` states, attempts, timestamps, recipient, locale, and dedupe key; email preference changes are independent from the in-app channel.

Organization Admins, School Admins, and Finance Staff can now review the latest email delivery records in a protected monitoring page. Failed emails can be manually resent, with the delivery status reset to `queued` and an `notification.email_resent` audit event recorded.

Delivery monitoring now includes 24-hour email metrics, database queue backlog, recent failed jobs, and worker heartbeat timestamps. `queue:heartbeat` records worker liveness, while the hourly `queue:check-health` command sends deduplicated bilingual alerts when backlog, failed-job, or stale-worker thresholds are exceeded.

Automated Feature coverage now protects localized email delivery, disabled-channel preferences, delivery idempotency, organization isolation in monitoring, heartbeat upserts, and queue-health alert fan-out to authorized administrators.

Finance workflow coverage now verifies rounding-safe invoice installment totals, Guardian rejection for unlinked student payments, signed Stripe webhook processing, and duplicate webhook idempotency with a single immutable receipt.

Authorization coverage now verifies cross-organization Finance report rejection, Guardian access only to explicitly linked same-tenant Students, notification ownership on read actions, and delivery resend isolation across organizations.

Negative Finance coverage now verifies invalid installment counts, due dates before issue dates, zero and over-limit manual payments, and idempotency-key reuse across different installments.

Notification and Queue failure coverage now verifies SMTP exceptions mark deliveries as `failed` and rethrow for worker retry, in-app deduplication, and stale-worker heartbeat alerts.

Finance reporting regression coverage now verifies printable linked-receipt downloads, rejection of unlinked Guardian receipt access, partial-installment remaining balances, and exclusion of paid installments from outstanding reports.

Scheduler integration coverage now verifies registration of daily reminder and hourly health commands, due/overdue unpaid installment targeting, delivery-health thresholds, and stable unique IDs for repeated reminder jobs.

Audit integrity coverage now verifies that audit records cannot be updated or deleted, queue-originated notification events retain explicit tenant attribution without an actor, and manual payment events retain the authorized user, external reference, and amount metadata.

The code-quality review cleaned unused imports and unused test bindings, verified referenced route names against `routes/web.php`, and confirmed the unique notification job contract and scheduler test fixtures are consistent with the application APIs.

Deployment readiness now includes production queue, scheduler, Stripe webhook, heartbeat, cache, migration, smoke-check, and rollback guidance in `docs/DEPLOYMENT.md`, plus explicit environment variables for queue and notification health thresholds.

The release gate now includes `php artisan app:release-check` and a production launch checklist covering required secrets, database and cache readiness, persistent workers, scheduler ownership, Stripe replay protection, smoke tests, monitoring, and go/no-go criteria.

Security hardening now adds baseline response headers, an IP-based Stripe webhook rate limiter, secure session-cookie configuration variables, and regression tests for the headers and limiter registration.

Database integrity review identified duplicate generated organization, school, branch, and user-tenant migrations. Those later artifacts are now explicit no-op migrations; canonical ownership remains with the original foundation migrations. Unique constraints for payment intents, webhook events, and receipts were verified and documented in `docs/DATABASE_INTEGRITY.md`.

The final pre-launch review is documented in `docs/FINAL_PRE_LAUNCH_REVIEW.md`. Current status is **NO-GO until PHP runtime validation, migrations, full tests, static analysis, production-like release checks, and deployment-database migration inspection are completed**.

Delivery monitoring now includes 24-hour queued, failed, sent, and average send-time metrics. Configurable hourly thresholds alert Organization and School Admins through deduplicated bilingual in-app notifications when failed or queued email volume crosses the configured limit.

**Exit criteria:** an authorized Guardian can pay the correct invoice; duplicate or forged provider callbacks do not alter balances; Finance Staff can reconcile and report payments; grade publication respects authorization; and the parent portal exposes only linked Student records.

## Phase 4: Saudi compliance and expansion

**Deliverables:** ZATCA integration; HR Staff records and leave; analytics dashboards; selected additional payment providers; and approved optional modules.

**Dependencies:** Phase 3 finance controls are proven in production-like testing; ZATCA credentials and certification requirements are available; each selected expansion item has a separate scope decision.

**Exit criteria:** compliance flows are tested against the applicable ZATCA environment; each new adapter passes the same billing contract tests as Stripe; and optional modules preserve tenant, locale, authorization, and audit invariants.

## Deferred work

Payroll, native mobile applications, library management, transport, cafeteria/inventory, LMS, and market-specific integrations are not scheduled until product priority and acceptance criteria are approved. Adding one requires a decision-register update and a scope-specific delivery plan.
