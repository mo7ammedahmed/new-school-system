import { usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    BookOpen,
    BookOpenCheck,
    Briefcase,
    Calendar,
    CalendarDays,
    CheckSquare,
    ClipboardList,
    FileText,
    GraduationCap,
    KeyRound,
    LayoutGrid,
    List,
    Megaphone,
    Paintbrush,
    Palette,
    Settings2,
    ShieldCheck,
    Truck,
    UserPlus,
    Users,
    UsersRound,
    WalletCards,
} from 'lucide-react';
import { useT } from '@/hooks/useT';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import type { SharedAbilities, SharedPageProps } from '@/types/shared';

export type NavSection = {
    key: string;
    label: string;
    items: NavItem[];
};

export type Navigation = {
    sections: NavSection[];
    /** Every destination the current user may reach, in sidebar order. */
    flat: NavItem[];
};

/**
 * Builds the application navigation from the user's server-provided abilities
 * and the registered school routes. Every entry here resolves to a real route;
 * the server re-authorizes each request regardless of what is rendered.
 */
export function useNavigation(): Navigation {
    const { t } = useT();
    const { auth } = usePage<SharedPageProps>().props;
    const abilities: Partial<SharedAbilities> = auth?.abilities ?? {};
    const user = auth?.user;
    const school = auth?.schools?.[0];
    const base = school ? `/admin/schools/${school.id}` : null;

    const platform: NavItem[] = [
        {
            title: t('shell.dashboard'),
            shortTitle: t('shell.dashboardShort'),
            href: dashboard(),
            icon: LayoutGrid,
        },
    ];

    const administration: NavItem[] = [];

    if (base && abilities.manageEnrollment) {
        platform.push(
            {
                title: t('shell.students'),
                shortTitle: t('shell.studentsShort'),
                href: '/portal/students',
                icon: Users,
            },
            {
                title: t('shell.guardians'),
                href: `${base}/guardians`,
                icon: UsersRound,
            },
        );
    }

    if (base && abilities.manageEnrollment) {
        administration.push(
            {
                title: t('shell.academicYears'),
                href: `${base}/academic-years`,
                icon: Calendar,
            },
            {
                title: t('shell.classes'),
                href: `${base}/academic-classes`,
                icon: GraduationCap,
            },
            {
                title: t('shell.sections'),
                href: `${base}/sections`,
                icon: List,
            },
            {
                title: t('shell.enrollments'),
                href: `${base}/enrollments`,
                icon: ClipboardList,
            },
            {
                title: t('shell.teacherAssignments'),
                href: `${base}/teacher-assignments`,
                icon: Briefcase,
            },
            {
                title: t('shell.academics'),
                href: `${base}/academics`,
                icon: BookOpen,
            },
        );
    }

    if (base && abilities.manageAdmissions) {
        administration.push({
            title: t('shell.admissions'),
            href: `${base}/applications`,
            icon: UserPlus,
        });
    }

    if (base && abilities.manageSchedule) {
        administration.push(
            {
                title: t('shell.scheduleSetup'),
                href: `${base}/schedule/setup`,
                icon: Settings2,
            },
            {
                title: t('shell.timetable'),
                href: `${base}/schedule/timetable`,
                icon: CalendarDays,
            },
            {
                title: t('shell.exams'),
                href: `${base}/schedule/exams`,
                icon: FileText,
            },
        );
    }

    if (base && abilities.manageFinance) {
        administration.push(
            {
                title: t('shell.finance'),
                shortTitle: t('shell.financeShort'),
                href: `${base}/finance`,
                icon: WalletCards,
            },
            {
                title: t('shell.financeReports'),
                href: `${base}/reports/finance`,
                icon: BarChart3,
            },
        );
    }

    if (base && abilities.viewAttendanceReports) {
        administration.push({
            title: t('shell.attendanceReports'),
            href: `${base}/reports/attendance`,
            icon: CheckSquare,
        });
    }

    if (base && abilities.manageContent) {
        administration.push(
            {
                title: t('shell.notices'),
                shortTitle: t('shell.noticesShort'),
                href: `${base}/notices`,
                icon: Megaphone,
            },
            {
                title: t('shell.pages'),
                href: `${base}/pages`,
                icon: FileText,
            },
        );
    }

    if (base && abilities.manageTheme) {
        administration.push({
            title: t('shell.theme'),
            href: `${base}/theme`,
            icon: Palette,
        });
    }

    if (abilities.managePlatformTheme) {
        administration.push({
            title: t('shell.platformTheme'),
            href: '/admin/theme',
            icon: Paintbrush,
        });
    }

    if (abilities.manageSiteContent) {
        administration.push({
            title: t('shell.siteContent'),
            href: '/admin/site-content',
            icon: Palette,
        });
    }

    if (base && abilities.manageUsers) {
        administration.push(
            {
                title: t('shell.users'),
                href: `${base}/users`,
                icon: ShieldCheck,
            },
            {
                title: t('shell.roles'),
                href: `${base}/roles`,
                icon: KeyRound,
            },
        );
    }

    if (abilities.manageFinance) {
        administration.push({
            title: t('shell.deliveries'),
            href: '/admin/notifications/deliveries',
            icon: Truck,
        });
    }

    const mySpace: NavItem[] = [];

    if (user?.role === 'teacher') {
        mySpace.push({
            title: t('shell.teacherPortal'),
            href: '/portal/teacher',
            icon: BookOpenCheck,
        });
    }

    if (user?.role === 'guardian') {
        mySpace.push({
            title: t('shell.guardianPortal'),
            href: '/portal/guardian',
            icon: UsersRound,
        });
    }

    if (user) {
        mySpace.push({
            title: t('shell.notifications'),
            href: '/portal/notifications',
            icon: Bell,
        });
    }

    const sections: NavSection[] = [
        { key: 'platform', label: t('shell.platform'), items: platform },
        {
            key: 'administration',
            label: t('shell.administration'),
            items: administration,
        },
        { key: 'mySpace', label: t('shell.mySpace'), items: mySpace },
    ];

    return {
        sections: sections.filter((section) => section.items.length > 0),
        flat: sections.flatMap((section) => section.items),
    };
}
