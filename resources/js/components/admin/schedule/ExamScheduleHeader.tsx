import { Printer } from 'lucide-react';
import type { ExamCapabilities, ExamScheduleItem, TranslateFn } from './types';

type ExamScheduleHeaderProps = {
    schedule: ExamScheduleItem;
    label: string;
    can: ExamCapabilities;
    onPublish: () => void;
    onArchive: () => void;
    t: TranslateFn;
};

export default function ExamScheduleHeader({
    schedule,
    label,
    can,
    onPublish,
    onArchive,
    t,
}: ExamScheduleHeaderProps) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-foreground text-2xl font-semibold">{label}</h2>
            <div className="flex flex-wrap gap-2 print:hidden">
                {can.publish && schedule.status === 'draft' ? (
                    <button
                        type="button"
                        onClick={onPublish}
                        className="bg-primary text-primary-foreground rounded-full px-5 py-2 font-semibold"
                    >
                        {t('exams.publishPeriod')}
                    </button>
                ) : null}
                {can.delete && schedule.status !== 'archived' ? (
                    <button
                        type="button"
                        onClick={onArchive}
                        className="border-outline-variant text-on-surface-variant rounded-full border px-5 py-2 font-semibold"
                    >
                        {t('exams.archivePeriod')}
                    </button>
                ) : null}
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="border-outline-variant text-on-surface-variant inline-flex items-center gap-2 rounded-full border px-5 py-2 font-semibold"
                >
                    <Printer size={16} aria-hidden="true" />
                    {t('exams.printSchedule')}
                </button>
            </div>
        </div>
    );
}
