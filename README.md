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
- [Repository audit](docs/AUDIT.md) — current evidence, launch risks, and native verification exit criteria.
- [Native verification prompt](docs/VERIFY-NATIVE-RELEASE-PROMPT.md) — executable instructions for a local release-verification agent.
- [Release checklist](docs/RELEASE_CHECKLIST.md) — pre-deploy gates, expected local failures, and the go/no-go decision.
- [Migration inspection](docs/MIGRATION_INSPECTION.md) — pre-deploy `migrations` table export, comparison, and duplicate-migration handling.
- [Phase 1 acceptance gate](docs/PHASE-1-ACCEPTANCE.md) — executable foundation checks and Phase 2 entry criteria.
- [Domain language](CONTEXT.md) — canonical vocabulary for product, engineering, and implementation work.
- [Wayfinder map](.wayfinder/Universal%20School%20Management%20Platform%20%E2%80%94%20CMS%20%2B%20ERP.md) — the original decision map and its resolved tickets.

## Current baseline

- **Stack** — Laravel 13, Inertia.js 3, React 19, TypeScript, Tailwind CSS 4, MySQL, Pint, PHPStan level 7. Responsive web only for V1.
- **Market** — Saudi-first launch, fully bilingual Arabic/English with RTL and LTR layouts, with a path to GCC and international organizations.
- **Tenancy** — hybrid-ready Organization → School → Branch model; database-level tenant ownership for schools and branches, and an explicit current-organization scope on every tenant-owned model.
- **Deployment modes** — shared SaaS with strict data isolation, or a dedicated isolated deployment per client, from one codebase.
- **Delivered** — public bilingual CMS with draft/publish and audit, admissions pipeline, SIS identity slice (students, guardians, links), academic structure, enrollment, teacher assignments, attendance and reporting with CSV export, assessments and report cards, guardian/teacher/student portals, scheduling and exams, finance (invoices, installments, receipts, reports), and bilingual notifications.
- **Finance baseline** — Stripe is the first payment provider, with signed webhooks, replay idempotency, and immutable receipts.
- **Deferred** — ZATCA e-invoicing and additional Saudi payment gateways are Phase 4, after the Phase 3 finance workflows are proven.
- **Quality gates** — `bash scripts/verify-native-release.sh` runs the full sequence: dependency install, disposable-database migration and rollback validation, Wayfinder generation, frontend lint/types/build, Pint, PHPStan, the test suite, and the strict release check. Per-step evidence lands in `.verification/<run-id>/`. CI runs it via `.github/workflows/native-release.yml`.
- **Launch decision** — see [docs/FINAL_PRE_LAUNCH_REVIEW.md](docs/FINAL_PRE_LAUNCH_REVIEW.md). Code-level gates pass; the remaining blockers are deployment-time configuration and migration-table inspection, not implementation.
- **Detail** — [docs/PRODUCT.md](docs/PRODUCT.md) for scope and workflows, [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for system shape, [docs/ROADMAP.md](docs/ROADMAP.md) for phase order and exit criteria.

### Saudi payment gateway roadmap

Phase 3 finance is proven on Stripe first. The remaining Saudi gateways enter in
Phase 4, in dependency order, after Stripe reconciliation and reporting are
stable.

| Gateway                     | Phase     | Prerequisite                                                  | Integration surface                                                             |
| --------------------------- | --------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| ZATCA e-invoicing (Fatoora) | Phase 4   | Stable receipts and immutable invoice numbering               | QR generation, TLV encoding, invoice/credit-note submission, phase-2 compliance |
| Moyasar                     | Phase 4.1 | Payment-provider abstraction behind the Stripe implementation | Redirect and Apple Pay gateway, same webhook reconciliation path                |
| Tap                         | Phase 4.2 | Moyasar proven in production traffic                          | Redirect gateway, same webhook reconciliation path                              |
| HyperPay                    | Phase 4.3 | Moyasar and Tap proven; acquirer agreement signed             | Hosted gateway, same webhook reconciliation path                                |

Every gateway must reuse the same payment-intent, webhook-signature, replay
idempotency, and immutable-receipt behavior already proven on Stripe. Full
detail is in [docs/ROADMAP.md](docs/ROADMAP.md).
