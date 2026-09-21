# Validation strategy

## Documentation traceability

| Requirement area | Product definition | Architecture baseline | Roadmap gate | Decision source |
| --- | --- | --- | --- | --- |
| Saudi-first, modular compliance | Product purpose and quality requirements | Localization and deferred choices | Phase 4 | Launch-market decision |
| Hybrid-ready tenancy | Goals and personas | Tenant isolation model | Phase 1 | Tenancy decision |
| Core-operations V1 | Scope by delivery stage | Core modules | Phases 2 and 3 | V1 scope decision |
| Stripe-first billing | Finance and parent portal | Payments seam | Phase 3 | Payments decision |
| Responsive web only | Non-goals and parent portal | REST integration direction | Phase 3 | Mobile-scope decision |

## Phase-level acceptance scenarios

### Tenant isolation

- A user from Organization A cannot discover, read, update, export, or receive a record from Organization B through pages, routes, background jobs, reports, or provider callbacks.
- A scoped unique value may be reused by a different Organization only where the domain allows it.
- A dedicated deployment remains compatible with the same tenant-aware behavior without relying on shared-SaaS assumptions.

### Authorization and audit

- A Teacher can manage attendance and grades only for assigned classes and cannot approve finance actions.
- A Guardian sees only linked Students and only information published or permitted by the School.
- Finance and grade changes create readable audit entries with the actor, scope, action, target, time, and relevant before/after data.

### Localization and public site

- Arabic and English content are independently editable and render the selected locale without overwriting each other.
- Core screens function in both RTL and LTR layout directions without mirrored-control defects.
- A public admissions form resolves to the correct School and creates an internal Application in that School’s scope.

### Finance and payment lifecycle

- An invoice may only be paid by an authorized Guardian through a valid provider flow.
- Stripe webhook signatures are verified; duplicate, delayed, or forged callbacks are idempotent and do not corrupt invoice balances.
- A confirmed payment creates an authorized receipt and appears in scoped finance reporting.

### Academic and portal behavior

- An accepted Application becomes an Enrollment only after required validation and authorization.
- Attendance, grades, and report cards remain restricted to the Student, Guardian, and Staff relationships authorized by the School.
- The parent portal remains usable on supported responsive layouts and does not expose staff-only capabilities.

## Delivery gate evidence

Each phase must provide automated tests for its authorization and data-integrity rules, integration tests for its module seams, and end-to-end coverage for the user journeys introduced in that phase. Deployment readiness additionally requires documented backup/restore verification, monitoring and alerting checks, secure secret handling, and a review of unresolved decisions that affect the release.

The executable Phase 1 checklist, evidence commands, and Phase 2 entry criteria are maintained in [PHASE-1-ACCEPTANCE.md](PHASE-1-ACCEPTANCE.md).
