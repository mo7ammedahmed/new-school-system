export type TranslateFn = (
    key: string,
    params?: Record<string, string | number>,
) => string;

export type DayNameFn = (day: number) => string;

export type ExamScheduleItem = {
    id: number;
    title: string;
    title_ar: string | null;
    term: string | null;
    status: string;
    starts_on: string;
    ends_on: string;
    academic_year_id: number;
    academic_year: string | null;
    papers_count: number | null;
    lock_version: number;
};

export type Paper = {
    id: number;
    class_id: number;
    class_name: string | null;
    section_id: number;
    section_name: string | null;
    subject_id: number;
    subject_name_en: string | null;
    subject_name_ar: string | null;
    subject_color: string | null;
    exam_date: string;
    starts_at: string;
    ends_at: string;
    room: string | null;
    max_score: string | null;
    invigilators: Array<{ id: number; name: string; role: string }>;
};

export type AgendaRow = {
    id: number;
    class_name: string | null;
    section_name: string | null;
    subject_name_en: string | null;
    subject_name_ar: string | null;
    starts_at: string;
    ends_at: string;
    room: string | null;
    invigilators: string[];
};

export type Conflict = {
    code: string;
    severity: string;
    params: Record<string, unknown>;
};

export type AcademicYearOption = {
    id: number;
    name: string;
    is_current: boolean;
};

export type ClassOption = { id: number; name: string };

export type SectionOption = { id: number; name: string; class_id: number };

export type SubjectOption = {
    id: number;
    code: string;
    name_en: string;
    name_ar: string;
    color: string | null;
};

export type TeacherOption = { id: number; name: string };

export type ClassSubjectRow = {
    class_id: number;
    subject_id: number;
    periods_per_week: number;
};

export type ExamCapabilities = {
    manage: boolean;
    publish: boolean;
    delete: boolean;
};

export type ExamPageProps = {
    school: { id: number; name: string };
    schedules: ExamScheduleItem[];
    selectedSchedule: ExamScheduleItem | null;
    academicYears: AcademicYearOption[];
    classes: ClassOption[];
    sections: SectionOption[];
    subjects: SubjectOption[];
    teachers: TeacherOption[];
    classSubjects: ClassSubjectRow[];
    workingDays: number[];
    papers: Paper[];
    calendar: Record<string, number>;
    selectedDate: string | null;
    dayAgenda: AgendaRow[];
    coverageWarnings: Conflict[];
    can: ExamCapabilities;
    flash?: {
        success?: string | null;
        error?: string | null;
        conflicts?: Conflict[] | null;
    };
};

export const conflictKeys: Record<string, string> = {
    EXAM_OUTSIDE_WINDOW: 'errors.examOutsideWindow',
    EXAM_NON_WORKING_DAY: 'errors.nonWorkingDay',
    SECTION_TOO_MANY_PAPERS_PER_DAY: 'errors.sectionTooManyExams',
    SECTION_TIME_OVERLAP: 'errors.examTimeOverlap',
    ROOM_DOUBLE_BOOKED: 'errors.roomDoubleBooked',
    INVIGILATOR_DOUBLE_BOOKED: 'errors.invigilatorDoubleBooked',
    INVIGILATOR_NOT_A_TEACHER_OF_SCHOOL: 'errors.invigilatorNotTeacher',
    INVIGILATOR_HAS_CLASS: 'warnings.invigilatorHasClass',
    SUBJECT_NOT_IN_CLASS: 'warnings.subjectUnderAllocated',
    MISSING_PAPERS: 'warnings.missingPapers',
};

export function formatHijri(iso: string): string | null {
    try {
        return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(new Date(`${iso}T00:00:00Z`));
    } catch {
        return null;
    }
}

export function subjectLabel(
    paper: { subject_name_en: string | null; subject_name_ar: string | null },
    isArabic: boolean,
): string | null {
    return isArabic
        ? (paper.subject_name_ar ?? paper.subject_name_en)
        : (paper.subject_name_en ?? paper.subject_name_ar);
}

export function scheduleLabel(
    schedule: ExamScheduleItem,
    isArabic: boolean,
): string {
    return isArabic && schedule.title_ar ? schedule.title_ar : schedule.title;
}
