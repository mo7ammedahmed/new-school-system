import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useT } from '@/hooks/useT';
import { confirmDelete } from '@/lib/confirm-delete';

type Props = {
    school: { id: number; name: string };
    invoice: {
        id: number;
        student_id: number;
        issued_by: number;
        number: string;
        issued_on: string | null;
        due_on: string | null;
        status: string;
        currency: string;
        subtotal_minor: number;
        total_minor: number;
        items: any;
        student_name: string;
        issuer_name: string;
        installments_count: number;
    };
};

export default function InvoiceShow({ school, invoice }: Props) {
    const { t } = useT();

    return (
        <>
            <Head title={t('invoices.show', { number: invoice.number })} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('invoices.show', { number: invoice.number })}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/invoices/${invoice.id}/edit`}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium"
                        >
                            {t('actions.edit')}
                        </Link>
                        <Button
                            onClick={() =>
                                confirmDelete(
                                    `/admin/schools/${school.id}/invoices/${invoice.id}`,
                                    {
                                        message: t(
                                            'common.deleteConfirmation',
                                            {
                                                name: t('invoices.title'),
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
                            href={`/admin/schools/${school.id}/invoices`}
                            variant="outline"
                        >
                            {t('common.back')}
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('invoices.form.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('invoices.number')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {invoice.number}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('invoices.student')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {invoice.student_name}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('invoices.issuedBy')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {invoice.issuer_name}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('invoices.issuedDate')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {invoice.issued_on ??
                                            t('common.notAvailable')}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('invoices.dueDate')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {invoice.due_on ??
                                            t('common.notAvailable')}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('invoices.status')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {t(
                                            `invoices.statuses.${invoice.status}`,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('invoices.currency')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {t(`currencies.${invoice.currency}`)}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('invoices.subtotal')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        $
                                        {(invoice.subtotal_minor / 100).toFixed(
                                            2,
                                        )}{' '}
                                        SAR
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('invoices.total')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        $
                                        {(invoice.total_minor / 100).toFixed(2)}{' '}
                                        SAR
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('invoices.items')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {JSON.stringify(invoice.items)}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('invoices.installmentsCount')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {invoice.installments_count}
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
