import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { User } from 'lucide-react';
import { useT } from '@/hooks/useT';
import { confirmDelete } from '@/lib/confirm-delete';

type Props = {
    school: { id: number; name: string };
    assignment: {
        id: number;
        teacher: {
            id: number;
            name: string;
            email: string;
        };
        section: {
            id: number;
            name: string;
            academic_class: {
                id: number;
                name: string;
            };
        };
    };
};

const LIST_URL = (schoolId: number) =>
    `/admin/schools/${schoolId}/teacher-assignments`;
const EDIT_URL = (schoolId: number, assignmentId: number) =>
    `/admin/schools/${schoolId}/teacher-assignments/${assignmentId}`;

export default function TeacherAssignmentShow({ school, assignment }: Props) {
    const { t } = useT();

    return (
        <>
            <Head
                title={t('teacherAssignments.show', {
                    name: assignment.teacher.name,
                })}
            />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('teacherAssignments.show', {
                            name: assignment.teacher.name,
                        })}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Button asChild>
                            <Link href={EDIT_URL(school.id, assignment.id)}>
                                {t('actions.edit')}
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                confirmDelete(
                                    `/admin/schools/${school.id}/teacher-assignments/${assignment.id}`,
                                    {
                                        message: t(
                                            'teacherAssignments.deleteConfirm',
                                        ),
                                    },
                                )
                            }
                        >
                            {t('actions.delete')}
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={LIST_URL(school.id)}>
                                {t('common.back')}
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('teacherAssignments.details')}</CardTitle>
                        <CardDescription>
                            {t('teacherAssignments.detailsDescription')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        {assignment.teacher.name}
                                    </h2>
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <p className="text-muted-foreground text-sm">
                                            {t('teacherAssignments.teacher')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('teacherAssignments.teacherEmail')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {assignment.teacher.email}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('teacherAssignments.section')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {assignment.section.name}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('teacherAssignments.academicClass')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {assignment.section.academic_class.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
