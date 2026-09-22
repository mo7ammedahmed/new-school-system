import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-clip';

type TimetablePeriod = {
    id: number;
    period: number;
    section_name: string | null;
    subject_name_en: string | null;
    subject_name_ar: string | null;
    subject_color: string | null;
    teacher_name: string | null;
    room: string | null;
    starts_at: string; // HH:mm format
    ends_at: string; // HH:mm format
    day_of_week: number; // 0-6 (0 = Sunday)
};

type TimetableGridProps = {
    periods: TimetablePeriod[];
    currentDay: number; // 0-6 (0 = Sunday)
    locale?: 'ar' | 'en';
    isArabic?: boolean;
    canManage?: boolean;
    onPeriodClick?: (period: TimetablePeriod) => void;
    onPeriodDragStart?: (period: TimetablePeriod) => void;
    onPeriodDrop?: (
        period: TimetablePeriod,
        newDay: number,
        newTime: string,
    ) => void;
};

const daysOfWeek = [
    { en: 'Sunday', ar: 'الأحد' },
    { en: 'Monday', ar: 'الإثنين' },
    { en: 'Tuesday', ar: 'الثلاثاء' },
    { en: 'Wednesday', ar: 'الأربعاء' },
    { en: 'Thursday', ar: 'الخميس' },
    { en: 'Friday', ar: 'الجمعة' },
    { en: 'Saturday', ar: 'السبت' },
];

const timeSlots = [
    '07:00',
    '07:30',
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
];

export default function TimetableGrid({
    periods,
    currentDay = 0,
    locale = 'en',
    isArabic = false,
    canManage = false,
    onPeriodClick,
    onPeriodDragStart,
    onPeriodDrop,
}: TimetableGridProps) {
    const dayName = isArabic
        ? daysOfWeek[currentDay].ar
        : daysOfWeek[currentDay].en;

    const dayPeriods = periods.filter((p) => p.day_of_week === currentDay);

    // Group periods by time slot for overlapping detection
    const timeSlotMap: Record<string, TimetablePeriod[]> = {};

    dayPeriods.forEach((period) => {
        const startSlot = timeSlots.indexOf(period.starts_at);
        const endSlot = timeSlots.indexOf(period.ends_at);

        for (let i = startSlot; i < endSlot; i++) {
            const slot = timeSlots[i];
            if (!timeSlotMap[slot]) {
                timeSlotMap[slot] = [];
            }
            timeSlotMap[slot].push(period);
        }
    });

    return (
        <div className="space-y-4">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#17342f]">
                    {isArabic ? `جدول ${dayName}` : `${dayName} Timetable`}
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            // Navigate to previous day
                        }}
                        className="rounded-full border border-[#dbe8df] p-2 transition-colors hover:bg-[#f8fafc]"
                        disabled={currentDay === 0} // Assuming week starts on Sunday
                    >
                        <svg size={16} aria-hidden="true">
                            {isArabic ? (
                                <path
                                    d="M12 4l-8 8 8 8"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            ) : (
                                <path
                                    d="M4 4l8 8-8 8"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}
                        </svg>
                    </button>
                    <span className="font-medium">{dayName}</span>
                    <button
                        onClick={() => {
                            // Navigate to next day
                        }}
                        className="rounded-full border border-[#dbe8df] p-2 transition-colors hover:bg-[#f8fafc]"
                        disabled={currentDay === 6} // Assuming week ends on Saturday
                    >
                        <svg size={16} aria-hidden="true">
                            {isArabic ? (
                                <path
                                    d="M4 4l8-8-8-8"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            ) : (
                                <path
                                    d="M12 4l-8-8 8-8"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Timetable Grid */}
            <div className="overflow-hidden rounded-xl border border-[#dbe8df]">
                {/* Time Header */}
                <div className="border-b border-[#dbe8df] bg-[#f8fafc]">
                    <div className="grid grid-cols-[60px_1fr]">
                        <div className="px-3 py-4 text-xs font-medium text-[#6b7280]">
                            Time
                        </div>
                        <div className="grid grid-cols-7">
                            {timeSlots.map((time, index) => (
                                <div
                                    key={index}
                                    className={`px-3 py-2 text-center text-xs font-medium ${
                                        index % 2 === 0
                                            ? 'border-r border-[#e5e7eb]'
                                            : ''
                                    }`}
                                >
                                    {time}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Timetable Body */}
                <div className="relative">
                    {/* Time Rows */}
                    <div className="pointer-events-none absolute inset-0">
                        {timeSlots.map((time, index) => (
                            <div
                                key={index}
                                className={`absolute right-0 left-0 top-[${index * 20}px] h-0.5 bg-[#e5e7eb]`}
                            />
                        ))}
                    </div>

                    {/* Periods */}
                    <div className="relative pt-[40px]">
                        {timeSlots.map((time, index) => {
                            const periodsInSlot = timeSlotMap[time] || [];

                            return (
                                <div key={index} className="relative">
                                    {/* Time Label */}
                                    <div className="absolute top-[calc(${index}*20px)] left-0 w-[60px] border-r border-[#dbe8df] px-3 py-[10px] text-right text-xs font-medium text-[#6b7280]">
                                        {time}
                                    </div>

                                    {/* Day Column */}
                                    <div className="absolute top-[calc(${index}*20px)] right-0 left-[60px] h-[20px]">
                                        {periodsInSlot.map(
                                            (period, periodIndex) => {
                                                const startSlot =
                                                    timeSlots.indexOf(
                                                        period.starts_at,
                                                    );
                                                const endSlot =
                                                    timeSlots.indexOf(
                                                        period.ends_at,
                                                    );
                                                const durationSlots =
                                                    endSlot - startSlot;

                                                // Calculate position and size
                                                const leftPercent =
                                                    (startSlot /
                                                        timeSlots.length) *
                                                    100;
                                                const widthPercent =
                                                    (durationSlots /
                                                        timeSlots.length) *
                                                    100;

                                                return (
                                                    <div
                                                        key={`${period.id}-${index}`}
                                                        onClick={() =>
                                                            onPeriodClick?.(
                                                                period,
                                                            )
                                                        }
                                                        onDragStart={(e) =>
                                                            onPeriodDragStart?.(
                                                                period,
                                                            )
                                                        }
                                                        onDrop={(e) =>
                                                            onPeriodDrop?.(
                                                                period,
                                                                currentDay,
                                                                time,
                                                            )
                                                        }
                                                        draggable={canManage}
                                                        className={`absolute left-[${leftPercent}%] top-0 w-[${widthPercent}%] h-full rounded-lg border ${
                                                            period.subject_color
                                                                ? `border-[${period.subject_color}] bg-[${period.subject_color}]/20`
                                                                : 'border-[#dbe8df] bg-white'
                                                        } hover:border-[#0d5c4d] hover:bg-[${period.subject_color || '#0d5c4d'}]/10 transition-all duration-200`}
                                                    >
                                                        <div className="p-2">
                                                            <div className="mb-1 flex items-center gap-2">
                                                                <div
                                                                    className="h-2 w-2 rounded-full"
                                                                    style={{
                                                                        backgroundColor:
                                                                            period.subject_color,
                                                                    }}
                                                                />
                                                                <span className="text-xs font-medium text-[#17342f]">
                                                                    {isArabic
                                                                        ? period.subject_name_ar
                                                                        : period.subject_name_en}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-[#6b7280]">
                                                                {isArabic
                                                                    ? period.teacher_name
                                                                    : period.teacher_name}
                                                            </div>
                                                            <div className="text-xs text-[#6b7280]">
                                                                {period.room}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
