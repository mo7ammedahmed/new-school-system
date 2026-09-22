import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useT } from '@/hooks/useT';

type Props = {
    school: { id: number; name: string };
    section: {
        id: number;
        name: string;
        created_at: string;
        updated_at: string;
        student_count?: number;
        academic_class_name?: string;
        teacher_name?: string;
    };
};

const LIST_URL = (schoolId: number) => `/admin/schools/${schoolId}/sections`;
const EDIT_URL = (schoolId: number, sectionId: number) =>
    `/admin/schools/${schoolId}/sections/${sectionId}`;

export default function SectionShow({ school, section }: Props) {
    const { t, locale } = useT();
    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString(locale);

    return (
        <>
            <Head title={t('sections.show', { name: section.name })} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('sections.show', { name: section.name })}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Button asChild variant="outline">
                            <Link href={LIST_URL(school.id)}>
                                {t('common.back')}
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={EDIT_URL(school.id, section.id)}>
                                {t('actions.edit')}
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('sections.overview')}</CardTitle>
                        <CardDescription>
                            {t('sections.overviewDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title={t('sections.studentCount')}
                                value={section.student_count ?? 0}
                                trend="up"
                                description={t('sections.studentCountDescription')}
                            />
                            <StatCard
                                title={t('sections.academicClass')}
                                value={section.academic_class_name ?? 'N/A'}
                                trend="up"
                                description={t('sections.academicClassDescription')}
                            />
                            <StatCard
                                title={t('sections.homeroomTeacher')}
                                value={section.teacher_name ?? 'Unassigned'}
                                trend="up"
                                description={t('sections.homeroomTeacherDescription')}
                            />
                            <StatCard
                                title={t('sections.capacity')}
                                value={35}
                                trend="up"
                                description={t('sections.capacityDescription')}
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
                                                {t('sections.name')}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {section.name}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                {t('sections.academicClass')}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {section.academic_class_name ??
                                                    t('common.notAssigned')}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                {t('sections.homeroomTeacher')}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {section.teacher_name ??
                                                    t('common.notAssigned')}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                {t('common.createdAt')}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {formatDate(section.created_at)}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                {t('common.updatedAt')}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {formatDate(section.updated_at)}
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="details">
                                    <div className="space-y-4">
                                        <p className="text-muted-foreground">
                                            {t('sections.detailsComingSoon')}
                                        </p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="timeline">
                                    <div className="space-y-4">
                                        <p className="text-muted-foreground">
                                            {t('sections.timelineComingSoon')}
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