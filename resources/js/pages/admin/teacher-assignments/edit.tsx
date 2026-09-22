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
import { Select } from '@/components/ui/select';
import { useT } from '@/hooks/useT';

type Props = {
    school: { id: number; name: string };
    assignment: {
        id: number;
        teacher_id: number;
        section_id: number;
    };
    teachers: Array<{ id: number; name: string }>;
    sections: Array<{
        id: number;
        name: string;
        academic_class_id: number;
        academic_class: { name: string };
    }>;
};

const LIST_URL = (schoolId: number) => `/admin/schools/${schoolId}/teacher-assignments`;
const EDIT_URL = (schoolId: number, assignmentId: number) =>
    `/admin/schools/${schoolId}/teacher-assignments/${assignmentId}`;

export default function TeacherAssignmentEdit({
    school,
    assignment,
    teachers,
    sections,
}: Props) {
    const { t } = useT();
    const { data, setData, put, processing, errors } = useForm({
        teacher_id: assignment.teacher_id,
        section_id: assignment.section_id,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(EDIT_URL(school.id, assignment.id), {
            onSuccess: () => {
                // Success toast handled by Inertia flash message
            },
        });
    };

    return (
        <>
            <Head title={t('teacherAssignments.edit')} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">{t('teacherAssignments.edit')}</h1>
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
                        <CardTitle>{t('teacherAssignments.form.title')}</CardTitle>
                        <CardDescription>
                            {t('teacherAssignments.form.editDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormErrors errors={errors} />

                        <FormSection>
                            <FormField
                                label={t('teacherAssignments.teacher')}
                                description={t('teacherAssignments.teacherDescription')}
                            >
                                <Select
                                    value={data.teacher_id}
                                    onValueChange={(value) =>
                                        setData('teacher_id', Number(value))
                                    }
                                    placeholder={t('teacherAssignments.teacherPlaceholder')}
                                    required
                                >
                                    <option value="">{t('teacherAssignments.teacherPlaceholder')}</option>
                                    {teachers.map((teacher) => (
                                        <option
                                            key={teacher.id}
                                            value={teacher.id}
                                        >
                                            {teacher.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label={t('teacherAssignments.section')}
                                description={t('teacherAssignments.sectionDescription')}
                            >
                                <Select
                                    value={data.section_id}
                                    onValueChange={(value) =>
                                        setData('section_id', Number(value))
                                    }
                                    placeholder={t('teacherAssignments.sectionPlaceholder')}
                                    required
                                >
                                    <option value="">{t('teacherAssignments.sectionPlaceholder')}</option>
                                    {sections.map((section) => (
                                        <option
                                            key={section.id}
                                            value={section.id}
                                        >
                                            {section.name} ({section.academic_class.name})
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