import {
    CalendarDays,
    ClipboardList,
    CreditCard,
    FileText,
    GraduationCap,
    Inbox,
} from 'lucide-react';
import type { ComponentType } from 'react';

export type WidgetIcon = ComponentType<{
    size?: number;
    'aria-hidden'?: boolean;
}>;

export const QUICK_ACTION_META: Record<
    string,
    { key: string; icon: WidgetIcon }
> = {
    take_attendance: { key: 'dashboard.takeAttendance', icon: ClipboardList },
    view_applications: { key: 'dashboard.viewApplications', icon: Inbox },
    manage_finance: { key: 'dashboard.manageFinance', icon: CreditCard },
    manage_timetable: {
        key: 'dashboard.manageTimetable',
        icon: CalendarDays,
    },
    manage_exams: { key: 'dashboard.manageExams', icon: FileText },
    manage_academics: {
        key: 'dashboard.manageAcademics',
        icon: GraduationCap,
    },
};

/** Turns an audit action such as `student.account_linked` into `Account linked`. */
export function humanizeAction(action: string): string {
    const verb = action.split('.').pop() ?? action;
    const readable = verb.replace(/_/g, ' ');

    return readable.charAt(0).toUpperCase() + readable.slice(1);
}

export function minorToMajor(amountMinor: number): number {
    return Math.round(amountMinor) / 100;
}

export function formatMinor(
    amountMinor: number,
    locale: string,
    currency = 'SAR',
): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
    }).format(minorToMajor(amountMinor));
}

export function subjectLabel(
    item: { subject_name_en: string | null; subject_name_ar: string | null },
    isArabic: boolean,
): string | null {
    return isArabic
        ? (item.subject_name_ar ?? item.subject_name_en)
        : (item.subject_name_en ?? item.subject_name_ar);
}
