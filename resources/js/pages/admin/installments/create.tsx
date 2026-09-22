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
import { Switch } from '@/components/ui/switch';
import { useT } from '@/hooks/useT';

type Props = {
    school: { id: number; name: string };
};

const LIST_URL = (schoolId: number) => `/admin/schools/${schoolId}/installments`;
const CREATE_URL = (schoolId: number) => `/admin/schools/${schoolId}/installments`;

const STATUSES = [
    { value: 'created', label: 'Created' },
    { value: 'succeeded', label: 'Succeeded' },
    { value: 'partially_paid', label: 'Partially Paid' },
    { value: 'paid', label: 'Paid' },
] as const;

export default function InstallmentCreate({ school }: Props) {
    const { t } = useT();
    const { data, setData, post, processing, errors } = useForm({
        invoice_id: '',
        sequence: '',
        due_on: '',
        amount_minor: '',
        paid_minor: '',
        status: 'created',
        paid_at: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(CREATE_URL(school.id), {
            onSuccess: () => {
                // Success toast handled by Inertia flash message
            },
        });
    };

    return (
        <>
            <Head title={t('installments.create')} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">{t('installments.create')}</h1>
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
                        <CardTitle>{t('installments.form.title')}</CardTitle>
                        <CardDescription>
                            {t('installments.form.createDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormErrors errors={errors} />

                        <FormSection>
                            <FormField
                                label={t('installments.invoice')}
                                description={t('installments.invoiceDescription')}
                            >
                                <Input
                                    placeholder={t('installments.invoicePlaceholder')}
                                    value={data.invoice_id}
                                    onChange={(e) =>
                                        setData('invoice_id', e.target.value)
                                    }
                                    required
                                    type="number"
                                    min="1"
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('installments.sequence')}
                                description={t('installments.sequenceDescription')}
                            >
                                <Input
                                    placeholder={t('installments.sequencePlaceholder')}
                                    value={data.sequence}
                                    onChange={(e) =>
                                        setData('sequence', e.target.value)
                                    }
                                    required
                                    type="number"
                                    min="1"
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('installments.dueDate')}
                                description={t('installments.dueDateDescription')}
                            >
                                <Input
                                    placeholder={t('installments.dueDatePlaceholder')}
                                    value={data.due_on}
                                    onChange={(e) =>
                                        setData('due_on', e.target.value)
                                    }
                                    required
                                    type="date"
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('installments.amount')}
                                description={t('installments.amountDescription')}
                            >
                                <Input
                                    placeholder={t('installments.amountPlaceholder')}
                                    value={data.amount_minor}
                                    onChange={(e) =>
                                        setData('amount_minor', e.target.value)
                                    }
                                    type="number"
                                    min="0"
                                    required
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('installments.paidAmount')}
                                description={t('installments.paidAmountDescription')}
                            >
                                <Input
                                    placeholder={t('installments.paidAmountPlaceholder')}
                                    value={data.paid_minor}
                                    onChange={(e) =>
                                        setData('paid_minor', e.target.value)
                                    }
                                    type="number"
                                    min="0"
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('installments.status')}
                                description={t('installments.statusDescription')}
                            >
                                <Select
                                    value={data.status}
                                    onValueChange={(value) =>
                                        setData('status', value)
                                    }
                                    placeholder={t('installments.statusPlaceholder')}
                                    required
                                >
                                    <option value="">{t('installments.statusPlaceholder')}</option>
                                    {STATUSES.map((status) => (
                                        <option key={status.value} value={status.value}>
                                            {t(`installments.statuses.${status.value}`)}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('installments.paidDate')}
                                description={t('installments.paidDateDescription')}
                            >
                                <Input
                                    placeholder={t('installments.paidDatePlaceholder')}
                                    value={data.paid_at}
                                    onChange={(e) =>
                                        setData('paid_at', e.target.value)
                                    }
                                    type="date"
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
                            {t('common.create')}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}