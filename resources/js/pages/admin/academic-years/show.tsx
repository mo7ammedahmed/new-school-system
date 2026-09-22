import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DateCell } from '@/components/data-display/date-cell';
import { StatCard } from '@/components/dashboard/stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useT } from '@/hooks/useT';

type Props = {
    school: { id: number; name: string };
    academicYear: {
        id: number;
        name: string;
        starts_on: string;
        ends_on: string;
        is_current: boolean;
        created_at: string;
        updated_at: string;
        student_count?: number;
        class_count?: number;
        section_count?: number;
        enrollment_count?: number;
    };
};

const LIST_URL = (schoolId: number) => `/admin/schools/${schoolId}/academic-years`;
const EDIT_URL = (schoolId: number, yearId: number) =>
    `/admin/schools/${schoolId}/academic-years/${yearId}`;

export default function AcademicYearShow({ school, academicYear }: Props) {
    const { t, locale } = useT();
    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString(locale);

    const durationYears = Math.max(
        0,
        new Date(academicYear.ends_on).getFullYear() -
            new Date(academicYear.starts_on).getFullYear(),
    );

    return (
        <>
            <Head title={t('academicYears.show', { name: academicYear.name })} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('academicYears.show', { name: academicYear.name })}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Button asChild variant="outline">
                            <Link href={LIST_URL(school.id)}>
                                {t('common.back')}
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={EDIT_URL(school.id, academicYear.id)}>
                                {t('actions.edit')}
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('academicYears.overview')}</CardTitle>
                        <CardDescription>
                            {t('academicYears.overviewDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title={t('academicYears.studentCount')}
                                value={academicYear.student_count ?? 0}
                                trend="up"
                                description={t('academicYears.studentCountDescription')}
                            />
                            <StatCard
                                title={t('academicYears.classCount')}
                                value={academicYear.class_count ?? 0}
                                trend="up"
                                description={t('academicYears.classCountDescription')}
                            />
                            <StatCard
                                title={t('academicYears.sectionCount')}
                                value={academicYear.section_count ?? 0}
                                trend="up"
                                description={t('academicYears.sectionCountDescription')}
                            />
                            <StatCard
                                title={t('academicYears.enrollmentCount')}
                                value={academicYear.enrollment_count ?? 0}
                                trend="up"
                                description={t('academicYears.enrollmentCountDescription')}
                            />
                        </div>

                        <div className="space-y-4">
                            <Tabs defaultValue="info">
                                <TabsList className="grid w-[200px] grid-cols-1">
                                    <TabsTrigger value="info">
                                        {t('common.information')}
                                    </TabsTrigger>
                                    <TabsTrigger value="details">
                                        {t('common.details')}
                                    </TabsTrigger>
                                    <TabsTrigger value="timeline">
                                        {t('common.timeline')}
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="info">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                {t('academicYears.name')}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {academicYear.name}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                {t('academicYears.status')}
                                            </p>
                                            <Badge
                                                variant={
                                                    academicYear.is_current
                                                        ? 'success'
                                                        : 'secondary'
                                                }
                                            >
                                                {academicYear.is_current
                                                    ? t('academicYears.status.current')
                                                    : t('academicYears.status.inactive')}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                {t('academicYears.startsOn')}
                                            </p>
                                            <DateCell value={academicYear.starts_on} />
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                {t('academicYears.endsOn')}
                                            </p>
                                            <DateCell value={academicYear.ends_on} />
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                {t('academicYears.duration')}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {t('academicYears.durationValue', { years: durationYears })}
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="details">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                {t('common.createdAt')}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {formatDate(academicYear.created_at)}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                {t('common.updatedAt')}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {formatDate(academicYear.updated_at)}
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="timeline">
                                    <div className="space-y-4">
                                        <p className="text-muted-foreground">
                                            {t('academicYears.timelineComingSoon')}
                                        </p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}