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
    academicClasses: Array<{ id: number; name: string }>;
};

const LIST_URL = (schoolId: number) => `/admin/schools/${schoolId}/sections`;
const CREATE_URL = (schoolId: number) => `/admin/schools/${schoolId}/sections`;

export default function SectionCreate({ school, academicClasses }: Props) {
    const { t } = useT();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        class_id: '',
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
            <Head title={t('sections.create')} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">{t('sections.create')}</h1>
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
                        <CardTitle>{t('sections.form.title')}</CardTitle>
                        <CardDescription>
                            {t('sections.form.createDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormErrors errors={errors} />

                        <FormSection>
                            <FormField
                                label={t('sections.name')}
                                description={t('sections.nameDescription')}
                            >
                                <Input
                                    placeholder={t('sections.namePlaceholder')}
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('sections.academicClass')}
                                description={t('sections.academicClassDescription')}
                            >
                                <Select
                                    value={data.class_id}
                                    onValueChange={(value) =>
                                        setData('class_id', value)
                                    }
                                    placeholder={t('sections.academicClassPlaceholder')}
                                    required
                                >
                                    {academicClasses.map((academicClass) => (
                                        <option
                                            key={academicClass.id}
                                            value={academicClass.id}
                                        >
                                            {academicClass.name}
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
                            {t('common.create')}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}