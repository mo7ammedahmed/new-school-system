import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/forms/form-field';
import { FormSection } from '@/components/forms/form-section';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type RubricCriterion = {
    id: number;
    name: string;
    description: string;
    maxPoints: number;
};

type RubricAssessmentProps = {
    studentName: string;
    assessmentTitle: string;
    rubricCriteria: RubricCriterion[];
    onSubmit: (data: {
        criterionScores: Record<number, number>;
        overallFeedback: string;
    }) => void;
    onCancel: () => void;
};

export default function RubricAssessment({
    studentName,
    assessmentTitle,
    rubricCriteria,
    onSubmit,
    onCancel,
}: RubricAssessmentProps) {
    const [formData, setFormData] = useState({
        criterionScores: {} as Record<number, number>,
        overallFeedback: '',
    });

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    const isArabic = false; // Would come from context in real implementation

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            criterionScores: formData.criterionScores,
            overallFeedback: formData.overallFeedback,
        });
    };

    const handleCriterionScoreChange = (criterionId: number, score: number) => {
        setFormData((prev) => ({
            ...prev,
            criterionScores: {
                ...prev.criterionScores,
                [criterionId]: score,
            },
        }));
    };

    const handleOverallFeedbackChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        setFormData((prev) => ({ ...prev, overallFeedback: e.target.value }));
    };

    const calculateTotalScore = () => {
        let total = 0;
        let maxTotal = 0;

        rubricCriteria.forEach((criterion) => {
            const score = formData.criterionScores[criterion.id] || 0;
            total += score;
            maxTotal += criterion.maxPoints;
        });

        return { total, maxTotal };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-semibold">
                    {isArabic
                        ? 'تقييم حسب المعايير'
                        : 'Rubric-Based Assessment'}
                </h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        {isArabic ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        isLoading={false} // Would be true during submission
                    >
                        {isArabic ? 'تقديم التقييم' : 'Submit Assessment'}
                    </Button>
                </div>
            </div>

            {/* Student Info */}
            <div className="mb-6 rounded-lg bg-[#f8fafc] p-4">
                <p className="text-sm font-medium text-[#6b7280]">
                    {isArabic ? 'الطالب' : 'Student'}: {studentName}
                </p>
                <p className="text-sm font-medium text-[#6b7280]">
                    {isArabic ? 'التقييم' : 'Assessment'}: {assessmentTitle}
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rubric Criteria */}
                <FormSection>
                    {isArabic ? (
                        <>
                            <h3 className="text-muted-foreground text-sm font-medium">
                                المعايير
                            </h3>
                            <p className="mt-1 text-xs text-[#6b7280]">
                                قم بتقييم الطالب حسب كل معيار أدناه
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-muted-foreground text-sm font-medium">
                                Rubric Criteria
                            </h3>
                            <p className="mt-1 text-xs text-[#6b7280]">
                                Evaluate the student based on each criterion
                                below
                            </p>
                        </>
                    )}

                    <div className="mt-4 space-y-4">
                        {rubricCriteria.map((criterion) => (
                            <div
                                key={criterion.id}
                                className="rounded-lg border border-[#dbe8df] p-4"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <h4 className="font-medium text-[#17342f]">
                                        {criterion.name}
                                    </h4>
                                    <span className="text-xs font-medium text-[#6b7280]">
                                        {isArabic
                                            ? `النقاط: ${formData.criterionScores[criterion.id] ?? 0}/${criterion.maxPoints}`
                                            : `Points: ${formData.criterionScores[criterion.id] ?? 0}/${criterion.maxPoints}`}
                                    </span>
                                </div>

                                <p className="mb-2 text-sm text-[#6b7280]">
                                    {criterion.description}
                                </p>

                                <div className="grid gap-2">
                                    {[
                                        ...Array(
                                            criterion.maxPoints + 1,
                                        ).keys(),
                                    ].map((point) => (
                                        <label
                                            key={point}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors hover:bg-[#f0f9ff]"
                                        >
                                            <input
                                                type="radio"
                                                name={`criterion_${criterion.id}`}
                                                checked={
                                                    formData.criterionScores[
                                                        criterion.id
                                                    ] === point
                                                }
                                                onChange={() =>
                                                    handleCriterionScoreChange(
                                                        criterion.id,
                                                        point,
                                                    )
                                                }
                                                className="h-4 w-4 text-[#0d5c4d]"
                                            />
                                            <span className="text-sm font-medium text-[#17342f]">
                                                {point}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </FormSection>

                {/* Overall Feedback */}
                <FormSection>
                    <FormField
                        label={isArabic ? 'ملاحظات شاملة' : 'Overall Feedback'}
                        description={
                            isArabic
                                ? 'ملاحظات عامة حول أداء الطالب'
                                : 'General feedback on student performance'
                        }
                    >
                        <Textarea
                            value={formData.overallFeedback}
                            onChange={handleOverallFeedbackChange}
                            className="mt-1 block w-full rounded-md border border-[#dbe8df] bg-white px-3 py-2 text-sm font-normal placeholder-[#6b7280] focus:border-[#0d5c4d] focus:ring-2 focus:ring-[#0d5c4d] focus:ring-inset disabled:opacity-50"
                            rows={4}
                            placeholder={
                                isArabic
                                    ? 'أضف ملاحظات شاملة...'
                                    : 'Add overall feedback...'
                            }
                        />
                    </FormField>
                </FormSection>

                {/* Summary */}
                <div className="mt-4 border-t border-[#dbe8df] pt-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[#6b7280]">
                                {isArabic ? 'المجموع' : 'Total Score'}
                            </span>
                            <span className="text-sm font-medium text-[#17342f]">
                                {calculateTotalScore().total}/
                                {calculateTotalScore().maxTotal}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[#6b7280]">
                                {isArabic ? 'النسبة المئوية' : 'Percentage'}
                            </span>
                            <span className="text-sm font-medium text-[#17342f]">
                                {calculateTotalScore().maxTotal > 0
                                    ? (
                                          (calculateTotalScore().total /
                                              calculateTotalScore().maxTotal) *
                                          100
                                      ).toFixed(1) + '%'
                                    : '0%'}
                            </span>
                        </div>
                    </div>
                </div>
            </form>

            {/* Toast would be handled by parent component */}
        </div>
    );
}
