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
    academicClass: {
        id: number;
        name: string;
    };
};

export default function AcademicClassEdit({ school, academicClass }: Props) {
    const { data, setData, post, processing, recentSuccessfulSubmit } = useForm({
        name: academicClass.name,
    });

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/schools/${school.id}/academic-classes/${academicClass.id}`, {
            onSuccess: () => {
                // Show success toast
                setToastMessage('Academic class updated successfully.');
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
            <Head title={`Edit Academic Class — ${school.name}`} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">Edit Academic Class</h1>
                    <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
                        <Button
                            href={`/admin/schools/${school.id}/academic-classes`}
                            variant="outline"
                        >
                            Back to Academic Classes
                        </Button>
                    </div>
                </div>

                {/* Toast would go here in a real implementation */}

                <Card>
                    <CardHeader>
                        <CardTitle>Academic Class Information</CardTitle>
                        <CardDescription>
                            Edit the details for this academic class.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormSection>
                            <FormField
                                label="Name"
                                description="Enter the name of the academic class (e.g., Grade 1, Year 2)"
                            >
                                <Input
                                    placeholder="Grade 1"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
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
                        <Button
                            onClick={handleSubmit}
                            isLoading={processing}
                        >
                            Update Academic Class
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}