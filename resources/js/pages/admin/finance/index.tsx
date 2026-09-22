import { Head, useForm } from '@inertiajs/react';
import { DateCell } from '@/components/data-display/date-cell';

type School = { id: number; name: string };
type Fee = {
    id: number;
    name: string;
    amount_minor: number;
    currency: string;
    frequency: string;
    is_active: boolean;
};
type Student = {
    id: number;
    first_name: string;
    last_name: string;
    student_number: string;
};
type Installment = {
    sequence: number;
    due_on: string;
    amount_minor: number;
    status: string;
};
type Invoice = {
    id: number;
    number: string;
    status: string;
    total_minor: number;
    currency: string;
    due_on: string;
    installments: Installment[];
    student?: Student;
};
type Props = {
    school: School;
    feeStructures: Fee[];
    students: Student[];
    invoices: Invoice[];
};

export default function FinanceIndex({
    school,
    feeStructures,
    students,
    invoices,
}: Props) {
    const fee = useForm({
        name: '',
        description: '',
        amount_minor: '',
        frequency: 'annual',
    });
    const invoice = useForm({
        student_id: '',
        fee_structure_id: '',
        issued_on: new Date().toISOString().slice(0, 10),
        due_on: new Date().toISOString().slice(0, 10),
        installment_count: '1',
    });
    const money = (minor: number, currency: string) =>
        `${(minor / 100).toFixed(2)} ${currency}`;

    return (
        <>
            <Head title={`Finance — ${school.name}`} />
            <main className="mx-auto max-w-6xl space-y-8 p-6">
                <header>
                    <h1 className="text-3xl font-semibold">Finance</h1>
                    <p className="text-muted-foreground">
                        Fee structures and issued invoices.
                    </p>
                </header>
                <section className="grid gap-6 lg:grid-cols-2">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            fee.post(
                                `/admin/schools/${school.id}/finance/fees`,
                            );
                        }}
                        className="space-y-3 rounded-xl border p-5"
                    >
                        <h2 className="text-xl font-medium">
                            Create fee structure
                        </h2>
                        <input
                            className="w-full rounded border p-2"
                            placeholder="Name"
                            value={fee.data.name}
                            onChange={(e) =>
                                fee.setData('name', e.target.value)
                            }
                        />
                        <input
                            className="w-full rounded border p-2"
                            type="number"
                            min="1"
                            placeholder="Amount in halalas"
                            value={fee.data.amount_minor}
                            onChange={(e) =>
                                fee.setData('amount_minor', e.target.value)
                            }
                        />
                        <select
                            className="w-full rounded border p-2"
                            value={fee.data.frequency}
                            onChange={(e) =>
                                fee.setData('frequency', e.target.value)
                            }
                        >
                            <option value="annual">Annual</option>
                            <option value="term">Term</option>
                            <option value="monthly">Monthly</option>
                            <option value="one_time">One time</option>
                        </select>
                        <button className="bg-primary text-primary-foreground rounded px-4 py-2">
                            Save fee
                        </button>
                    </form>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            invoice.post(
                                `/admin/schools/${school.id}/finance/invoices`,
                            );
                        }}
                        className="space-y-3 rounded-xl border p-5"
                    >
                        <h2 className="text-xl font-medium">Issue invoice</h2>
                        <select
                            className="w-full rounded border p-2"
                            value={invoice.data.student_id}
                            onChange={(e) =>
                                invoice.setData('student_id', e.target.value)
                            }
                        >
                            <option value="">Select student</option>
                            {students.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.first_name} {student.last_name} —{' '}
                                    {student.student_number}
                                </option>
                            ))}
                        </select>
                        <select
                            className="w-full rounded border p-2"
                            value={invoice.data.fee_structure_id}
                            onChange={(e) =>
                                invoice.setData(
                                    'fee_structure_id',
                                    e.target.value,
                                )
                            }
                        >
                            <option value="">Select fee</option>
                            {feeStructures
                                .filter((item) => item.is_active)
                                .map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} —{' '}
                                        {money(
                                            item.amount_minor,
                                            item.currency,
                                        )}
                                    </option>
                                ))}
                        </select>
                        <div className="grid grid-cols-3 gap-3">
                            <input
                                className="rounded border p-2"
                                type="date"
                                value={invoice.data.issued_on}
                                onChange={(e) =>
                                    invoice.setData('issued_on', e.target.value)
                                }
                            />
                            <input
                                className="rounded border p-2"
                                type="date"
                                value={invoice.data.due_on}
                                onChange={(e) =>
                                    invoice.setData('due_on', e.target.value)
                                }
                            />
                            <input
                                className="rounded border p-2"
                                type="number"
                                min="1"
                                max="12"
                                placeholder="Installments"
                                value={invoice.data.installment_count}
                                onChange={(e) =>
                                    invoice.setData(
                                        'installment_count',
                                        e.target.value,
                                    )
                                }
                            />
                        </div>
                        <button className="bg-primary text-primary-foreground rounded px-4 py-2">
                            Issue invoice
                        </button>
                    </form>
                </section>
                <section className="rounded-xl border">
                    <h2 className="border-b p-5 text-xl font-medium">
                        Invoices
                    </h2>
                    <div className="divide-y">
                        {invoices.map((item) => (
                            <div key={item.id} className="space-y-2 p-4">
                                <div className="flex flex-wrap justify-between gap-3">
                                    <span>
                                        {item.number} ·{' '}
                                        {item.student?.first_name}{' '}
                                        {item.student?.last_name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        {money(item.total_minor, item.currency)}
                                        <span>· {item.status} ·</span>
                                        <DateCell value={item.due_on} />
                                    </span>
                                </div>
                                {item.installments?.length ? (
                                    <div className="text-muted-foreground flex flex-wrap gap-3 text-sm">
                                        {item.installments.map((part) => (
                                            <span key={part.sequence}>
                                                #{part.sequence}:{' '}
                                                {money(
                                                    part.amount_minor,
                                                    item.currency,
                                                )}{' '}
                                                <DateCell value={part.due_on} /> ·{' '}
                                                {part.status}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                        {!invoices.length && (
                            <p className="text-muted-foreground p-5">
                                No invoices issued yet.
                            </p>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}
