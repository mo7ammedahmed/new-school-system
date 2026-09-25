import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { FormField } from '@/components/forms/form-field';
import { FormSection } from '@/components/forms/form-section';
import { FormErrors } from '@/components/forms/form-errors';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
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
    };
};

const LIST_URL = (schoolId: number) => `/admin/schools/${schoolId}/payments`;
const EDIT_URL = (schoolId: number, paymentId: number) =>
    `/admin/schools/${schoolId}/payments/${paymentId}`;

const STATUSES = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
] as const;

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'check', label: 'Check' },
] as const;

export default function PaymentEdit({ school, payment }: Props) {
    const { t } = useT();
    const { data, setData, put, processing, errors } = useForm({
        organization_id: String(payment.organization_id ?? ''),
        school_id: String(payment.school_id ?? ''),
        installment_id: String(payment.installment_id ?? ''),
        invoice_id: String(payment.invoice_id ?? ''),
        received_by: String(payment.received_by ?? ''),
        payment_method: payment.payment_method ?? '',
        reference_number: payment.reference_number ?? '',
        payment_date: payment.payment_date ?? '',
        amount_minor: String(payment.amount_minor ?? ''),
        status: payment.status,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(EDIT_URL(school.id, payment.id), {
            onSuccess: () => {
                // Success toast handled by Inertia flash message
            },
        });
    };

    return (
        <>
            <Head title={t('payments.edit', { id: payment.id })} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('payments.edit', { id: payment.id })}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Button asChild variant="outline">
                            <Link href={LIST_URL(school.id)}>
                                {t('common.back')}
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('payments.form.title')}</CardTitle>
                        <CardDescription>
                            {t('payments.form.editDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormErrors errors={errors} />

                        <FormSection>
                            <FormField
                                label={t('payments.organization')}
                                description={t(
                                    'payments.organizationDescription',
                                )}
                            >
                                <Input
                                    placeholder={t(
                                        'payments.organizationPlaceholder',
                                    )}
                                    value={data.organization_id}
                                    onChange={(e) =>
                                        setData(
                                            'organization_id',
                                            e.target.value,
                                        )
                                    }
                                    required
                                    type="number"
                                    min="1"
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('payments.school')}
                                description={t('payments.schoolDescription')}
                            >
                                <Input
                                    placeholder={t(
                                        'payments.schoolPlaceholder',
                                    )}
                                    value={data.school_id}
                                    onChange={(e) =>
                                        setData('school_id', e.target.value)
                                    }
                                    required
                                    type="number"
                                    min="1"
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('payments.installment')}
                                description={t(
                                    'payments.installmentDescription',
                                )}
                            >
                                <Input
                                    placeholder={t(
                                        'payments.installmentPlaceholder',
                                    )}
                                    value={data.installment_id}
                                    onChange={(e) =>
                                        setData(
                                            'installment_id',
                                            e.target.value,
                                        )
                                    }
                                    type="number"
                                    min="1"
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('payments.invoice')}
                                description={t('payments.invoiceDescription')}
                            >
                                <Input
                                    placeholder={t(
                                        'payments.invoicePlaceholder',
                                    )}
                                    value={data.invoice_id}
                                    onChange={(e) =>
                                        setData('invoice_id', e.target.value)
                                    }
                                    type="number"
                                    min="1"
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('payments.receivedBy')}
                                description={t(
                                    'payments.receivedByDescription',
                                )}
                            >
                                <Input
                                    placeholder={t(
                                        'payments.receivedByPlaceholder',
                                    )}
                                    value={data.received_by}
                                    onChange={(e) =>
                                        setData('received_by', e.target.value)
                                    }
                                    required
                                    type="number"
                                    min="1"
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('payments.paymentMethod')}
                                description={t(
                                    'payments.paymentMethodDescription',
                                )}
                            >
                                <Select
                                    value={data.payment_method}
                                    onValueChange={(value) =>
                                        setData('payment_method', value)
                                    }
                                    placeholder={t(
                                        'payments.paymentMethodPlaceholder',
                                    )}
                                >
                                    <option value="">
                                        {t('payments.paymentMethodPlaceholder')}
                                    </option>
                                    {PAYMENT_METHODS.map((method) => (
                                        <option
                                            key={method.value}
                                            value={method.value}
                                        >
                                            {t(
                                                `payments.methods.${method.value}`,
                                            )}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('payments.referenceNumber')}
                                description={t(
                                    'payments.referenceNumberDescription',
                                )}
                            >
                                <Input
                                    placeholder={t(
                                        'payments.referenceNumberPlaceholder',
                                    )}
                                    value={data.reference_number}
                                    onChange={(e) =>
                                        setData(
                                            'reference_number',
                                            e.target.value,
                                        )
                                    }
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('payments.paymentDate')}
                                description={t(
                                    'payments.paymentDateDescription',
                                )}
                            >
                                <Input
                                    placeholder={t(
                                        'payments.paymentDatePlaceholder',
                                    )}
                                    value={data.payment_date}
                                    onChange={(e) =>
                                        setData('payment_date', e.target.value)
                                    }
                                    required
                                    type="date"
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('payments.amount')}
                                description={t('payments.amountDescription')}
                            >
                                <Input
                                    placeholder={t(
                                        'payments.amountPlaceholder',
                                    )}
                                    value={data.amount_minor}
                                    onChange={(e) =>
                                        setData('amount_minor', e.target.value)
                                    }
                                    type="number"
                                    min="1"
                                    required
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('payments.status')}
                                description={t('payments.statusDescription')}
                            >
                                <Select
                                    value={data.status}
                                    onValueChange={(value) =>
                                        setData('status', value)
                                    }
                                    placeholder={t(
                                        'payments.statusPlaceholder',
                                    )}
                                    required
                                >
                                    <option value="">
                                        {t('payments.statusPlaceholder')}
                                    </option>
                                    {STATUSES.map((status) => (
                                        <option
                                            key={status.value}
                                            value={status.value}
                                        >
                                            {t(
                                                `payments.statuses.${status.value}`,
                                            )}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>
                        </FormSection>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-4">
                        <Button asChild variant="outline">
                            <Link href={LIST_URL(school.id)}>
                                {t('common.cancel')}
                            </Link>
                        </Button>
                        <Button onClick={handleSubmit} isLoading={processing}>
                            {t('common.update')}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
