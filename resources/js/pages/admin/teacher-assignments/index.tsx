import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-display/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pagination } from '@/components/ui/pagination';
import { confirmDelete } from '@/lib/confirm-delete';
import { paginated, related } from '@/lib/paginated';
import { SearchField } from '@/components/forms/search-field';
import { Select } from '@/components/ui/select';
import { useT } from '@/hooks/useT';
import { useState } from 'react';

type AssignmentData = {
    id: number;
    teacher: { id: number; name: string };
    section: {
        id: number;
        name: string;
        academic_class: { id: number; name: string };
    };
};

type Props = {
    filters: Record<string, any>;
    assignments: {
        data: AssignmentData[];
        meta: {
            total: number;
            per_page: number;
            current_page: number;
            last_page: number;
            from: number;
            to: number;
        };
        links: {
            prev: string | null;
            next: string | null;
        };
    };
    school: { id: number; name: string };
    teachers?: Array<{ id: number; name: string }>;
};

const LIST_URL = (schoolId: number) =>
    `/admin/schools/${schoolId}/teacher-assignments`;

export default function TeacherAssignmentIndex({
    filters = {},
    assignments,
    school,
    teachers = [],
}: Props) {
    const { t } = useT();
    const list = paginated<AssignmentData>(assignments);
    const [search, setSearch] = useState(filters.search ?? '');
    const [teacherId, setTeacherId] = useState(filters.teacher_id ?? '');

    const applyFilters = (next: { search?: string; teacher_id?: string }) => {
        router.get(
            LIST_URL(school.id),
            {
                search: next.search || undefined,
                teacher_id: next.teacher_id || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t('teacherAssignments.title')} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('teacherAssignments.title')}
                    </h1>
                    <Button asChild>
                        <Link href={`${LIST_URL(school.id)}/create`}>
                            {t('teacherAssignments.create')}
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <form
                        className="w-full md:max-w-sm"
                        onSubmit={(event) => {
                            event.preventDefault();
                            applyFilters({ ...filters, search });
                        }}
                    >
                        <SearchField
                            placeholder={t(
                                'teacherAssignments.searchPlaceholder',
                            )}
                            value={search}
                            onChange={setSearch}
                        />
                    </form>
                    <Select
                        value={teacherId}
                        onValueChange={(value) =>
                            applyFilters({ ...filters, teacher_id: value })
                        }
                        placeholder={t('teacherAssignments.filterByTeacher')}
                    >
                        <option value="">
                            {t('teacherAssignments.allTeachers')}
                        </option>
                        {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.name}
                            </option>
                        ))}
                    </Select>
                </div>

                <DataTable
                    columns={[
                        {
                            accessorKey: 'teacherName',
                            header: t('teacherAssignments.teacher'),
                        },
                        {
                            accessorKey: 'sectionName',
                            header: t('teacherAssignments.section'),
                        },
                        {
                            accessorKey: 'className',
                            header: t('teacherAssignments.class'),
                        },
                        {
                            accessorKey: 'actions',
                            header: t('common.actions'),
                        },
                    ]}
                    data={list.data.map((assignment) => ({
                        ...assignment,
                        teacherName:
                            related<{ name: string }>(assignment, 'teacher')
                                ?.name ?? '',
                        sectionName:
                            related<{ name: string }>(assignment, 'section')
                                ?.name ?? '',
                        className:
                            related<{
                                academic_class?: { name: string } | null;
                            }>(assignment, 'section')?.academic_class?.name ??
                            '',
                        actions: (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon">
                                        <span aria-hidden="true">⋮</span>
                                        <span className="sr-only">
                                            {t('common.actions')}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`${LIST_URL(school.id)}/${assignment.id}`}
                                        >
                                            {t('common.view')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href={`${LIST_URL(school.id)}/${assignment.id}/edit`}
                                        >
                                            {t('actions.edit')}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            confirmDelete(
                                                `${LIST_URL(school.id)}/${assignment.id}`,
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        {t('actions.delete')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ),
                    }))}
                    emptyMessage={
                        filters.search || filters.teacher_id
                            ? t('teacherAssignments.emptyFiltered')
                            : t('teacherAssignments.empty')
                    }
                />

                <Pagination
                    page={list.meta.current_page}
                    lastPage={list.meta.last_page}
                    href={(page: number) =>
                        `${LIST_URL(school.id)}?page=${page}${filters.search ? `&search=${encodeURIComponent(filters.search)}` : ''}${filters.teacher_id ? `&teacher_id=${filters.teacher_id}` : ''}`
                    }
                    labels={{
                        previous: t('common.previous'),
                        next: t('common.next'),
                        page: t('common.page'),
                        of: t('common.of'),
                    }}
                />
            </div>
        </>
    );
}
