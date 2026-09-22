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

const LIST_URL = (schoolId: number) => `/admin/schools/${schoolId}/fee-structures`;
const CREATE_URL = (schoolId: number) => `/admin/schools/${schoolId}/fee-structures`;

const CURRENCIES = [
    { value: 'SAR', label: 'Saudi Riyal' },
    { value: 'USD', label: 'US Dollar' },
    { value: 'EUR', label: 'Euro' },
    { value: 'GBP', label: 'British Pound' },
] as const;

const FREQUENCIES = [
    { value: 'one_time', label: 'One Time' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'termly', label: 'Termly' },
    { value: 'yearly', label: 'Yearly' },
] as const;

export default function FeeStructureCreate({ school }: Props) {
    const { t } = useT();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        amount_minor: '',
        currency: '',
        frequency: '',
        is_active: true,
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
            <Head title={t('feeStructures.create')} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">{t('feeStructures.create')}</h1>
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
                        <CardTitle>{t('feeStructures.form.title')}</CardTitle>
                        <CardDescription>
                            {t('feeStructures.form.createDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormErrors errors={errors} />

                        <FormSection>
                            <FormField
                                label={t('feeStructures.name')}
                                description={t('feeStructures.nameDescription')}
                            >
                                <Input
                                    placeholder={t('feeStructures.namePlaceholder')}
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                    maxLength={160}
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('feeStructures.description')}
                                description={t('feeStructures.descriptionDescription')}
                            >
                                <Textarea
                                    placeholder={t('feeStructures.descriptionPlaceholder')}
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    maxLength={500}
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('feeStructures.amount')}
                                description={t('feeStructures.amountDescription')}
                            >
                                <Input
                                    placeholder={t('feeStructures.amountPlaceholder')}
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
                                label={t('feeStructures.currency')}
                                description={t('feeStructures.currencyDescription')}
                            >
                                <Select
                                    value={data.currency}
                                    onValueChange={(value) =>
                                        setData('currency', value)
                                    }
                                    placeholder={t('feeStructures.currencyPlaceholder')}
                                    required
                                >
                                    <option value="">{t('feeStructures.currencyPlaceholder')}</option>
                                    {CURRENCIES.map((currency) => (
                                        <option key={currency.value} value={currency.value}>
                                            {t(`currencies.${currency.value}`)}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('feeStructures.frequency')}
                                description={t('feeStructures.frequencyDescription')}
                            >
                                <Select
                                    value={data.frequency}
                                    onValueChange={(value) =>
                                        setData('frequency', value)
                                    }
                                    placeholder={t('feeStructures.frequencyPlaceholder')}
                                    required
                                >
                                    <option value="">{t('feeStructures.frequencyPlaceholder')}</option>
                                    {FREQUENCIES.map((frequency) => (
                                        <option key={frequency.value} value={frequency.value}>
                                            {t(`frequencies.${frequency.value}`)}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('feeStructures.isActive')}
                                description={t('feeStructures.isActiveDescription')}
                            >
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', checked)
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
                            {t('common.create')}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}