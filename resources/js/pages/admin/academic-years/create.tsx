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
import { Toast } from '@/components/ui/toast';
import { useState } from 'react';

type Props = {
    school: { id: number; name: string };
};

export default function AcademicYearCreate({ school }: Props) {
    const { data, setData, post, processing, errors } = useForm(
        {
            name: '',
            starts_on: '',
            ends_on: '',
            is_current: false,
        },
    );

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/schools/${school.id}/academic-years`, {
            onSuccess: () => {
                // Show success toast
                setToastMessage('Academic year created successfully.');
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
            <Head title={`New Academic Year — ${school.name}`} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        New Academic Year
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Button
                            href={`/admin/schools/${school.id}/academic-years`}
                            variant="outline"
                        >
                            Back to Academic Years
                        </Button>
                    </div>
                </div>

                {/* Toast would go here in a real implementation */}

                <Card>
                    <CardHeader>
                        <CardTitle>Academic Year Information</CardTitle>
                        <CardDescription>
                            Enter the details for the new academic year.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormErrors errors={errors} />

                        <FormSection>
                            <FormField
                                label="Name"
                                description="Enter the name of the academic year (e.g., 2026-2027)"
                            >
                                <Input
                                    placeholder="2026-2027"
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
                                label="Start Date"
                                description="Select the start date of the academic year"
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
                                label="End Date"
                                description="Select the end date of the academic year"
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
                                label="Current Academic Year"
                                description="Check if this is the current academic year"
                            >
                                <input
                                    type="checkbox"
                                    checked={data.is_current}
                                    onChange={(e) =>
                                        setData('is_current', e.target.checked)
                                    }
                                    className="text-primary-foreground focus:ring-primary h-4 w-4 rounded border-gray-300"
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
                            Create Academic Year
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
