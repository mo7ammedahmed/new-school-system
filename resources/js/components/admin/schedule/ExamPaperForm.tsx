import type {
    ClassOption,
    SectionOption,
    SubjectOption,
    TeacherOption,
    TranslateFn,
} from './types';

type ExamPaperFormProps = {
    form: any; // UseForm from @inertiajs/react
    onSubmit: (event: React.FormEvent) => void;
    classes: ClassOption[];
    classSections: SectionOption[];
    selectableSubjects: SubjectOption[];
    teachers: TeacherOption[];
    invigilatorPick: number[];
    onToggleInvigilator: (teacherId: number, checked: boolean) => void;
    isArabic: boolean;
    t: TranslateFn;
};

export default function ExamPaperForm({
    form,
    onSubmit,
    classes,
    classSections,
    selectableSubjects,
    teachers,
    invigilatorPick,
    onToggleInvigilator,
    isArabic,
    t,
}: ExamPaperFormProps) {
    return (
        <section
            aria-labelledby="paper-heading"
            className="border-border bg-card rounded-[1.5rem] border p-6 print:hidden"
        >
            <h2
                id="paper-heading"
                className="text-foreground text-lg font-semibold"
            >
                {t('exams.addPaper')}
            </h2>

            <form
                onSubmit={onSubmit}
                className="mt-4 grid gap-3 md:grid-cols-4"
            >
                <label className="text-on-surface-variant text-sm font-bold">
                    {t('exams.class')}
                    <select
                        className="field mt-1"
                        value={form.data.class_id}
                        onChange={(event) => {
                            form.setData(
                                'class_id',
                                Number(event.target.value),
                            );
                            form.setData('section_id', '');
                        }}
                        required
                    >
                        <option value="">—</option>
                        {classes.map((klass) => (
                            <option key={klass.id} value={klass.id}>
                                {klass.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="text-on-surface-variant text-sm font-bold">
                    {t('exams.section')}
                    <select
                        className="border-outline-variant mt-1 w-full rounded-lg border p-2 font-normal disabled:opacity-50"
                        value={form.data.section_id}
                        disabled={form.data.bulk}
                        onChange={(event) =>
                            form.setData(
                                'section_id',
                                Number(event.target.value),
                            )
                        }
                        required={!form.data.bulk}
                    >
                        <option value="">—</option>
                        {classSections.map((section) => (
                            <option key={section.id} value={section.id}>
                                {section.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="text-on-surface-variant text-sm font-bold">
                    {t('exams.subject')}
                    <select
                        className="field mt-1"
                        value={form.data.subject_id}
                        onChange={(event) =>
                            form.setData(
                                'subject_id',
                                Number(event.target.value),
                            )
                        }
                        required
                    >
                        <option value="">—</option>
                        {selectableSubjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                                {isArabic ? subject.name_ar : subject.name_en}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="text-on-surface-variant text-sm font-bold">
                    {t('exams.date')}
                    <input
                        type="date"
                        className="field mt-1"
                        value={form.data.exam_date}
                        onChange={(event) =>
                            form.setData('exam_date', event.target.value)
                        }
                        required
                    />
                </label>

                <label className="text-on-surface-variant text-sm font-bold">
                    {t('exams.time')}
                    <span className="mt-1 flex gap-2">
                        <input
                            type="time"
                            className="field"
                            value={form.data.starts_at}
                            onChange={(event) =>
                                form.setData('starts_at', event.target.value)
                            }
                            required
                        />
                        <input
                            type="time"
                            className="field"
                            value={form.data.ends_at}
                            onChange={(event) =>
                                form.setData('ends_at', event.target.value)
                            }
                            required
                        />
                    </span>
                </label>

                <label className="text-on-surface-variant text-sm font-bold">
                    {t('exams.room')}
                    <input
                        className="field mt-1"
                        value={form.data.room}
                        onChange={(event) =>
                            form.setData('room', event.target.value)
                        }
                    />
                </label>

                <fieldset className="md:col-span-2">
                    <legend className="text-on-surface-variant text-sm font-bold">
                        {t('exams.invigilators')}
                    </legend>
                    <div className="border-outline-variant mt-1 flex max-h-32 flex-wrap gap-2 overflow-auto rounded-lg border p-2">
                        {teachers.map((teacher) => (
                            <label
                                key={teacher.id}
                                className="flex items-center gap-1 text-xs font-bold"
                            >
                                <input
                                    type="checkbox"
                                    checked={invigilatorPick.includes(
                                        teacher.id,
                                    )}
                                    onChange={(event) =>
                                        onToggleInvigilator(
                                            teacher.id,
                                            event.target.checked,
                                        )
                                    }
                                />
                                {teacher.name}
                            </label>
                        ))}
                    </div>
                </fieldset>

                <label className="text-on-surface-variant flex items-center gap-2 text-sm font-bold md:col-span-4">
                    <input
                        type="checkbox"
                        checked={form.data.bulk}
                        onChange={(event) =>
                            form.setData('bulk', event.target.checked)
                        }
                    />
                    {t('exams.addForAllSections')}
                </label>

                {form.errors.section_id ? (
                    <p className="text-warning-foreground text-sm font-bold md:col-span-4">
                        {form.errors.section_id}
                    </p>
                ) : null}
                {form.errors.subject_id ? (
                    <p className="text-warning-foreground text-sm font-bold md:col-span-4">
                        {form.errors.subject_id}
                    </p>
                ) : null}

                <div className="md:col-span-4">
                    <button
                        type="submit"
                        disabled={form.processing}
                        className="bg-hero-bg rounded-full px-6 py-2 font-semibold text-white disabled:opacity-60"
                    >
                        {t('exams.addPaper')}
                    </button>
                </div>
            </form>
        </section>
    );
}
