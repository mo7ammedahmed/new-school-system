import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField } from '@/components/forms/form-field';
import { FormSection } from '@/components/forms/form-section';
import { Select } from '@/components/ui/select';
import { useState } from 'react';

type Student = {
    id: number;
    name: string;
    section_id: number;
};

type BulkAttendanceProps = {
    students: Student[];
    onSubmit: (data: {
        status: string;
        notes: string;
        studentIds: number[];
    }) => void;
    onCancel: () => void;
};

export default function BulkAttendance({
    students,
    onSubmit,
    onCancel,
}: BulkAttendanceProps) {
    const [formData, setFormData] = useState({
        status: 'present',
        notes: '',
        studentIds: [] as number[],
    });

    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [_showToast, _setShowToast] = useState(false);
    const [_toastMessage, _setToastMessage] = useState('');
    const [_toastType, _setToastType] = useState<'success' | 'error'>(
        'success',
    );

    const isArabic = false; // Would come from context in real implementation

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            status: formData.status,
            notes: formData.notes,
            studentIds: selectedStudentIds,
        });
    };

    const _handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, status: e.target.value }));
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, notes: e.target.value }));
    };

    const _handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedStudentIds(students.map((student) => student.id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const handleStudentToggle = (studentId: number) => {
        setSelectedStudentIds((prev) =>
            prev.includes(studentId)
                ? prev.filter((id) => id !== studentId)
                : [...prev, studentId],
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-semibold">
                    {isArabic ? 'تسجيل حضور جماعي' : 'Bulk Attendance'}
                </h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        {isArabic ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        isLoading={false} // Would be true during submission
                    >
                        {isArabic ? 'تسجيل الحضور' : 'Record Attendance'}
                    </Button>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormSection>
                    <FormField
                        label={isArabic ? 'الحالة' : 'Status'}
                        description={
                            isArabic
                                ? 'اختر الحالة التي تريد تطبيقها على الطلاب المختارين'
                                : 'Select the status to apply to selected students'
                        }
                    >
                        <Select
                            value={formData.status}
                            onValueChange={(value) =>
                                setFormData({ ...formData, status: value })
                            }
                            required
                        >
                            <option value="">—</option>
                            <option value="present">
                                {isArabic ? 'حاضر' : 'Present'}
                            </option>
                            <option value="absent">
                                {isArabic ? 'غائب' : 'Absent'}
                            </option>
                            <option value="late">
                                {isArabic ? 'متأخر' : 'Late'}
                            </option>
                            <option value="excused">
                                {isArabic ? 'معذور' : 'Excused'}
                            </option>
                        </Select>
                    </FormField>
                </FormSection>

                <FormSection>
                    <FormField
                        label={
                            isArabic ? 'ملاحظات (اختياري)' : 'Notes (Optional)'
                        }
                        description={
                            isArabic
                                ? 'ملاحظات إضافية لكل طالب'
                                : 'Additional notes for each student'
                        }
                    >
                        <textarea
                            value={formData.notes}
                            onChange={handleNotesChange}
                            className="mt-1 block w-full rounded-md border border-[#dbe8df] bg-white px-3 py-2 text-sm font-normal placeholder-[#6b7280] focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d] focus:ring-inset disabled:opacity-50"
                            rows={3}
                            placeholder={
                                isArabic ? 'أضف ملاحظات...' : 'Add notes...'
                            }
                        />
                    </FormField>
                </FormSection>

                {/* Student Selection */}
                <FormSection>
                    <FormField
                        label={isArabic ? 'اختيار الطلاب' : 'Student Selection'}
                        description={
                            isArabic
                                ? `تم اختيار ${selectedStudentIds.length} من ${students.length} طالب`
                                : `Selected ${selectedStudentIds.length} of ${students.length} students`
                        }
                    >
                        <div className="mt-4">
                            <div className="mb-2 flex items-center">
                                <Checkbox
                                    checked={
                                        selectedStudentIds.length ===
                                            students.length &&
                                        students.length > 0
                                    }
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedStudentIds(
                                                students.map(
                                                    (student) => student.id,
                                                ),
                                            );
                                        } else {
                                            setSelectedStudentIds([]);
                                        }
                                    }}
                                />
                                <span className="ml-2 text-sm font-medium text-[#6b7280]">
                                    {isArabic ? 'اختيار الكل' : 'Select All'}
                                </span>
                            </div>

                            <div className="max-h-60 overflow-y-auto rounded-md border border-[#dbe8df]">
                                {students.map((student) => (
                                    <div
                                        key={student.id}
                                        className={`flex items-center gap-3 border-b px-3 py-2 ${
                                            selectedStudentIds.includes(
                                                student.id,
                                            )
                                                ? 'bg-[#f0f9ff]'
                                                : ''
                                        }`}
                                    >
                                        <Checkbox
                                            checked={selectedStudentIds.includes(
                                                student.id,
                                            )}
                                            onCheckedChange={(_checked) =>
                                                handleStudentToggle(student.id)
                                            }
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-[#17342f]">
                                                {student.name}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {students.length === 0 && (
                                    <p className="py-4 text-center text-sm text-[#6b7280]">
                                        {isArabic
                                            ? 'لا توجد طلاب للعرض'
                                            : 'No students to display'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </FormField>
                </FormSection>
            </form>

            {/* Toast would be handled by parent component */}
        </div>
    );
}
