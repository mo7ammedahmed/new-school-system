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
    student: {
        id: number;
        first_name: string;
        last_name: string;
        student_number: string;
        date_of_birth: string | null;
        gender: string | null;
        phone: string | null;
        email: string | null;
        address: string | null;
        status: string;
    };
};

export default function StudentEdit({ student }: Props) {
    const { data, setData, post, put, processing, errors } = useForm(
        {
            first_name: student.first_name,
            last_name: student.last_name,
            student_number: student.student_number,
            date_of_birth: student.date_of_birth ?? '',
            gender: student.gender ?? '',
            phone: student.phone ?? '',
            email: student.email ?? '',
            address: student.address ?? '',
            status: student.status,
        },
    );

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/portal/students/${student.id}`, {
            onSuccess: () => {
                // Show success toast
                setToastMessage('Student updated successfully.');
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
            <Head
                title={`Edit Student: ${student.first_name} ${student.last_name}`}
            />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">Edit Student</h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Button href="/admin/students" variant="outline">
                            Back to Students
                        </Button>
                    </div>
                </div>

                {/* Toast would go here in a real implementation */}

                <Card>
                    <CardHeader>
                        <CardTitle>Student Information</CardTitle>
                        <CardDescription>
                            Edit the details for this student.
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
                                <Select
                                    value={data.gender}
                                    onValueChange={(value) =>
                                        setData('gender', value)
                                    }
                                    placeholder="Select gender"
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </Select>
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
                                <Select
                                    value={data.status}
                                    onValueChange={(value) =>
                                        setData('status', value)
                                    }
                                    placeholder="Select status"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="graduated">Graduated</option>
                                    <option value="withdrawn">Withdrawn</option>
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
                            Update Student
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}
