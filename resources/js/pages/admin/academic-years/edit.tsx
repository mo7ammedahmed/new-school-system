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
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/forms/form-field';
import { FormSection } from '@/components/forms/form-section';
import { FormErrors } from '@/components/forms/form-errors';
import { Input } from '@/components/ui/input';
import { useT } from '@/hooks/useT';

type Props = {
    school: { id: number; name: string };
    academicYear: {
        id: number;
        name: string;
        starts_on: string;
        ends_on: string;
        is_current: boolean;
    };
};

const LIST_URL = (schoolId: number) => `/admin/schools/${schoolId}/academic-years`;
const EDIT_URL = (schoolId: number, yearId: number) =>
    `/admin/schools/${schoolId}/academic-years/${yearId}`;

export default function AcademicYearEdit({ school, academicYear }: Props) {
    const { t } = useT();
    const { data, setData, put, processing, errors } = useForm({
        name: academicYear.name,
        starts_on: academicYear.starts_on,
        ends_on: academicYear.ends_on,
        is_current: academicYear.is_current,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(EDIT_URL(school.id, academicYear.id), {
            onSuccess: () => {
                // Success toast handled by Inertia flash message
            },
        });
    };

    return (
        <>
            <Head title={t('academicYears.edit', { name: academicYear.name })} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('academicYears.edit', { name: academicYear.name })}
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
                        <CardTitle>{t('academicYears.form.title')}</CardTitle>
                        <CardDescription>
                            {t('academicYears.form.editDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormErrors errors={errors} />

                        <FormSection>
                            <FormField
                                label={t('academicYears.name')}
                                description={t('academicYears.nameDescription')}
                            >
                                <Input
                                    placeholder={t('academicYears.namePlaceholder')}
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
                                label={t('academicYears.startsOn')}
                                description={t('academicYears.startsOnDescription')}
                            >
                                <Input
                                    type="date"
                                    value={data.starts_on}
                                    onChange={(e) =>
                                        setData('starts_on', e.target.value)
                                    }
                                    required
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('academicYears.endsOn')}
                                description={t('academicYears.endsOnDescription')}
                            >
                                <Input
                                    type="date"
                                    value={data.ends_on}
                                    onChange={(e) =>
                                        setData('ends_on', e.target.value)
                                    }
                                    required
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('academicYears.isCurrent')}
                                description={t('academicYears.isCurrentDescription')}
                            >
                                <Checkbox
                                    checked={data.is_current}
                                    onCheckedChange={(checked) =>
                                        setData('is_current', checked)
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