import { useState } from 'react';
import { Button } from '@/components/ui/button';

type Student = {
    id: number;
    name: string;
};

type QuickAttendanceButtonsProps = {
    students: Student[];
    onAttendanceChange: (studentId: number, status: string) => void;
};

export default function QuickAttendanceButtons({
    students,
    onAttendanceChange,
}: QuickAttendanceButtonsProps) {
    const isArabic = false; // Would come from context in real implementation

    const handleQuickStatus = (status: string) => {
        students.forEach((student) => {
            onAttendanceChange(student.id, status);
        });
    };

    return (
        <div className="mt-4 flex flex-wrap gap-2">
            <Button
                onClick={() => handleQuickStatus('present')}
                variant="default"
                className="bg-[#16a34a] text-white hover:bg-[#15803d]"
            >
                {isArabic ? 'كل-present' : 'All Present'}
            </Button>
            <Button
                onClick={() => handleQuickStatus('absent')}
                variant="default"
                className="hover:bg:#b91c1c bg-[#dc2626] text-white"
            >
                {isArabic ? 'كل-غائب' : 'All Absent'}
            </Button>
            <Button
                onClick={() => handleQuickStatus('late')}
                variant="default"
                className="hover:bg:#b45309 bg-[#d97706] text-white"
            >
                {isArabic ? 'كل-متأخر' : 'All Late'}
            </Button>
        </div>
    );
}
