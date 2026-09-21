import { Head, useForm, usePage, useRemember } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/forms/form-field';
import { FormSection } from '@/components/forms/form-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toast } from '@/components/ui/toast';
import { useState } from 'react';

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

export default function AcademicYearEdit({ school, academicYear }: Props) {
    const { data, setData, post, processing, recentSuccessfulSubmit } = useForm({
        name: academicYear.name,
        starts_on: academicYear.starts_on,
        ends_on: academicYear.ends_on,
        is_current: academicYear.is_current,
    });

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/schools/${school.id}/academic-years/${academicYear.id}`, {
            onSuccess: () => {
                // Show success toast
                setToastMessage('Academic year updated successfully.');
                setToastType('success');
                setShowToast(true);
            },
            onError: () => {
                // Show error toast
                setToastMessage('Something went wrong. Please try again.');
                setToastType('error');
                setShowToast(true);
            }
        });
    };

    return (
        <>
            <Head title={`Edit Academic Year — ${school.name}`} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">Edit Academic Year</h1>
                    <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
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
                            Edit the details for this academic year.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormSection>
                            <FormField
                                label="Name"
                                description="Enter the name of the academic year (e.g., 2026-2027)"
                            >
                                <Input
                                    placeholder="2026-2027"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
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
                                    onChange={(e) => setData('starts_on', e.target.value)}
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
                                    onChange={(e) => setData('ends_on', e.target.value)}
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
                                    onChange={(e) => setData('is_current', e.target.checked)}
                                    className="h-4 w-4 text-primary-foreground border-gray-300 rounded focus:ring-primary"
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
                        <Button
                            onClick={handleSubmit}
                            isLoading={processing}
                        >
                            Update Academic Year
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}