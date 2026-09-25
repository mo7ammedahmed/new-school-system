export type TranslateFn = (
    key: string,
    params?: Record<string, string | number>,
) => string;

export type AttendanceTotals = {
    present: number;
    absent: number;
    late: number;
    excused: number;
    recorded: number;
    presentPercentage: number;
};

export type UpcomingExam = {
    id: number;
    exam_date: string;
    starts_at: string | null;
    ends_at: string | null;
    room: string | null;
    class_name: string | null;
    section_name: string | null;
    subject_name_en: string | null;
    subject_name_ar: string | null;
};

export type TimetableEntry = {
    id: number;
    period: number;
    starts_at: string | null;
    ends_at: string | null;
    class_name: string | null;
    section_name: string | null;
    subject_name_en: string | null;
    subject_name_ar: string | null;
    subject_color: string | null;
    teacher_name: string | null;
};

export type OutstandingInstallment = {
    id: number;
    number: string | null;
    student: string;
    studentNumber: string | null;
    sequence: number;
    amountMinor: number;
    paidMinor: number;
    outstandingMinor: number;
    currency: string;
    dueOn: string | null;
    status: string;
};

export type RecentAssessment = {
    id: number;
    title: string;
    assessedOn: string | null;
    sectionName: string | null;
    student: string;
    score: number;
    maxScore: number;
};

export type AssessmentStats = {
    total: number;
    averagePercent: number;
    passRate: number;
    recent: RecentAssessment[];
};

export type AdmissionsPipeline = {
    pending: number;
    reviewing: number;
    accepted: number;
    rejected: number;
    withdrawn: number;
};

export type NoticeItem = {
    id: number;
    title: string;
    publishedAt: string | null;
};

export type ActivityEntry = {
    id: number;
    action: string;
    actor: string | null;
    at: string | null;
};

export type QuickAction = { key: string; href: string };

export type DashboardMetrics = {
    students: { total: number; active: number; inactive: number };
    teachers: { total: number; assigned: number };
    attendanceToday: AttendanceTotals;
    activeClasses: number;
    pendingAdmissions: number;
    outstandingBalances: { amountMinor: number; formatted: string };
    paymentsToday: {
        amountMinor: number;
        count: number;
        formattedAmount: string;
    };
    upcomingExams: UpcomingExam[];
    assessmentStats: AssessmentStats;
};

export type DashboardWidgets = {
    attendanceOverview: { today: AttendanceTotals };
    admissionsPipeline: AdmissionsPipeline;
    financeSummary: {
        income: { today: number; month: number };
        outstandingMinor: number;
        currency: string;
    };
    todaysTimetable: TimetableEntry[];
    recentNotices: NoticeItem[];
    paymentStatus: { successful: number; failed: number; pending: number };
    outstandingInvoices: OutstandingInstallment[];
    notificationActivity: {
        sentToday: number;
        readToday: number;
        deliveredToday: number;
    };
    recentActivity: ActivityEntry[];
    quickActions: QuickAction[];
};

export type DashboardProps = {
    school: { id: number; name: string } | null;
    metrics: DashboardMetrics;
    widgets: DashboardWidgets;
};
