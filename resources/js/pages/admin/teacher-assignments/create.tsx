import { Head, useForm, usePage, useRemember } from '@inertiajs/react';
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
import { Toast } from '@/components/ui/toast';
import { useState } from 'react';

type Props = {
    school: { id: number; name: string };
    teachers: Array<{ id: number; name: string }>;
    sections: Array<{
        id: number;
        name: string;
        academic_class_id: number;
        academic_class: { name: string };
    }>;
};

export default function TeacherAssignmentCreate({
    school,
    teachers,
    sections,
}: Props) {
    const { data, setData, post, processing, errors } = useForm(
        {
            teacher_id: '',
            section_id: '',
        },
    );

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/schools/${school.id}/teacher-assignments`, {
            onSuccess: () => {
                // Show success toast
                setToastMessage('Teacher assigned to section successfully.');
                setToastType('success');
                setShowToast(true);
            },
            onError: (errors) => {
                // Show error toast
                setToastMessage('Please correct the errors and try again.');
                setToastType('error');
                setShowToast(true);
                // In a real implementation, the form errors would be displayed automatically
            },
        });
    };

    return (
        <>
            <Head title="New Teacher Assignment" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        New Teacher Assignment
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Button
                            href={`/admin/schools/${school.id}/teacher-assignments`}
                            variant="outline"
                        >
                            Back to Assignments
                        </Button>
                    </div>
                </div>

                {/* Toast would go here in a real implementation */}

                <Card>
                    <CardHeader>
                        <CardTitle>Teacher Assignment</CardTitle>
                        <CardDescription>
                            Assign a teacher to a section.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormErrors errors={errors} />

                        <FormSection>
                            <FormField
                                label="Teacher"
                                description="Select the teacher to assign"
                            >
                                <Select
                                    value={data.teacher_id}
                                    onValueChange={(value) =>
                                        setData('teacher_id', value)
                                    }
                                    placeholder="Select teacher"
                                    required
                                >
                                    <option value="">Select teacher</option>
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
                                label="Section"
                                description="Select the section to assign the teacher to"
                            >
                                <Select
                                    value={data.section_id}
                                    onValueChange={(value) =>
                                        setData('section_id', value)
                                    }
                                    placeholder="Select section"
                                    required
                                >
                                    <option value="">Select section</option>
                                    {sections.map((section) => (
                                        <option
                                            key={section.id}
                                            value={section.id}
                                        >
                                            {section.name} (
                                            {section.academic_class.name})
                                        </option>
                                    ))}
                                </Select>
                            </FormField>
                        </FormSection>
                    </CardContent>
                    <CardFooter className="flex justify-end pt-4">
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                // In a real implementation, you would navigate back
                            }}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} isLoading={processing}>
                            Assign Teacher
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
