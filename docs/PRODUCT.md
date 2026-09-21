# Product definition

## Product purpose

The platform gives each customer organization a branded public school presence and one place to run core school operations. It connects the journey from a prospective family discovering a school, through admissions and enrollment, to attendance, academic reporting, fees, and parent communication.

The product launches Saudi-first. Arabic and English are equal product languages, and RTL behavior is a product requirement rather than a visual enhancement. Saudi-specific functionality is modular so other markets can be supported without rewriting the core school domain.

## Goals

- Let a school administrator publish and update a public school site without code changes.
- Move admissions enquiries into a controlled internal workflow without re-keying data.
- Give authorized staff a dependable source of truth for students, guardians, classes, attendance, fees, and grades.
- Let parents use responsive web to view permitted information, receive notices, and pay invoices.
- Support shared SaaS and dedicated deployments while keeping one reusable product baseline.

## Non-goals

- Native parent or teacher mobile applications in V1.
- Payroll in V1.
- Library, transport, cafeteria/inventory, and LMS capabilities in V1.
- Country-specific compliance outside the Saudi-first baseline.
- Bespoke curriculum, branding, or integrations for an individual school as part of the reusable core.

## Personas and permissions

| Persona | Scope | Primary capabilities |
| --- | --- | --- |
| Platform Super Admin | Platform | Manage SaaS organizations, platform configuration, and cross-organization oversight. |
| Organization Owner or Admin | Organization | Manage schools, branches, organization configuration, and authorized users. |
| School Admin | School or Branch | Run public-site configuration, admissions, student operations, and local staff access. |
| Finance Staff | Assigned School or Branch | Manage fee structures, invoices, payments, receipts, and finance reports. |
| Teacher | Assigned classes | Record attendance, manage authorized grades, and communicate through approved channels. |
| Guardian | Linked Students | View approved student information, attendance, grades, notices, invoices, and payments. |
| Student | Own record when enabled | View only the academic and communication information granted by the school. |

Authorization always combines a role with the active tenant and the person’s relationship to the record. A role name alone never grants cross-organization or cross-school access.

## Product modules

### CMS and public site

Each School has an independently branded public site. Administrators manage pages, page sections, media, bilingual content, announcements, events, SEO metadata, publishing schedules, and the admissions entry point. A site is available through a platform subdomain and may later use a connected custom domain.

### Admissions and student information

Admissions Intake creates an internal candidate record from a public enquiry or application. Authorized staff then manage the application lifecycle, supporting documents, guardian relationships, acceptance, enrollment, academic year, class or section assignment, and attendance.

### Finance and parent portal

V1 adds fee structures, invoices, installments, payments, receipts, outstanding balances, and financial reporting. Stripe is the first provider, but parents encounter school billing rather than a provider-specific workflow. The responsive parent portal exposes only the guardian’s authorized children, records, notices, invoices, and payment actions.

### Academic records and communication

V1 adds assessment schedules, grades, report cards, and notifications. Staff-to-guardian messaging must remain tenant-scoped, role-scoped, and auditable where school policy requires it.

## Core journeys

1. **Prospective family to application:** a visitor finds a School’s public site, submits an enquiry or application, receives an acknowledgement, and the School Admin sees it in admissions.
2. **Accepted application to enrollment:** an authorized staff member verifies the candidate and documents, accepts the application, links Guardians, and creates an Enrollment in an Academic Year and class or section.
3. **Teacher to parent visibility:** a Teacher records attendance or grades for an assigned class; the platform applies authorization and publication rules before the Guardian can view them.
4. **Invoice to receipt:** Finance Staff creates a fee obligation and invoice; a Guardian pays through Stripe; the platform records a reconciled payment and issues a receipt without trusting browser redirects as payment proof.
5. **Admin to public content:** a School Admin edits Arabic and English content, previews the localized public page, then publishes it under the School’s theme and domain configuration.

## Scope by delivery stage

| Stage | Included | Explicitly deferred |
| --- | --- | --- |
| Phase 1 foundation | Tenant hierarchy, identity, roles, localization, auditability, queues, shared UI baseline | Business workflows and external providers |
| Phase 2 MVP | CMS, public site, admissions, students, guardians, academic structure, classes, attendance | Finance, grades, parent portal |
| Phase 3 V1 | Billing, Stripe payments, receipts, finance reporting, grades, report cards, parent web portal, notifications | ZATCA integration, native apps, payroll, add-on modules |
| Phase 4 expansion | ZATCA, HR records and leave, analytics, additional gateway adapters, selected add-ons | Payroll and other expansion items until separately approved |

## Quality requirements

- Tenant isolation is enforced in data access and authorization, not only in the user interface.
- Arabic and English content can be managed and delivered without translation data overwriting the other locale.
- Layouts function in both RTL and LTR directions using logical spacing and alignment.
- Finance and grade changes create audit records containing actor, tenant, action, target, timestamp, and relevant before/after values.
- Operational lists remain searchable, pageable, and filterable for large student populations.
- Exports are authorized, scoped, and available in suitable PDF or spreadsheet formats.
