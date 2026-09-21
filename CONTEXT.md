# Universal School Management Platform Context

This glossary defines the product language used across the platform documentation and future implementation. It describes the school-management domain without prescribing database tables or framework details.

## Tenancy and school structure

**Platform**:
The vendor-operated product that hosts or delivers school-management capabilities to customer organizations.
_Avoid_: System, application, product tenant

**Organization**:
A customer owner entity that owns one or more schools and is the primary isolation scope for shared SaaS data.
_Avoid_: Tenant, customer account, school group

**School**:
An educational institution or school brand operated by an Organization. A School owns its public site configuration and its academic operations.
_Avoid_: Tenant, campus

**Branch**:
An optional physical location or operating unit of a School. A Branch may have its own operational configuration while remaining part of its School.
_Avoid_: School, site

**Tenant**:
The runtime data-isolation scope for a request. In shared SaaS mode, the Tenant is an Organization; in a dedicated deployment, the deployment itself is isolated for one Organization.
_Avoid_: User, School, account

## Public presence and admissions

**CMS**:
The public-site and content-management capability used to publish branded school information, media, pages, announcements, and admissions entry points.
_Avoid_: Website, ERP

**Admissions Intake**:
The controlled handoff of a public enquiry or application from the CMS into the school’s internal admissions workflow.
_Avoid_: Lead capture, registration

**Application**:
A prospective learner’s submitted request for admission. An Application may progress to an Enrollment only after the school accepts it.
_Avoid_: Enrollment, enquiry

## School operations

**ERP**:
The authenticated operational capability for school administration, student information, finance, communication, and reporting.
_Avoid_: Dashboard, back office

**Student**:
A learner with an active, historical, or prospective relationship to a School.
_Avoid_: Pupil, child

**Guardian**:
An adult authorized to act for a Student and to access only that Student’s permitted information.
_Avoid_: Parent, contact

**Staff**:
A person engaged by a School to perform operational, teaching, finance, or administrative work.
_Avoid_: Employee, user

**Enrollment**:
A Student’s accepted placement in a School, Branch, academic year, and class or section for a defined period.
_Avoid_: Application, registration

**Academic Year**:
The school-defined period that groups terms, classes, enrollment, attendance, assessments, and reporting.
_Avoid_: Calendar year, session
