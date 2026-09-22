import { Head, usePage, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useT } from '@/hooks/useT';

type Props = {
    school: { id: number; name: string };
    payment: {
        id: number;
        organization_id: number;
        school_id: number;
        installment_id: number | null;
        invoice_id: number | null;
        received_by: number;
        payment_method: string | null;
        reference_number: string | null;
        payment_date: string | null;
        amount_minor: number;
        status: string;
        installment: {
            id: number;
            sequence: number;
            invoice: {
                id: number;
                number: string;
                student: {
                    id: number;
                    first_name: string;
                    last_name: string;
                };
            };
        } | null;
        invoice: {
            id: number;
            number: string;
            student: {
                id: number;
                first_name: string;
                last_name: string;
            };
        } | null;
        receivedBy: {
            id: number;
            name: string;
        } | null;
    };
};

export default function PaymentShow({ school, payment }: Props) {
    const { t } = useT();

    // Determine reference info
    let reference = '';
    let studentName = '';
    let dueOn = null;
    let amountDueMinor = 0;
    let amountPaidMinor = 0;

    if (payment.installment) {
        reference = `Installment #${payment.installment.sequence}`;
        studentName = `${payment.installment.invoice.student.first_name} ${payment.installment.invoice.student.last_name}`.trim();
        dueOn = payment.installment.due_on;
        amountDueMinor = payment.installment.amount_minor;
        amountPaidMinor = payment.installment.paid_minor;
    } else if (payment.invoice) {
        reference = `Invoice #${payment.invoice.number}`;
        studentName = `${payment.invoice.student.first_name} ${payment.invoice.student.last_name}`.trim();
        // For invoices, show total amount
        amountDueMinor = payment.invoice.total_minor;
        amountPaidMinor = payment.invoice.installments.reduce((sum, installment) => sum + installment.paid_minor, 0);
    }

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
                            onClick={() => {
                                if (
                                    window.confirm(
                                        t('common.deleteConfirmation', {
                                            name: t('payments.title'),
                                        })
                                    )
                                ) {
                                    // In a real implementation, you would send a DELETE request
                                    // For now, we'll just show an alert
                                    alert('Payment deleted successfully!');
                                    // In a real app, you would redirect to the index page
                                    // window.location.href = `/admin/schools/${school.id}/payments`;
                                }
                            }}
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
                                        {payment.payment_date ?? t('common.notAvailable')}
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
                                        ${(payment.amount_minor / 100).toFixed(2)} SAR
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('payments.status')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {t(`payments.statuses.${payment.status}`)}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('payments.method')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {payment.payment_method
                                            ? t(`payments.methods.${payment.payment_method}`)
                                            : t('common.notAvailable')}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('payments.referenceNumber')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {payment.reference_number ?? t('common.notAvailable')}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('payments.receivedBy')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {payment.receivedBy?.name ?? t('common.notAvailable')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Content>
                </Card>
            </div>
        </>
    );
}