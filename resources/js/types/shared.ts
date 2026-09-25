import type { BreadcrumbItem } from './navigation';

export type LocaleDirection = 'ltr' | 'rtl';

export type SharedLocale = {
    label: string;
    direction: LocaleDirection;
};

export type SharedUser = {
    id: number;
    name: string;
    email: string;
    role: string | null;
};

export type SharedOrganization = {
    id: number;
    name: string;
    slug: string;
};

export type SharedAbilities = {
    manageOrganization: boolean;
    manageFinance: boolean;
    recordAttendance: boolean;
    canAccessSchedule: boolean;
    manageSiteContent: boolean;
    manageSchedule: boolean;
    publishSchedule: boolean;
    manageAdmissions: boolean;
    manageEnrollment: boolean;
    manageUsers: boolean;
    manageContent: boolean;
    manageTheme: boolean;
    managePlatformTheme: boolean;
    viewAttendanceReports: boolean;
};

export type SharedSchool = {
    id: number;
    name: string;
};

export type SharedPageProps = {
    name: string;
    /** False when the registration route is not registered at all. */
    canRegister: boolean;
    locale: string;
    direction: LocaleDirection;
    locales: Record<string, SharedLocale>;
    auth: {
        user: SharedUser | null;
        organization: SharedOrganization | null;
        abilities: SharedAbilities;
        schools: SharedSchool[];
    };
    /** One-shot messages flashed by the request that produced this page. */
    flash: {
        success?: string | null;
        error?: string | null;
        /** Schedule conflicts the client translates from their codes. */
        conflicts?: SharedConflict[] | null;
    };
};

export type SharedConflict = {
    code: string;
    severity: string;
    params: Record<string, unknown>;
};

export type LayoutProps = {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
    description?: string;
    active?: string;
    className?: string;
    variant?: string;
    [key: string]: any;
};
