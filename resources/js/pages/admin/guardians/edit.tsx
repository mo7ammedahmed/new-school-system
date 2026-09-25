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
    guardian: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        address: string | null;
        occupation: string | null;
        relationship: string | null;
    };
};

const LIST_URL = (schoolId: number) => `/admin/schools/${schoolId}/guardians`;
const EDIT_URL = (schoolId: number, guardianId: number) =>
    `/admin/schools/${schoolId}/guardians/${guardianId}`;

const RELATIONSHIPS = [
    { value: 'father', label: 'Father' },
    { value: 'mother', label: 'Mother' },
    { value: 'guardian', label: 'Guardian' },
    { value: 'other', label: 'Other' },
] as const;

export default function GuardianEdit({ school, guardian }: Props) {
    const { t } = useT();
    const { data, setData, put, processing, errors } = useForm({
        name: guardian.name,
        email: guardian.email,
        phone: guardian.phone ?? '',
        address: guardian.address ?? '',
        occupation: guardian.occupation ?? '',
        relationship: guardian.relationship ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(EDIT_URL(school.id, guardian.id), {
            onSuccess: () => {
                // Success toast handled by Inertia flash message
            },
        });
    };

    return (
        <>
            <Head title={t('guardians.edit', { name: guardian.name })} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('guardians.edit', { name: guardian.name })}
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
                        <CardTitle>{t('guardians.form.title')}</CardTitle>
                        <CardDescription>
                            {t('guardians.form.editDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormErrors errors={errors} />

                        <FormSection>
                            <FormField
                                label={t('guardians.name')}
                                description={t('guardians.nameDescription')}
                            >
                                <Input
                                    placeholder={t('guardians.namePlaceholder')}
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
                                label={t('guardians.email')}
                                description={t('guardians.emailDescription')}
                            >
                                <Input
                                    placeholder={t(
                                        'guardians.emailPlaceholder',
                                    )}
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    type="email"
                                    required
                                    maxLength={255}
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('guardians.phone')}
                                description={t('guardians.phoneDescription')}
                            >
                                <Input
                                    placeholder={t(
                                        'guardians.phonePlaceholder',
                                    )}
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    maxLength={40}
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('guardians.address')}
                                description={t('guardians.addressDescription')}
                            >
                                <Input
                                    placeholder={t(
                                        'guardians.addressPlaceholder',
                                    )}
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('guardians.occupation')}
                                description={t(
                                    'guardians.occupationDescription',
                                )}
                            >
                                <Input
                                    placeholder={t(
                                        'guardians.occupationPlaceholder',
                                    )}
                                    value={data.occupation}
                                    onChange={(e) =>
                                        setData('occupation', e.target.value)
                                    }
                                    maxLength={160}
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('guardians.relationship')}
                                description={t(
                                    'guardians.relationshipDescription',
                                )}
                            >
                                <Select
                                    value={data.relationship}
                                    onValueChange={(value) =>
                                        setData('relationship', value)
                                    }
                                    placeholder={t(
                                        'guardians.relationshipPlaceholder',
                                    )}
                                >
                                    <option value="">
                                        {t('guardians.relationshipPlaceholder')}
                                    </option>
                                    {RELATIONSHIPS.map((rel) => (
                                        <option
                                            key={rel.value}
                                            value={rel.value}
                                        >
                                            {rel.label}
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
