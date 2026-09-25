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
    academicClass: {
        id: number;
        name: string;
        created_at: string;
        updated_at: string;
        section_count?: number;
        student_count?: number;
        teacher_count?: number;
    };
};

const LIST_URL = (schoolId: number) =>
    `/admin/schools/${schoolId}/academic-classes`;
const EDIT_URL = (schoolId: number, classId: number) =>
    `/admin/schools/${schoolId}/academic-classes/${classId}`;

export default function AcademicClassShow({ school, academicClass }: Props) {
    const { t, locale } = useT();
    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString(locale);

    const avgSectionSize =
        academicClass.section_count && academicClass.section_count > 0
            ? Math.round(
                  (academicClass.student_count ?? 0) /
                      academicClass.section_count,
              )
            : 0;

    return (
        <>
            <Head
                title={t('academicClasses.show', { name: academicClass.name })}
            />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('academicClasses.show', {
                            name: academicClass.name,
                        })}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Button asChild variant="outline">
                            <Link href={LIST_URL(school.id)}>
                                {t('common.back')}
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={EDIT_URL(school.id, academicClass.id)}>
                                {t('actions.edit')}
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('academicClasses.overview')}</CardTitle>
                        <CardDescription>
                            {t('academicClasses.overviewDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title={t('academicClasses.studentCount')}
                                value={academicClass.student_count ?? 0}
                                trend="up"
                                description={t(
                                    'academicClasses.studentCountDescription',
                                )}
                            />
                            <StatCard
                                title={t('academicClasses.sectionCount')}
                                value={academicClass.section_count ?? 0}
                                trend="up"
                                description={t(
                                    'academicClasses.sectionCountDescription',
                                )}
                            />
                            <StatCard
                                title={t('academicClasses.teacherCount')}
                                value={academicClass.teacher_count ?? 0}
                                trend="up"
                                description={t(
                                    'academicClasses.teacherCountDescription',
                                )}
                            />
                            <StatCard
                                title={t('academicClasses.avgSectionSize')}
                                value={avgSectionSize}
                                trend="up"
                                description={t(
                                    'academicClasses.avgSectionSizeDescription',
                                )}
                            />
                        </div>

                        <div className="space-y-4">
                            <Tabs defaultValue="info">
                                <TabsList className="grid w-[200px] grid-cols-1">
                                    <TabsTrigger value="info">
                                        {t('common.information')}
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="info">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                {t('academicClasses.name')}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {academicClass.name}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                {t('common.createdAt')}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {formatDate(
                                                    academicClass.created_at,
                                                )}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-medium">
                                                {t('common.updatedAt')}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {formatDate(
                                                    academicClass.updated_at,
                                                )}
                                            </p>
                                        </div>
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
