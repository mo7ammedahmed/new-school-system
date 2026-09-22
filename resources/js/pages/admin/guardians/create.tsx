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
};

export default function GuardianCreate({ school }: Props) {
    const { data, setData, post, processing, errors } = useForm(
        {
            name: '',
            email: '',
            phone: '',
            address: '',
            occupation: '',
            relationship: '',
        },
    );

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/admin/schools/${school.id}/guardians`, {
            onSuccess: () => {
                // Show success toast
                setToastMessage('Guardian created successfully.');
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
            <Head title="New Guardian" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">New Guardian</h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Button
                            href={`/admin/schools/${school.id}/guardians`}
                            variant="outline"
                        >
                            Back to Guardians
                        </Button>
                    </div>
                </div>

                {/* Toast would go here in a real implementation */}

                <Card>
                    <CardHeader>
                        <CardTitle>Guardian Information</CardTitle>
                        <CardDescription>
                            Enter the details for the new guardian.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormErrors errors={errors} />

                        <FormSection>
                            <FormField
                                label="Name"
                                description="Enter the guardian's full name"
                            >
                                <Input
                                    placeholder="Full name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                    maxLength={160}
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label="Email Address"
                                description="Enter the guardian's email address"
                            >
                                <Input
                                    placeholder="email@example.com"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    type="email"
                                    required
                                    maxLength={255}
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label="Phone Number"
                                description="Enter the guardian's phone number"
                            >
                                <Input
                                    placeholder="Phone number"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData('phone', e.target.value)
                                    }
                                    maxLength={40}
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label="Address"
                                description="Enter the guardian's address"
                            >
                                <Input
                                    placeholder="Address"
                                    value={data.address}
                                    onChange={(e) =>
                                        setData('address', e.target.value)
                                    }
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label="Occupation"
                                description="Enter the guardian's occupation"
                            >
                                <Input
                                    placeholder="Occupation"
                                    value={data.occupation}
                                    onChange={(e) =>
                                        setData('occupation', e.target.value)
                                    }
                                    maxLength={160}
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label="Relationship"
                                description="Select the guardian's relationship to the student(s)"
                            >
                                <Select
                                    value={data.relationship}
                                    onValueChange={(value) =>
                                        setData('relationship', value)
                                    }
                                    placeholder="Select relationship"
                                >
                                    <option value="">
                                        Select relationship
                                    </option>
                                    <option value="father">Father</option>
                                    <option value="mother">Mother</option>
                                    <option value="guardian">Guardian</option>
                                    <option value="other">Other</option>
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
                            Create Guardian
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
