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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from '@inertiajs/react';
import { Select } from '@/components/ui/select';
import { Toast } from '@/components/ui/toast';
import { useState } from 'react';

type Props = {
    school: { id: number; name: string };
    students: Array<{
        id: number;
        first_name: string;
        last_name: string;
        student_number: string;
    }>;
    academicYears: Array<{ id: number; name: string }>;
    academicClasses: Array<{ id: number; name: string }>;
    sections: Array<{ id: number; name: string }>;
};

export default function EnrollmentCreate({
    school,
    students,
    academicYears,
    academicClasses,
    sections,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        academic_year_id: '',
        class_id: '',
        section_id: '',
        enrolled_on: '',
    });

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/schools/${school.id}/enrollments`, {
            onSuccess: () => {
                // Show success toast
                setToastMessage('Enrollment created successfully.');
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
            <Head title={`New Enrollment — ${school.name}`} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">New Enrollment</h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/enrollments`}
                            className="text-muted-foreground hover:text-primary rounded bg-transparent px-4 py-2 text-sm font-medium"
                        >
                            Back to Enrollments
                        </Link>
                    </div>
                </div>

                {/* Toast would go here in a real implementation */}

                <Card>
                    <CardHeader>
                        <CardTitle>Enrollment Information</CardTitle>
                        <CardDescription>
                            Enter the details for the new enrollment.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormErrors errors={errors} />

                        <FormSection>
                            <FormField
                                label="Student"
                                description="Select the student to enroll"
                            >
                                <Select
                                    value={data.student_id}
                                    onValueChange={(value) =>
                                        setData('student_id', value)
                                    }
                                    placeholder="Select student"
                                    required
                                >
                                    {students.map((student) => (
                                        <option
                                            key={student.id}
                                            value={student.id}
                                        >
                                            {student.first_name}{' '}
                                            {student.last_name} (
                                            {student.student_number})
                                        </option>
                                    ))}
                                </Select>
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label="Academic Year"
                                description="Select the academic year for this enrollment"
                            >
                                <Select
                                    value={data.academic_year_id}
                                    onValueChange={(value) =>
                                        setData('academic_year_id', value)
                                    }
                                    placeholder="Select academic year"
                                    required
                                >
                                    {academicYears.map((year) => (
                                        <option key={year.id} value={year.id}>
                                            {year.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label="Class"
                                description="Select the academic class for this enrollment"
                            >
                                <Select
                                    value={data.class_id}
                                    onValueChange={(value) =>
                                        setData('class_id', value)
                                    }
                                    placeholder="Select class"
                                    required
                                >
                                    {academicClasses.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label="Section"
                                description="Select the section for this enrollment (optional)"
                            >
                                <Select
                                    value={data.section_id}
                                    onValueChange={(value) =>
                                        setData('section_id', value)
                                    }
                                    placeholder="Select section"
                                >
                                    <option value="">None</option>
                                    {sections.map((sec) => (
                                        <option key={sec.id} value={sec.id}>
                                            {sec.name}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label="Enrollment Date"
                                description="Select the date of enrollment"
                            >
                                <Input
                                    type="date"
                                    value={data.enrolled_on}
                                    onChange={(e) =>
                                        setData('enrolled_on', e.target.value)
                                    }
                                    required
                                />
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
                            Create Enrollment
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
