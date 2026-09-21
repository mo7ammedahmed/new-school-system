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
    manageContent: boolean;
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
};
