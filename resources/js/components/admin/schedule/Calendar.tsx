import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

type CalendarProps = {
    workingDays: number[];
    calendar: Record<string, number>;
    selectedDate: string | null;
    onDateSelect: (date: string) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    dayName: (day: number) => string;
};

export default function ExamScheduleCalendar({
    workingDays,
    calendar,
    selectedDate,
    onDateSelect,
    t,
    dayName,
}: CalendarProps) {
    const [month, setMonth] = useState<string>(() =>
        selectedDate
            ? selectedDate.slice(0, 7) // YYYY-MM
            : new Date().toISOString().slice(0, 7),
    );

    const pad = (value: number): string => value.toString().padStart(2, '0');

    const shiftMonth = (month: string, delta: number): string => {
        const [year, monthNumber] = month.split('-').map(Number);
        const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
        return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
    };

    const buildMonthGrid = (
        month: string,
    ): Array<{ iso: string; inMonth: boolean }> => {
        const [year, monthNumber] = month.split('-').map(Number);
        const first = new Date(Date.UTC(year, monthNumber - 1, 1));
        const leading = first.getUTCDay();
        const cells: Array<{ iso: string; inMonth: boolean }> = [];

        for (let index = 0; index < 42; index += 1) {
            const day = new Date(
                Date.UTC(year, monthNumber - 1, 1 - leading + index),
            );
            const iso = `${day.getUTCFullYear()}-${pad(day.getUTCMonth() + 1)}-${pad(day.getUTCDate())}`;

            cells.push({ iso, inMonth: day.getUTCMonth() === monthNumber - 1 });
        }

        return cells;
    };

    const grid = useMemo(() => buildMonthGrid(month), [month]);

    return (
        <section
            aria-labelledby="calendar-heading"
            className="border-border bg-card rounded-[1.5rem] border p-6"
        >
            <div className="flex items-center justify-between gap-3">
                <h2
                    id="calendar-heading"
                    className="text-foreground text-lg font-semibold"
                >
                    <CalendarDays
                        size={18}
                        className="inline"
                        aria-hidden="true"
                    />{' '}
                    {t('exams.calendar')}
                </h2>
                <div className="flex items-center gap-2 print:hidden">
                    <button
                        type="button"
                        aria-label={t('exams.prevMonth')}
                        onClick={() => setMonth(shiftMonth(month, -1))}
                        className="border-outline-variant rounded-full border p-2"
                    >
                        <ChevronRight
                            size={16}
                            aria-hidden="true"
                            className="rtl:hidden"
                        />
                        <ChevronLeft
                            size={16}
                            aria-hidden="true"
                            className="hidden rtl:inline"
                        />
                    </button>
                    <span className="text-foreground min-w-[7rem] text-center font-semibold">
                        {month}
                    </span>
                    <button
                        type="button"
                        aria-label={t('exams.nextMonth')}
                        onClick={() => setMonth(shiftMonth(month, 1))}
                        className="border-outline-variant rounded-full border p-2"
                    >
                        <ChevronLeft
                            size={16}
                            aria-hidden="true"
                            className="rtl:hidden"
                        />
                        <ChevronRight
                            size={16}
                            aria-hidden="true"
                            className="hidden rtl:inline"
                        />
                    </button>
                </div>
            </div>

            <div
                role="grid"
                className="mt-4 grid grid-cols-7 gap-1 text-center"
            >
                {workingDays
                    .map((day) => (
                        <div
                            key={day}
                            role="columnheader"
                            className="text-foreground p-1 text-xs font-semibold"
                        >
                            {dayName(day)}
                        </div>
                    ))
                    .slice(0, 7)}
            </div>

            <div role="grid" className="mt-1 grid grid-cols-7 gap-1">
                {(() => {
                    const firstWeekday = grid[0]
                        ? new Date(`${grid[0].iso}T00:00:00Z`).getUTCDay()
                        : 0;
                    const workingSet = new Set(workingDays);

                    return grid.map((cell, index) => {
                        const weekday = (firstWeekday + index) % 7;
                        const isWorking = workingSet.has(weekday);
                        const count = calendar[cell.iso] ?? 0;
                        const isSelected = selectedDate === cell.iso;

                        return (
                            <button
                                key={cell.iso}
                                type="button"
                                role="gridcell"
                                aria-selected={isSelected}
                                onClick={() => onDateSelect(cell.iso)}
                                className={`flex min-h-[4.5rem] flex-col items-start rounded-xl border p-2 text-start transition ${
                                    isSelected
                                        ? 'border-primary bg-surface-container-low'
                                        : 'border-outline-variant hover:border-primary'
                                } ${cell.inMonth ? '' : 'opacity-40'} ${
                                    isWorking ? '' : 'bg-surface-container-low'
                                }`}
                            >
                                <span className="text-on-surface-variant text-xs font-bold">
                                    {Number(cell.iso.slice(8, 10))}
                                </span>
                                {count > 0 ? (
                                    <span className="bg-primary text-primary-foreground mt-auto rounded-full px-2 py-0.5 text-xs font-semibold">
                                        {count}
                                    </span>
                                ) : null}
                            </button>
                        );
                    });
                })()}
            </div>

            <p className="text-foreground mt-4 text-xs font-bold">
                {t('exams.weekTotal')}:{' '}
                {grid.reduce(
                    (total, cell) => total + (calendar[cell.iso] ?? 0),
                    0,
                )}
            </p>
        </section>
    );
}
