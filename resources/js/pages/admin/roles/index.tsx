import { Head, Link } from '@inertiajs/react';
import { Check, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useT } from '@/hooks/useT';

type RoleColumn = {
    value: string;
    users: number;
};

type MatrixRow = {
    ability: string;
    /** true/false from a real account, null when no account holds the role. */
    grants: Record<string, boolean | null>;
};

type Props = {
    school: { id: number; name: string };
    roles: RoleColumn[];
    matrix: MatrixRow[];
    /** Abilities decided per record rather than per role. */
    resourceAbilities: Record<string, string[]>;
    stats: {
        roles: number;
        provisionedUsers: number;
        privilegedAccounts: number;
        abilities: number;
    };
};

/**
 * Labels for the abilities the Gate defines today. An ability with no entry
 * here is still rendered — humanized from its name — so a newly added ability
 * shows up immediately instead of disappearing behind a missing translation.
 */
const ABILITY_LABELS: Record<string, string> = {
    'manage-organization': 'roles.abilities.manageOrganization',
    'access-school': 'roles.abilities.accessSchool',
    'manage-content': 'roles.abilities.manageContent',
    'manage-admissions': 'roles.abilities.manageAdmissions',
    'manage-enrollment': 'roles.abilities.manageEnrollment',
    'manage-users': 'roles.abilities.manageUsers',
    'manage-finance': 'roles.abilities.manageFinance',
    'record-attendance': 'roles.abilities.recordAttendance',
    'view-attendance-report': 'roles.abilities.viewAttendanceReport',
    'manage-schedule': 'roles.abilities.manageSchedule',
    'publish-schedule': 'roles.abilities.publishSchedule',
    'delete-schedule': 'roles.abilities.deleteSchedule',
    'view-section-timetable': 'roles.abilities.viewSectionTimetable',
    'view-teacher-timetable': 'roles.abilities.viewTeacherTimetable',
    'view-exam-schedule': 'roles.abilities.viewExamSchedule',
    'view-student': 'roles.abilities.viewStudent',
    'issue-report-card': 'roles.abilities.issueReportCard',
    'view-report-card-snapshot': 'roles.abilities.viewReportCardSnapshot',
    'record-section-attendance': 'roles.abilities.recordSectionAttendance',
    'record-assessment': 'roles.abilities.recordAssessment',
};

const SUBJECT_LABELS: Record<string, string> = {
    'App\\Models\\Student': 'roles.subjects.student',
    'App\\Models\\Section': 'roles.subjects.section',
    'App\\Models\\ReportCardSnapshot': 'roles.subjects.snapshot',
    'App\\Models\\Organization': 'roles.subjects.organization',
    'App\\Models\\User': 'roles.subjects.user',
    // An ability typed on the base Model is not pinned to one entity.
    'Illuminate\\Database\\Eloquent\\Model': 'roles.subjects.otherRecords',
    account: 'roles.subjects.account',
};

