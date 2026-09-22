import { Chart } from 'chart.js/auto';
import { useEffect, useRef } from 'react';

type AssessmentStats = {
    total: number;
    averageScore: number;
    passRate: number;
    recentAssessments: Array<{
        id: number;
        title: string;
        date: string;
        section: string | null;
        subject: string | null;
        scoreCount: number;
    }>;
    scoreDistribution: Array<{
        range: string;
        count: number;
    }>;
};

type AssessmentStatisticsProps = {
    stats: AssessmentStats;
};

export default function AssessmentStatistics({
    stats,
}: AssessmentStatisticsProps) {
    const chartRef = useRef(null);

    useEffect(() => {
        if (chartRef.current) {
            // Create or update chart
            new Chart(chartRef.current, {
                type: 'bar',
                data: {
                    labels: stats.scoreDistribution.map((item) => item.range),
                    datasets: [
                        {
                            label: 'Number of Students',
                            data: stats.scoreDistribution.map(
                                (item) => item.count,
                            ),
                            backgroundColor: [
                                'rgba(54, 162, 235, 0.5)',
                                'rgba(255, 99, 132, 0.5)',
                                'rgba(255, 206, 86, 0.5)',
                                'rgba(75, 192, 192, 0.5)',
                                'rgba(153, 102, 255, 0.5)',
                                'rgba(255, 159, 64, 0.5)',
                            ],
                            borderColor: [
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 99, 132, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)',
                            ],
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            type: 'linear' as const,
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                            },
                        },
                    },
                },
            });
        }
    }, [stats]);

    const isArabic = false; // Would come from context in real implementation

    return (
        <div className="space-y-6">
            {/* Header */}
            <h2 className="text-xl font-semibold">
                {isArabic ? 'إحصائيات التقييم' : 'Assessment Statistics'}
            </h2>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-[#f8fafc] p-4">
                    <p className="text-sm font-medium text-[#6b7280]">
                        {isArabic ? 'عدد التقييمات' : 'Total Assessments'}
                    </p>
                    <p className="text-2xl font-bold text-[#17342f]">
                        {stats.total}
                    </p>
                </div>

                <div className="rounded-lg bg-[#f8fafc] p-4">
                    <p className="text-sm font-medium text-[#6b7280]">
                        {isArabic ? 'المتوسط' : 'Average Score'}
                    </p>
                    <p className="text-2xl font-bold text-[#17342f]">
                        {stats.averageScore.toFixed(1)}
                    </p>
                </div>

                <div className="rounded-lg bg-[#f8fafc] p-4">
                    <p className="text-sm font-medium text-[#6b7280]">
                        {isArabic ? 'نسبة النجاح' : 'Pass Rate'}
                    </p>
                    <p className="text-2xl font-bold text-[#17342f]">
                        {stats.passRate.toFixed(1)}%
                    </p>
                </div>
            </div>

            {/* Score Distribution Chart */}
            <div className="rounded-lg bg-[#f8fafc] p-6">
                <h3 className="mb-4 text-lg font-semibold text-[#17342f]">
                    {isArabic ? 'توزيع الدرجات' : 'Score Distribution'}
                </h3>
                <div className="h-64 w-full">
                    <canvas ref={chartRef} />
                </div>
            </div>

            {/* Recent Assessments */}
            <div className="rounded-lg bg-[#f8fafc] p-6">
                <h3 className="mb-4 text-lg font-semibold text-[#17342f]">
                    {isArabic ? 'التقييمات الأخيرة' : 'Recent Assessments'}
                </h3>

                {stats.recentAssessments.length > 0 ? (
                    <div className="space-y-4">
                        {stats.recentAssessments.map((assessment) => (
                            <div
                                key={assessment.id}
                                className="rounded-lg border border-[#dbe8df] p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-[#17342f]">
                                            {assessment.title}
                                        </p>
                                        <p className="text-xs text-[#6b7280]">
                                            {assessment.date} •{' '}
                                            {assessment.section} •{' '}
                                            {assessment.subject}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-[#17342f]">
                                            {assessment.scoreCount} grades
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="py-8 text-center text-sm text-[#6b7280]">
                        {isArabic
                            ? 'لا توجد تقييمات حديثة'
                            : 'No recent assessments'}
                    </p>
                )}
            </div>
        </div>
    );
}
