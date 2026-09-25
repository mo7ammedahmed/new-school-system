import type { AgendaRow, DayNameFn, TranslateFn } from './types';
import { subjectLabel } from './types';

type ExamDayAgendaProps = {
    selectedDate: string | null;
    hijri: string | null;
    rows: AgendaRow[];
    isArabic: boolean;
    t: TranslateFn;
    dayName: DayNameFn;
};

export default function ExamDayAgenda({
    selectedDate,
    hijri,
    rows,
    isArabic,
    t,
    dayName,
}: ExamDayAgendaProps) {
    return (
        <section
            aria-labelledby="agenda-heading"
            className="border-border bg-card rounded-[1.5rem] border p-6"
        >
            <h2
                id="agenda-heading"
                className="text-foreground text-lg font-semibold"
            >
                {t('exams.selectedDay')}
            </h2>
            <p className="text-foreground mt-1 text-sm font-bold">
                {selectedDate}
                {hijri ? ` · ${hijri}` : ''}
                {selectedDate
                    ? ` · ${dayName(new Date(`${selectedDate}T00:00:00Z`).getUTCDay())}`
                    : ''}
            </p>

            {rows.length === 0 ? (
                <p className="text-foreground mt-4 text-sm">
                    {t('exams.noPapersOnDay')}
                </p>
            ) : (
                <ol className="mt-4 space-y-3">
                    {rows.map((row) => (
                        <li
                            key={row.id}
                            className="border-outline-variant rounded-lg border p-4"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-foreground font-semibold">
                                    {subjectLabel(row, isArabic)}
                                </span>
                                <span
                                    dir="ltr"
                                    className="text-brand-600 text-xs font-bold"
                                >
                                    {row.starts_at} – {row.ends_at}
                                </span>
                            </div>
                            <p className="text-foreground mt-1 text-xs font-bold">
                                {row.class_name} · {t('exams.section')}{' '}
                                {row.section_name}
                                {row.room ? ` · ${row.room}` : ''}
                            </p>
                            {row.invigilators.length > 0 ? (
                                <p className="text-foreground mt-1 text-xs">
                                    {t('exams.invigilators')}:{' '}
                                    {row.invigilators.join('، ')}
                                </p>
                            ) : null}
                        </li>
                    ))}
                </ol>
            )}
        </section>
    );
}
