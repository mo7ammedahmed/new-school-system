import { Head, useForm, usePage } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import PublicLayout from '@/layouts/public-layout';
import { usePublicLocale } from '@/hooks/use-public-locale';

type Props = {
    school: { name: string; slug: string; organizationSlug: string };
};

export default function Apply({ school }: Props) {
    const { locale } = usePublicLocale();
    const { flash } = usePage<{
        flash?: { success?: string; error?: string };
    }>().props;
    const isArabic = locale === 'ar';
    const form = useForm({
        guardian_name: '',
        guardian_email: '',
        guardian_phone: '',
        student_name: '',
        student_date_of_birth: '',
        message: '',
    });
    function submit(event: FormEvent) {
        event.preventDefault();
        form.post(`/schools/${school.organizationSlug}/${school.slug}/apply`);
    }
    const labels = isArabic
        ? {
              title: 'طلب الالتحاق',
              intro: 'ابدأوا رحلة الطالب مع المدرسة. سيعود فريق القبول إليكم بعد مراجعة الطلب.',
              guardian: 'اسم ولي الأمر',
              email: 'البريد الإلكتروني',
              phone: 'رقم الجوال',
              student: 'اسم الطالب',
              dob: 'تاريخ الميلاد',
              message: 'رسالة إضافية',
              submit: 'إرسال الطلب',
              sending: 'جارٍ الإرسال…',
              required: 'مطلوب',
          }
        : {
              title: 'Admission application',
              intro: 'Start the student journey with this school. The admissions team will contact you after reviewing the application.',
              guardian: 'Guardian name',
              email: 'Email address',
              phone: 'Phone number',
              student: 'Student name',
              dob: 'Date of birth',
              message: 'Additional message',
              submit: 'Submit application',
              sending: 'Sending…',
              required: 'Required',
          };
    return (
        <PublicLayout>
            <Head title={`${labels.title} — ${school.name}`} />
            <section className="mx-auto max-w-3xl px-5 pt-16 pb-24 sm:px-8">
                <div className="mb-8">
                    <p className="text-warning text-sm font-semibold">
                        {school.name}
                    </p>
                    <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                        {labels.title}
                    </h1>
                    <p className="text-on-surface-variant mt-4 max-w-2xl leading-8">
                        {labels.intro}
                    </p>
                </div>
                {flash?.success && (
                    <div
                        className="border-success-border bg-success-container text-success-foreground mb-5 rounded-lg border px-5 py-4 font-bold"
                        role="status"
                    >
                        {isArabic
                            ? 'تم استلام طلبكم بنجاح. سيتواصل معكم فريق القبول قريباً.'
                            : 'Your application was received successfully. The admissions team will contact you soon.'}
                    </div>
                )}
                {flash?.error && (
                    <div
                        className="border-danger-border bg-danger-container text-danger-foreground mb-5 rounded-lg border px-5 py-4 font-bold"
                        role="alert"
                    >
                        {flash.error}
                    </div>
                )}
                <form
                    onSubmit={submit}
                    className="border-outline-variant bg-card grid gap-5 rounded-lg border p-6 sm:p-9"
                >
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                            label={labels.guardian}
                            required
                            error={form.errors.guardian_name}
                        >
                            <input
                                required
                                aria-invalid={!!form.errors.guardian_name}
                                className="field"
                                value={form.data.guardian_name}
                                onChange={(e) =>
                                    form.setData(
                                        'guardian_name',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field
                            label={labels.email}
                            required
                            error={form.errors.guardian_email}
                        >
                            <input
                                required
                                type="email"
                                aria-invalid={!!form.errors.guardian_email}
                                className="field"
                                value={form.data.guardian_email}
                                onChange={(e) =>
                                    form.setData(
                                        'guardian_email',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field label={labels.phone}>
                            <input
                                className="field"
                                value={form.data.guardian_phone}
                                onChange={(e) =>
                                    form.setData(
                                        'guardian_phone',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                        <Field
                            label={labels.student}
                            required
                            error={form.errors.student_name}
                        >
                            <input
                                required
                                aria-invalid={!!form.errors.student_name}
                                className="field"
                                value={form.data.student_name}
                                onChange={(e) =>
                                    form.setData('student_name', e.target.value)
                                }
                            />
                        </Field>
                        <Field label={labels.dob}>
                            <input
                                type="date"
                                className="field"
                                value={form.data.student_date_of_birth}
                                onChange={(e) =>
                                    form.setData(
                                        'student_date_of_birth',
                                        e.target.value,
                                    )
                                }
                            />
                        </Field>
                    </div>
                    <Field label={labels.message}>
                        <textarea
                            className="field min-h-32"
                            value={form.data.message}
                            onChange={(e) =>
                                form.setData('message', e.target.value)
                            }
                        />
                    </Field>
                    <button
                        disabled={form.processing}
                        className="bg-primary text-primary-foreground hover:bg-primary rounded-full px-6 py-3.5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {form.processing ? labels.sending : labels.submit}
                    </button>
                </form>
            </section>
        </PublicLayout>
    );
}
function Field({
    label,
    required,
    error,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: ReactNode;
}) {
    return (
        <label className="text-on-surface grid gap-2 text-sm font-bold">
            <span>
                {label}
                {required && <span className="text-warning"> *</span>}
            </span>
            {children}
            {error && (
                <span
                    className="text-danger-foreground text-xs font-medium"
                    role="alert"
                >
                    {error}
                </span>
            )}
        </label>
    );
}
