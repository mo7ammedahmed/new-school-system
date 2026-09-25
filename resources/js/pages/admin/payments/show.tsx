import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useT } from '@/hooks/useT';
import { confirmDelete } from '@/lib/confirm-delete';

type Props = {
    school: { id: number; name: string };
    payment: {
        id: number;
        payment_date: string | null;
        amount_minor: number;
        status: string;
        payment_method: string | null;
        reference_number: string | null;
        reference: string;
        student_name: string | null;
        due_on: string | null;
        amount_due_minor: number;
        amount_paid_minor: number;
        received_by: string | null;
    };
};

export default function PaymentShow({ school, payment }: Props) {
    const { t } = useT();

    // The server derives the reference and student name; this page renders them.
    const reference = payment.reference ?? '';
    const studentName = payment.student_name ?? '';

    return (
        <>
            <Head title={t('payments.show', { reference })} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('payments.show', { reference })}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/payments/${payment.id}/edit`}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium"
                        >
                            {t('actions.edit')}
                        </Link>
                        <Button
                            onClick={() =>
                                confirmDelete(
                                    `/admin/schools/${school.id}/payments/${payment.id}`,
                                    {
                                        message: t(
                                            'common.deleteConfirmation',
                                            {
                                                name: t('payments.title'),
                                            },
                                        ),
                                    },
                                )
                            }
                            variant="destructive"
                        >
                            {t('actions.delete')}
                        </Button>
                        <Button
                            href={`/admin/schools/${school.id}/payments`}
                            variant="outline"
                        >
                            {t('common.back')}
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('payments.form.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('payments.date')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {payment.payment_date ??
                                            t('common.notAvailable')}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('payments.reference')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {reference}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('payments.student')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {studentName}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('payments.amount')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        $
                                        {(payment.amount_minor / 100).toFixed(
                                            2,
                                        )}{' '}
                                        SAR
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('payments.status')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {t(
                                            `payments.statuses.${payment.status}`,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('payments.method')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {payment.payment_method
                                            ? t(
                                                  `payments.methods.${payment.payment_method}`,
                                              )
                                            : t('common.notAvailable')}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('payments.referenceNumber')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {payment.reference_number ??
                                            t('common.notAvailable')}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('payments.receivedBy')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {payment.received_by ??
                                            t('common.notAvailable')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