export default function RoleIndex({
    school,
    roles,
    matrix,
    resourceAbilities,
    stats,
}: Props) {
    const { t } = useT();
    const usersUrl = `/admin/schools/${school.id}/users`;

    const humanize = (ability: string) =>
        ability.replace(/[-_]/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

    const label = (ability: string) =>
        ABILITY_LABELS[ability]
            ? t(ABILITY_LABELS[ability])
            : humanize(ability);

    const resourceGroups = Object.entries(resourceAbilities).filter(
        ([, abilities]) => abilities.length > 0,
    );

    return (
        <>
            <Head title={t('roles.title')} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold">
                            {t('roles.title')}
                        </h1>
                        <p className="text-muted-foreground max-w-2xl text-sm">
                            {t('roles.description', { school: school.name })}
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={usersUrl}>{t('roles.manageUsers')}</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                    {[
                        {
                            key: 'roles',
                            value: stats.roles,
                            label: t('roles.kpi.roles'),
                            hint: t('roles.kpi.rolesHint'),
                        },
                        {
                            key: 'users',
                            value: stats.provisionedUsers,
                            label: t('roles.kpi.provisionedUsers'),
                            hint: t('roles.kpi.provisionedUsersHint'),
                        },
                        {
                            key: 'privileged',
                            value: stats.privilegedAccounts,
                            label: t('roles.kpi.privileged'),
                            hint: t('roles.kpi.privilegedHint'),
                        },
                        {
                            key: 'abilities',
                            value: stats.abilities,
                            label: t('roles.kpi.abilities'),
                            hint: t('roles.kpi.abilitiesHint'),
                        },
                    ].map((card) => (
                        <div
                            key={card.key}
                            className="border-border bg-card rounded-lg border p-4"
                        >
                            <p className="label-caps">{card.label}</p>
                            <p className="metric-display mt-2">
                                {card.value.toLocaleString()}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                                {card.hint}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="border-border bg-card overflow-hidden rounded-lg border">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <caption className="sr-only">
                                {t('roles.matrixCaption')}
                            </caption>{' '}
                            <thead className="bg-muted/60">
                                <tr>
                                    {/* The ability column stays visible while the role columns scroll. */}
                                    <th
                                        scope="col"
                                        className="label-caps bg-muted/60 sticky start-0 z-10 w-64 min-w-56 border-e px-3 py-3 text-start"
                                    >
                                        {t('roles.ability')}
                                    </th>
                                    {roles.map((role) => (
                                        <th
                                            key={role.value}
                                            scope="col"
                                            className="label-caps px-3 py-3 text-center whitespace-nowrap"
                                        >
                                            <span className="flex flex-col items-center gap-1">
                                                <span>
                                                    {t(`roles.${role.value}`)}
                                                </span>
                                                <Badge variant="secondary">
                                                    {t('roles.userCount', {
                                                        count: role.users,
                                                    })}
                                                </Badge>
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {matrix.map((row) => (
                                    <tr
                                        key={row.ability}
                                        className="border-border hover:bg-background border-t transition-colors"
                                    >
                                        <th
                                            scope="row"
                                            className="bg-card sticky start-0 z-10 w-64 min-w-56 border-e px-3 py-2.5 text-start font-normal"
                                        >
                                            <span className="text-muted-foreground text-label-caps block font-mono whitespace-nowrap">
                                                {row.ability}
                                            </span>
                                            <span className="text-foreground block text-sm">
                                                {label(row.ability)}
                                            </span>
                                        </th>
                                        {roles.map((role) => {
                                            const granted =
                                                row.grants[role.value];

                                            return (
                                                <td
                                                    key={role.value}
                                                    className="px-3 py-2.5 text-center"
                                                >
                                                    {granted === null ? (
                                                        <span
                                                            aria-hidden="true"
                                                            className="text-muted-foreground/50"
                                                        >
                                                            ·
                                                        </span>
                                                    ) : granted ? (
                                                        <Check
                                                            aria-hidden="true"
                                                            className="text-success-foreground dark:text-success-border mx-auto h-4 w-4"
                                                        />
                                                    ) : (
                                                        <Minus
                                                            aria-hidden="true"
                                                            className="text-muted-foreground/50 mx-auto h-4 w-4"
                                                        />
                                                    )}
                                                    <span className="sr-only">
                                                        {granted === null
                                                            ? t(
                                                                  'roles.noAccount',
                                                              )
                                                            : granted
                                                              ? t(
                                                                    'roles.granted',
                                                                )
                                                              : t(
                                                                    'roles.notGranted',
                                                                )}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="text-muted-foreground space-y-1 text-xs">
                    <p>{t('roles.observationNote')}</p>
                    <p>{t('roles.legacyNote')}</p>
                </div>

                {resourceGroups.length > 0 && (
                    <div className="rounded-lg border p-4">
                        <h2 className="text-base font-medium">
                            {t('roles.resourceScoped')}
                        </h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {t('roles.resourceScopedHint')}
                        </p>
                        <dl className="mt-4 space-y-3">
                            {resourceGroups.map(([subject, abilities]) => (
                                <div
                                    key={subject}
                                    className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-3"
                                >
                                    <dt className="text-muted-foreground min-w-40 text-xs md:text-end">
                                        {SUBJECT_LABELS[subject]
                                            ? t(SUBJECT_LABELS[subject])
                                            : (subject.split('\\').pop() ??
                                              subject)}
                                    </dt>
                                    <dd className="flex flex-wrap gap-2">
                                        {abilities.map((ability) => (
                                            <Badge
                                                key={ability}
                                                variant="outline"
                                                className="font-normal"
                                            >
                                                {label(ability)}
                                            </Badge>
                                        ))}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                )}
            </div>
        </>
    );
}
