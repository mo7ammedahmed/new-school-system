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
import { useT } from '@/hooks/useT';

type Props = {
    school: { id: number; name: string };
    academicClass: {
        id: number;
        name: string;
    };
};

const LIST_URL = (schoolId: number) =>
    `/admin/schools/${schoolId}/academic-classes`;
const EDIT_URL = (schoolId: number, classId: number) =>
    `/admin/schools/${schoolId}/academic-classes/${classId}`;

export default function AcademicClassEdit({ school, academicClass }: Props) {
    const { t } = useT();
    const { data, setData, put, processing, errors } = useForm({
        name: academicClass.name,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(EDIT_URL(school.id, academicClass.id), {
            onSuccess: () => {
                // Success toast handled by Inertia flash message
            },
        });
    };

    return (
        <>
            <Head
                title={t('academicClasses.edit', { name: academicClass.name })}
            />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('academicClasses.edit', {
                            name: academicClass.name,
                        })}
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
                        <CardTitle>{t('academicClasses.form.title')}</CardTitle>
                        <CardDescription>
                            {t('academicClasses.form.editDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormErrors errors={errors} />

                        <FormSection>
                            <FormField
                                label={t('academicClasses.name')}
                                description={t(
                                    'academicClasses.nameDescription',
                                )}
                            >
                                <Input
                                    placeholder={t(
                                        'academicClasses.namePlaceholder',
                                    )}
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
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
