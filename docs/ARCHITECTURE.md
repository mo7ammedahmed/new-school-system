# Architecture baseline

## Technology direction

The application will use Laravel 13 for the backend, Inertia.js 3 as the web application bridge, React 19 with TypeScript for user interfaces, Tailwind CSS 4 for styling, and MySQL for persistence. Laravel queues process work that must not delay a request, including notifications, exports, invoice jobs, and provider callbacks.

The project begins as a modular monolith. A single deployable application owns the core school domain. Modules expose narrow interfaces inside the application; they are not independent services until there is a demonstrated operational reason to split them.

## System shape

`	ext
Public school site ─────┐
Internal staff dashboard ├── Inertia web application ── Laravel modules ── MySQL
Parent responsive portal ┘              │                     │
                                         │                     ├── Queue workers
                                         │                     ├── Stripe adapter
                                         │                     ├── Notification adapters
                                         │                     └── Future REST integrations
                                         └── Arabic/English and RTL/LTR presentation
`

The public site, staff dashboard, and parent portal may use distinct route groups and layout shells, but they share tenant resolution, localization, authorization, audit, and design foundations.

## Core modules and seams

| Module              | Interface responsibility                                                                   | Implementation responsibility                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tenant Context      | Resolve the active Tenant and expose its permitted Organization, School, and Branch scope. | Hostname, session, route, and deployment resolution; query scoping; scope validation.                                                                        |
| Authorization       | Decide whether an actor may perform an action on a scoped resource.                        | Roles, permissions, policies, relationship checks, and escalation rules.                                                                                     |
| Localization        | Resolve a supported locale and layout direction.                                           | Translation selection, locale-aware formatting, Arabic/English content selection, RTL/LTR layout state.                                                      |
| Public Site         | Read published School content and render a branded public experience.                      | Domain mapping, themes, page sections, media, SEO, publishing state, and caching.                                                                            |
| Admissions          | Accept, review, and convert Applications into Enrollment.                                  | Form validation, documents, workflow states, Guardian linkage, and audit events.                                                                             |
| Student Information | Manage the academic structure and student lifecycle.                                       | Academic Years, classes, sections, Enrollment, attendance, grades, and report-card preparation.                                                              |
| Billing             | Create financial obligations and report their lifecycle.                                   | Fee rules, invoices, installments, receipts, reconciliation, reporting, and tax-ready invoice data.                                                          |
| Payments            | Start and verify provider payments.                                                        | Stripe adapter, signed webhooks, idempotency, retries, provider status mapping, and reconciliation.                                                          |
| Notifications       | Send authorized communications for domain events.                                          | Templates, recipients, delivery adapters, queueing, retries, preferences, and delivery audit.                                                                |
| Reporting           | Produce scoped operational and financial views or exports.                                 | Query composition, access checks, pagination, export jobs, and retention controls.                                                                           |
| Scheduling          | Place lessons and exams in time and expose the resulting calendar.                         | Subjects, teaching assignments, bell schedules, timetable placement rules, exam periods and papers, conflict policy, and the page payloads that render them. |

PaymentProvider is the initial provider seam. Billing requests a provider-neutral payment operation and receives a normalized result; Stripe is the first adapter. Additional gateways are added as adapters only when a real second provider is approved.

### Scheduling module structure

The schedule code lives in one module, pp/Services/Schedule/, with each piece owning exactly one concern:

| Owner                                       | Owns                                                                                                                                                                |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TimetableEngine                             | Timetable placement rules: what may be scheduled where, plus publish/archive.                                                                                       |
| ExamConflictDetector                        | Exam conflict policy: what is a blocking error, what only warns, and how a stored paper becomes its input (inputFor). Returns machine codes, never display strings. |
| ExamCalendarPayload                         | The props the exam calendar page consumes, for both the no-period and selected-period states.                                                                       |
| TimetableEditorPayload                      | The props the timetable editor consumes, including the version and entry serializers.                                                                               |
| SchoolOptions                               | The school-scoped option lists the schedule screens pick from.                                                                                                      |
| App\Http\Responses\ScheduleConflictResponse | How conflict codes reach a client: a JSON 422 body or an Inertia flash.                                                                                             |
| App\Concerns\ResolvesScheduleSchool         | Loading a school, authorizing the ability, and refusing a model from another school.                                                                                |

Data flows one way: a controller resolves and authorizes the school, asks a payload builder for the page's props, and renders; mutations validate through a FormRequest, ask the engine or detector for a domain verdict, then write and audit. Controllers hold no page shapes, no query composition for views, and no conflict-severity knowledge.

Visibility policy for published schedules is owned by model scopes (ExamSchedule::published(), ExamPaper::inPublishedPeriod(), TimetableVersion::published()), not by each query that happens to need it.

## Tenant isolation model

Every school-specific record carries an immutable Organization scope and, when relevant, School and Branch scopes. Tenant Context is established before application data is read or written. Repository queries, route binding, validation rules, policies, background jobs, exports, and webhook processing must all receive or resolve this context.

MySQL constraints and tenant-scoped unique keys prevent common cross-organization collisions. Application query scopes and authorization policies prevent inappropriate reads and writes. Dedicated deployments receive separate application configuration and databases; shared-SaaS code must not rely on dedicated deployment for safety.

Platform-wide administration is an explicit exception path with elevated authorization and audit requirements. It must never be modeled as an unscoped ordinary user query.

## Data ownership and flow

- **Organization** owns Schools, organization-wide configuration, and the tenant scope.
- **School** owns public-site configuration, academic operations, and School-level users.
- **Branch** narrows operational configuration and reporting where a School operates multiple locations.
- **Admissions** owns an Application until an accepted application creates an Enrollment in Student Information.
- **Billing** owns invoice and payment state; a payment provider may report a transaction but cannot directly mutate student or invoice state.
- **Audit** receives immutable change events from finance, grades, authorization-sensitive actions, and other configured high-value workflows.

## Localization and interface design

All editable CMS fields that are visible to the public store Arabic and English values. Shared interface labels use translation resources. Components use logical CSS properties so direction changes do not depend on per-screen overrides. Dates, numbers, and currency are locale-formatted; Hijri support remains a Saudi module decision where a workflow requires it.

## Integration and security rules

- The first external payment adapter is Stripe. Provider webhooks are signature-verified, tenant-resolved safely, idempotent, and processed through controlled jobs.
- REST endpoints are **planned for future** introduction for genuine third-party or future mobile clients;
  outes/api.php does not currently exist. Inertia page actions remain internal application interfaces and are not treated as a public integration contract.
- Authentication, session protections, rate limiting, authorization policies, secure media access, encrypted secrets, and audit records are mandatory baseline controls.
- Sensitive exports, finance actions, and grade publication require explicit authorization and leave an audit trail.
- Backups, restore testing, monitoring, alerting, data residency, retention, and disaster recovery are operational requirements that need concrete targets before production launch.

## Deferred architecture choices

Native mobile clients, additional payment providers, ZATCA transport details, hosting provider, data residency guarantees, and exact retention periods are intentionally deferred. Their future implementation must extend the seams described above rather than bypassing them. See [the decision register](DECISIONS.md).
