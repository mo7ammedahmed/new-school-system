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
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/hooks/useT';

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
    };
};

const LIST_URL = (schoolId: number) => `/admin/schools/${schoolId}/invoices`;
const EDIT_URL = (schoolId: number, invoiceId: number) =>
    `/admin/schools/${schoolId}/invoices/${invoiceId}`;

const STATUSES = [
    { value: 'draft', label: 'Draft' },
    { value: 'issued', label: 'Issued' },
    { value: 'paid', label: 'Paid' },
    { value: 'voided', label: 'Voided' },
] as const;

const CURRENCIES = [
    { value: 'SAR', label: 'Saudi Riyal' },
    { value: 'USD', label: 'US Dollar' },
    { value: 'EUR', label: 'Euro' },
    { value: 'GBP', label: 'British Pound' },
] as const;

export default function InvoiceEdit({ school, invoice }: Props) {
    const { t } = useT();
    const { data, setData, put, processing, errors } = useForm({
        student_id: String(invoice.student_id ?? ''),
        issued_by: String(invoice.issued_by ?? ''),
        number: invoice.number,
        issued_on: invoice.issued_on ?? '',
        due_on: invoice.due_on ?? '',
        status: invoice.status,
        currency: invoice.currency,
        subtotal_minor: String(invoice.subtotal_minor ?? ''),
        total_minor: String(invoice.total_minor ?? ''),
        items: JSON.stringify(invoice.items),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(EDIT_URL(school.id, invoice.id), {
            onSuccess: () => {
                // Success toast handled by Inertia flash message
            },
        });
    };

    return (
        <>
            <Head title={t('invoices.edit', { number: invoice.number })} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('invoices.edit', { number: invoice.number })}
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
                        <CardTitle>{t('invoices.form.title')}</CardTitle>
                        <CardDescription>
                            {t('invoices.form.editDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormErrors errors={errors} />

                        <FormSection>
                            <FormField
                                label={t('invoices.student')}
                                description={t('invoices.studentDescription')}
                            >
                                <Input
                                    placeholder={t(
                                        'invoices.studentPlaceholder',
                                    )}
                                    value={data.student_id}
                                    onChange={(e) =>
                                        setData('student_id', e.target.value)
                                    }
                                    required
                                    type="number"
                                    min="1"
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('invoices.issuedBy')}
                                description={t('invoices.issuedByDescription')}
                            >
                                <Input
                                    placeholder={t(
                                        'invoices.issuedByPlaceholder',
                                    )}
                                    value={data.issued_by}
                                    onChange={(e) =>
                                        setData('issued_by', e.target.value)
                                    }
                                    required
                                    type="number"
                                    min="1"
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('invoices.number')}
                                description={t('invoices.numberDescription')}
                            >
                                <Input
                                    placeholder={t(
                                        'invoices.numberPlaceholder',
                                    )}
                                    value={data.number}
                                    onChange={(e) =>
                                        setData('number', e.target.value)
                                    }
                                    required
                                    maxLength={50}
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('invoices.issuedDate')}
                                description={t(
                                    'invoices.issuedDateDescription',
                                )}
                            >
                                <Input
                                    placeholder={t(
                                        'invoices.issuedDatePlaceholder',
                                    )}
                                    value={data.issued_on}
                                    onChange={(e) =>
                                        setData('issued_on', e.target.value)
                                    }
                                    required
                                    type="date"
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('invoices.dueDate')}
                                description={t('invoices.dueDateDescription')}
                            >
                                <Input
                                    placeholder={t(
                                        'invoices.dueDatePlaceholder',
                                    )}
                                    value={data.due_on}
                                    onChange={(e) =>
                                        setData('due_on', e.target.value)
                                    }
                                    type="date"
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('invoices.status')}
                                description={t('invoices.statusDescription')}
                            >
                                <Select
                                    value={data.status}
                                    onValueChange={(value) =>
                                        setData('status', value)
                                    }
                                    placeholder={t(
                                        'invoices.statusPlaceholder',
                                    )}
                                    required
                                >
                                    <option value="">
                                        {t('invoices.statusPlaceholder')}
                                    </option>
                                    {STATUSES.map((status) => (
                                        <option
                                            key={status.value}
                                            value={status.value}
                                        >
                                            {t(
                                                `invoices.statuses.${status.value}`,
                                            )}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('invoices.currency')}
                                description={t('invoices.currencyDescription')}
                            >
                                <Select
                                    value={data.currency}
                                    onValueChange={(value) =>
                                        setData('currency', value)
                                    }
                                    placeholder={t(
                                        'invoices.currencyPlaceholder',
                                    )}
                                    required
                                >
                                    <option value="">
                                        {t('invoices.currencyPlaceholder')}
                                    </option>
                                    {CURRENCIES.map((currency) => (
                                        <option
                                            key={currency.value}
                                            value={currency.value}
                                        >
                                            {t(`currencies.${currency.value}`)}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('invoices.subtotal')}
                                description={t('invoices.subtotalDescription')}
                            >
                                <Input
                                    placeholder={t(
                                        'invoices.subtotalPlaceholder',
                                    )}
                                    value={data.subtotal_minor}
                                    onChange={(e) =>
                                        setData(
                                            'subtotal_minor',
                                            e.target.value,
                                        )
                                    }
                                    type="number"
                                    min="0"
                                    required
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('invoices.total')}
                                description={t('invoices.totalDescription')}
                            >
                                <Input
                                    placeholder={t('invoices.totalPlaceholder')}
                                    value={data.total_minor}
                                    onChange={(e) =>
                                        setData('total_minor', e.target.value)
                                    }
                                    type="number"
                                    min="0"
                                    required
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('invoices.items')}
                                description={t('invoices.itemsDescription')}
                            >
                                <Textarea
                                    placeholder={t('invoices.itemsPlaceholder')}
                                    value={data.items}
                                    onChange={(e) =>
                                        setData('items', e.target.value)
                                    }
                                />
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
