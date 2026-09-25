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
import { FormErrors } from '@/components/forms/form-errors';
import { FormField } from '@/components/forms/form-field';
import { FormSection } from '@/components/forms/form-section';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

type _Props = {};

export default function StudentCreate() {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        last_name: '',
        student_number: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        status: 'active',
    });

    const [_showToast, setShowToast] = useState(false);
    const [_toastMessage, setToastMessage] = useState('');
    const [_toastType, setToastType] = useState<'success' | 'error'>('success');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/portal/students`, {
            onSuccess: () => {
                // Show success toast
                setToastMessage('Student created successfully.');
                setToastType('success');
                setShowToast(true);
            },
            onError: (_errors) => {
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
            <Head title="New Student" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">New Student</h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Button asChild variant="outline">
                            <Link href="/portal/students">
                                Back to Students
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Toast would go here in a real implementation */}

                <Card>
                    <CardHeader>
                        <CardTitle>Student Information</CardTitle>
                        <CardDescription>
                            Enter the details for the new student.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormErrors errors={errors} />

                        <FormSection>
                            <FormField
                                label="First Name"
                                description="Enter the student's first name"
                            >
                                <Input
                                    placeholder="First name"
                                    value={data.first_name}
                                    onChange={(e) =>
                                        setData('first_name', e.target.value)
                                    }
                                    required
                                    maxLength={160}
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label="Last Name"
                                description="Enter the student's last name"
                            >
                                <Input
                                    placeholder="Last name"
                                    value={data.last_name}
                                    onChange={(e) =>
                                        setData('last_name', e.target.value)
                                    }
                                    required
                                    maxLength={160}
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label="Student ID"
                                description="Enter the unique student identification number"
                            >
                                <Input
                                    placeholder="STU001"
                                    value={data.student_number}
                                    onChange={(e) =>
                                        setData(
                                            'student_number',
                                            e.target.value,
                                        )
                                    }
                                    required
                                    maxLength={80}
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label="Date of Birth"
                                description="Select the student's date of birth"
                            >
                                <input
                                    type="date"
                                    value={data.date_of_birth}
                                    onChange={(e) =>
                                        setData('date_of_birth', e.target.value)
                                    }
                                    className="input-input"
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label="Gender"
                                description="Select the student's gender"
                            >
                                <select
                                    className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                                    value={data.gender}
                                    onChange={(e) =>
                                        setData('gender', e.target.value)
                                    }
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label="Phone Number"
                                description="Enter the student's phone number"
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
                                label="Email Address"
                                description="Enter the student's email address"
                            >
                                <Input
                                    placeholder="email@example.com"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    type="email"
                                    maxLength={255}
                                />
                            </FormField>
                        </FormSection>

                        <FormSection>
                            <FormField
                                label="Address"
                                description="Enter the student's address"
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
                                label="Status"
                                description="Select the student's current status"
                            >
                                <select
                                    className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
                                    value={data.status}
                                    onChange={(e) =>
                                        setData('status', e.target.value)
                                    }
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="graduated">Graduated</option>
                                    <option value="withdrawn">Withdrawn</option>
                                </select>
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
                            Create Student
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
