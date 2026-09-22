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
import { Select } from '@/components/ui/select';
import { Toast } from '@/components/ui/toast';
import { useState } from 'react';

type Props = {
    school: { id: number; name: string };
    section: {
        id: number;
        name: string;
        class_id: number;
    };
    academicClasses: Array<{ id: number; name: string }>;
};

export default function SectionEdit({
    school,
    section,
    academicClasses,
}: Props) {
    const { data, setData, post, put, processing, errors } = useForm(
        {
            name: section.name,
            class_id: section.class_id,
        },
    );

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/schools/${school.id}/sections/${section.id}`, {
            onSuccess: () => {
                // Show success toast
                setToastMessage('Section updated successfully.');
                setToastType('success');
                setShowToast(true);
            },
            onError: () => {
                // Show error toast
                setToastMessage('Something went wrong. Please try again.');
                setToastType('error');
                setShowToast(true);
            },
        });
    };

    return (
        <>
            <Head title={`Edit Section — ${school.name}`} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">Edit Section</h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Button
                            href={`/admin/schools/${school.id}/sections`}
                            variant="outline"
                        >
                            Back to Sections
                        </Button>
                    </div>
                </div>

                {/* Toast would go here in a real implementation */}

                <Card>
                    <CardHeader>
                        <CardTitle>Section Information</CardTitle>
                        <CardDescription>
                            Edit the details for this section.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormErrors errors={errors} />

                        <FormSection>
                            <FormField
                                label="Name"
                                description="Enter the name of the section (e.g., A, B, C)"
                            >
                                <Input
                                    placeholder="Section A"
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
                                label="Academic Class"
                                description="Select the academic class for this section"
                            >
                                <Select
                                    value={data.class_id}
                                    onValueChange={(value) =>
                                        setData('class_id', value)
                                    }
                                    placeholder="Select academic class"
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
                            Update Section
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
