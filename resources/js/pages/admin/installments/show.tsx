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
    installment: {
        id: number;
        invoice_id: number;
        sequence: number;
        due_on: string | null;
        amount_minor: number;
        paid_minor: number;
        status: string;
        paid_at: string | null;
        invoice_number: string;
        student_name: string;
    };
};

export default function InstallmentShow({ school, installment }: Props) {
    const { t } = useT();

    return (
        <>
            <Head title={t('installments.show', { sequence: installment.sequence })} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('installments.show', { sequence: installment.sequence })}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/installments/${installment.id}/edit`}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium"
                        >
                            {t('actions.edit')}
                        </Link>
                        <Button
                            onClick={() => {
                                if (
                                    window.confirm(
                                        t('common.deleteConfirmation', {
                                            name: t('installments.title'),
                                        })
                                    )
                                ) {
                                    // In a real implementation, you would send a DELETE request
                                    // For now, we'll just show an alert
                                    alert('Installment deleted successfully!');
                                    // In a real app, you would redirect to the index page
                                    // window.location.href = `/admin/schools/${school.id}/installments`;
                                }
                            }}
                            variant="destructive"
                        >
                            {t('actions.delete')}
                        </Button>
                        <Button
                            href={`/admin/schools/${school.id}/installments`}
                            variant="outline"
                        >
                            {t('common.back')}
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('installments.form.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('installments.sequence')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {installment.sequence}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('installments.student')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {installment.student_name}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('installments.invoice')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {installment.invoice_number}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('installments.dueDate')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {installment.due_on ?? t('common.notAvailable')}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('installments.amount')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        ${(installment.amount_minor / 100).toFixed(2)} SAR
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('installments.paidAmount')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        ${(installment.paid_minor / 100).toFixed(2)} SAR
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('installments.outstanding')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        ${((installment.amount_minor - installment.paid_minor) / 100).toFixed(2)} SAR
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('installments.status')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {t(`installments.statuses.${installment.status}`)}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('installments.paidDate')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {installment.paid_at ?? t('common.notAvailable')}
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