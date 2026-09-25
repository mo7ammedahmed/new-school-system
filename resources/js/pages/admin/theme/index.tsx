import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Check,
    ChevronDown,
    RotateCcw,
    Save,
    Search,
    Sparkles,
    Undo2,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { PageHero } from '@/components/page-hero';
import { useT } from '@/hooks/useT';
import { confirmDelete } from '@/lib/confirm-delete';
import {
    applyThemeCss,
    contrastRatio,
    diffFromBaseline,
    emptyOverrides,
    hasAnyOverride,
    humanizeToken,
    mergeOverrides,
    readThemeVars,
    readableOn,
    sameOverrides,
} from '@/lib/theme';
import type { ThemeMode, ThemeOverrides } from '@/lib/theme';
import type { SharedPageProps } from '@/types/shared';

type Field = { var: string; contrast?: string };
type ContrastPair = { text: string; on: string; min: number };

type Props = {
    /** Which palette this screen edits: a school's own, or the platform-wide one. */
    scope: 'school' | 'platform';
    /** Endpoint the form writes to, so one screen can serve both scopes. */
    action: string;
    school: { id: number; name: string } | null;
    theme: ThemeOverrides;
    groups: Record<string, Field[]>;
    contrastPairs: ContrastPair[];
    hasOverride: boolean;
};

/** Group keys in `config/theme.php` paired with their translated headings. */
function useGroupLabel() {
    const { t } = useT();

    return (group: string): string => {
        switch (group) {
            case 'brand':
                return t('theme.group.brand');
            case 'secondary':
                return t('theme.group.secondary');
            case 'tertiary':
                return t('theme.group.tertiary');
            case 'surfaces':
                return t('theme.group.surfaces');
            case 'components':
                return t('theme.group.components');
            case 'sidebar':
                return t('theme.group.sidebar');
            case 'text':
                return t('theme.group.text');
            case 'states':
                return t('theme.group.states');
            case 'hero':
                return t('theme.group.hero');
            case 'ramp':
                return t('theme.group.ramp');
            case 'charts':
                return t('theme.group.charts');
            default:
                return group;
        }
    };
}

/**
 * A translated name for the seats that carry meaning to a school, and a
 * readable name derived from the token for the rest — the palette has far more
 * seats than it has sentences, and every seat still shows its own variable.
 */
function useFieldLabel() {
    const { t } = useT();

    return (variable: string): string => {
        switch (variable) {
            case '--primary':
                return t('theme.fields.primary');
            case '--on-primary':
                return t('theme.fields.onPrimary');
            case '--primary-container':
                return t('theme.fields.primaryContainer');
            case '--secondary':
                return t('theme.fields.secondary');
            case '--on-secondary':
                return t('theme.fields.onSecondary');
            case '--tertiary':
                return t('theme.fields.tertiary');
            case '--surface':
                return t('theme.fields.surface');
            case '--surface-container-lowest':
                return t('theme.fields.card');
            case '--surface-container-low':
                return t('theme.fields.mutedSurface');
            case '--surface-container-high':
                return t('theme.fields.raisedSurface');
            case '--sidebar':
                return t('theme.fields.sidebar');
            case '--hero-bg':
                return t('theme.fields.hero');
            case '--on-surface':
                return t('theme.fields.onSurface');
            case '--on-surface-variant':
                return t('theme.fields.onSurfaceVariant');
            case '--outline-variant':
                return t('theme.fields.border');
            case '--outline':
                return t('theme.fields.outline');
            case '--ring':
                return t('theme.fields.ring');
            case '--success':
                return t('theme.fields.success');
            case '--success-container':
                return t('theme.fields.successContainer');
            case '--warning':
                return t('theme.fields.warning');
            case '--warning-container':
                return t('theme.fields.warningContainer');
            case '--danger':
                return t('theme.fields.danger');
            case '--danger-container':
                return t('theme.fields.dangerContainer');
            case '--brand-600':
                return t('theme.fields.brand');
            default:
                return humanizeToken(variable);
        }
    };
}

export default function ThemeEditor({
    scope,
    action,
    school,
    theme,
    groups,
    contrastPairs,
    hasOverride,
}: Props) {
    const { t } = useT();
    const { flash } = usePage<SharedPageProps>().props;
    const groupLabel = useGroupLabel();
    const fieldLabel = useFieldLabel();

    const variables = useMemo(
        () =>
            Object.values(groups)
                .flat()
                .map((field) => field.var),
        [groups],
    );
    const pairsByText = useMemo(
        () =>
            Object.fromEntries(
                contrastPairs.map((pair) => [pair.text, pair]),
            ) as Record<string, ContrastPair>,
        [contrastPairs],
    );

    const [baseline, setBaseline] = useState<ThemeOverrides | null>(null);
    const [values, setValues] = useState<ThemeOverrides>(emptyOverrides);
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [mode, setMode] = useState<ThemeMode>('light');
    const [query, setQuery] = useState('');
    const [onlyChanged, setOnlyChanged] = useState(false);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

    const form = useForm<{ theme: ThemeOverrides }>({
        theme: emptyOverrides(),
    });

    // The bundle palette is read from the live stylesheet with the stored
    // override lifted out, so the editor can tell "changed" from "inherited"
    // without a second copy of the palette living in JavaScript.
    useEffect(() => {
        const injected = document.getElementById('theme-tokens');
        injected?.remove();

        const bundle = readThemeVars(variables);

        if (injected) {
            document.head.appendChild(injected);
        }

        setBaseline(bundle);
        setValues(mergeOverrides(bundle, theme));
    }, [variables, theme]);

    // Preview the palette being edited, then hand the shell back exactly as it
    // was: choosing dark colours must not change the administrator's own theme.
    useEffect(() => {
        const html = document.documentElement;
        const originallyDark = html.classList.contains('dark');

        return () => {
            html.classList.toggle('dark', originallyDark);
        };
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle('dark', mode === 'dark');
    }, [mode]);

    const overrides = useMemo(
        () =>
            baseline ? diffFromBaseline(values, baseline) : emptyOverrides(),
        [values, baseline],
    );

    // Live preview: the whole shell re-skins on every pick, before saving.
    useEffect(() => {
        if (baseline) {
            applyThemeCss(overrides);
        }
    }, [overrides, baseline]);

    const dirty = !sameOverrides(overrides, theme);

    /** Changed in either mode, so the list does not jump when the mode flips. */
    const isOverridden = (variable: string): boolean =>
        overrides.light[variable] !== undefined ||
        overrides.dark[variable] !== undefined;

    const changedCount = variables.filter(isOverridden).length;
    const searching = query.trim() !== '';
    const filtersActive = searching || onlyChanged;

    const sections = Object.entries(groups)
        .map(([key, fields]) => {
            const needle = query.trim().toLowerCase();

            return {
                key,
                fields: fields.filter(
                    (field) =>
                        (!searching ||
                            field.var.toLowerCase().includes(needle) ||
                            fieldLabel(field.var)
                                .toLowerCase()
                                .includes(needle)) &&
                        (!onlyChanged || isOverridden(field.var)),
                ),
                changed: fields.filter((field) => isOverridden(field.var))
                    .length,
            };
        })
        .filter((section) => section.fields.length > 0 || !filtersActive);

    /**
     * Writes a seat's value and drops any half-typed text for it, so the hex
     * box can never keep showing a colour the shell is not using.
     */
    function commit(variable: string, value: string): void {
        setValues((current) => ({
            ...current,
            [mode]: { ...current[mode], [variable]: value },
        }));

        setDrafts((current) => {
            const key = `${mode}:${variable}`;

            if (!(key in current)) {
                return current;
            }

            const next = { ...current };
            delete next[key];

            return next;
        });
    }

    function draft(key: string, variable: string, value: string): void {
        setDrafts((current) => ({ ...current, [key]: value }));

        // Half-typed hex stays in the box; a complete one previews immediately.
        if (/^#[0-9a-f]{6}$/i.test(value.trim())) {
            commit(variable, value.trim().toLowerCase());
        }
    }

    /**
     * Restores the bundle colour by writing the baseline value back: an
     * override is only stored when it differs from the bundle, so writing the
     * baseline value is what removes it.
     */
    function resetSeat(variable: string): void {
        commit(variable, baseline?.[mode][variable] ?? '');
    }

    function setAllGroups(open: boolean): void {
        setOpenGroups(
            Object.fromEntries(Object.keys(groups).map((key) => [key, open])),
        );
    }

    function save(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        form.transform(() => ({ theme: overrides }));
        form.put(action, { preserveScroll: true });
    }

    function reset(): void {
        confirmDelete(action, {
            message:
                scope === 'platform'
                    ? t('theme.platform.resetConfirm')
                    : t('theme.resetConfirm'),
        });
    }

    const notice =
        flash?.success === 'theme.saved'
            ? t('theme.notice.saved')
            : flash?.success === 'theme.reset'
              ? t('theme.notice.reset')
              : flash?.success === 'theme.platform.saved'
                ? t('theme.platform.notice.saved')
                : flash?.success === 'theme.platform.reset'
                  ? t('theme.platform.notice.reset')
                  : null;

    const hint = dirty
        ? t('theme.unsaved')
        : hasAnyOverride(overrides) || hasOverride
          ? scope === 'platform'
              ? t('theme.platform.savedHint')
              : t('theme.savedHint')
          : scope === 'platform'
            ? t('theme.platform.bundleHint')
            : t('theme.bundleHint');

    return (
        <>
            <Head
                title={
                    scope === 'platform'
                        ? t('theme.platform.title')
                        : t('theme.title')
                }
            />

            <div className="space-y-6 p-4 md:p-8">
                <PageHero
                    eyebrow={school?.name ?? t('theme.scope.platform')}
                    title={
                        scope === 'platform'
                            ? t('theme.platform.title')
                            : t('theme.title')
                    }
                    subtitle={
                        scope === 'platform'
                            ? t('theme.platform.subtitle')
                            : t('theme.subtitle')
                    }
                />

                {notice ? (
                    <p
                        role="status"
                        className="border-success-border bg-success-container text-success-foreground rounded-lg border px-4 py-3 text-sm font-semibold"
                    >
                        {notice}
                    </p>
                ) : null}

                {form.errors.theme ? (
                    <p
                        role="alert"
                        className="border-danger-border bg-danger-container text-danger-foreground rounded-lg border px-4 py-3 text-sm font-semibold"
                    >
                        {form.errors.theme}
                    </p>
                ) : null}

                <form onSubmit={save} className="space-y-4">
                    {/* The palette is far larger than one screen, so the tools
                        that make it navigable stay in reach while scrolling. */}
                    <div className="border-outline-variant bg-surface/90 sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 backdrop-blur">
                        <div
                            role="group"
                            aria-label={t('theme.modeLabel')}
                            className="border-outline-variant flex shrink-0 rounded-full border p-0.5"
                        >
                            {(['light', 'dark'] as const).map((candidate) => (
                                <button
                                    key={candidate}
                                    type="button"
                                    onClick={() => setMode(candidate)}
                                    aria-pressed={mode === candidate}
                                    className={`text-body-sm rounded-full px-3 py-1.5 font-semibold transition ${
                                        mode === candidate
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-on-surface-variant hover:text-on-surface'
                                    }`}
                                >
                                    {candidate === 'light'
                                        ? t('theme.mode.light')
                                        : t('theme.mode.dark')}
                                </button>
                            ))}
                        </div>

                        <label className="relative min-w-40 flex-1">
                            <span className="sr-only">{t('theme.search')}</span>
                            <Search
                                size={14}
                                aria-hidden="true"
                                className="text-on-surface-variant pointer-events-none absolute inset-y-0 start-3 my-auto"
                            />
                            <input
                                type="search"
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                placeholder={t('theme.search')}
                                className="field ps-8"
                            />
                        </label>

                        <button
                            type="button"
                            aria-pressed={onlyChanged}
                            onClick={() =>
                                setOnlyChanged((current) => !current)
                            }
                            className={`text-body-sm shrink-0 rounded-full border px-3 py-1.5 font-semibold transition ${
                                onlyChanged
                                    ? 'border-secondary text-secondary bg-secondary/10'
                                    : 'border-outline-variant text-on-surface-variant hover:text-on-surface'
                            }`}
                        >
                            {t('theme.onlyChanged')}
                        </button>

                        <span className="text-on-surface-variant text-body-sm shrink-0">
                            {t('theme.changed', { count: changedCount })}
                        </span>

                        <span className="flex shrink-0 gap-1">
                            <button
                                type="button"
                                onClick={() => setAllGroups(true)}
                                className="text-on-surface-variant hover:text-on-surface text-body-sm rounded-md px-2 py-1"
                            >
                                {t('theme.expandAll')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setAllGroups(false)}
                                className="text-on-surface-variant hover:text-on-surface text-body-sm rounded-md px-2 py-1"
                            >
                                {t('theme.collapseAll')}
                            </button>
                        </span>
                    </div>

                    {sections.length === 0 ? (
                        <p className="border-outline-variant bg-card text-on-surface-variant rounded-lg border px-4 py-6 text-center text-sm">
                            {t('theme.noMatches')}
                        </p>
                    ) : null}

                    {sections.map(({ key, fields, changed }) => {
                        // Filtering opens what it found; otherwise only the
                        // groups carrying an override start open.
                        const open =
                            filtersActive || (openGroups[key] ?? changed > 0);

                        return (
                            <section
                                key={key}
                                className="border-outline-variant bg-card rounded-lg border"
                            >
                                <button
                                    type="button"
                                    aria-expanded={open}
                                    onClick={() =>
                                        setOpenGroups((current) => ({
                                            ...current,
                                            [key]: !open,
                                        }))
                                    }
                                    className="flex w-full items-center gap-3 px-4 py-3 text-start md:px-6 md:py-4"
                                >
                                    <ChevronDown
                                        size={16}
                                        aria-hidden="true"
                                        className={`text-on-surface-variant shrink-0 transition-transform ${
                                            open ? '' : '-rotate-90'
                                        }`}
                                    />
                                    <span className="text-on-surface min-w-0 flex-1 truncate text-lg font-semibold">
                                        {groupLabel(key)}
                                    </span>
                                    {changed > 0 ? (
                                        <span className="border-secondary text-secondary shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold">
                                            {changed}
                                        </span>
                                    ) : null}
                                </button>

                                {open ? (
                                    <div className="grid gap-4 px-4 pb-4 sm:grid-cols-2 md:px-6 md:pb-6 xl:grid-cols-3">
                                        {fields.map((field) => {
                                            const value =
                                                values[mode][field.var] ?? '';
                                            const background = field.contrast
                                                ? (values[mode][
                                                      field.contrast
                                                  ] ?? '')
                                                : '';
                                            const pair = field.contrast
                                                ? pairsByText[field.var]
                                                : undefined;
                                            const ratio =
                                                value && background
                                                    ? contrastRatio(
                                                          value,
                                                          background,
                                                      )
                                                    : 0;
                                            const min = pair?.min ?? 4.5;
                                            const draftKey = `${mode}:${field.var}`;
                                            const edited =
                                                value !==
                                                baseline?.[mode][field.var];

                                            return (
                                                <div
                                                    key={field.var}
                                                    className="space-y-2"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <span className="min-w-0">
                                                            <span className="flex items-center gap-2">
                                                                <span className="text-on-surface text-body-sm truncate font-semibold">
                                                                    {fieldLabel(
                                                                        field.var,
                                                                    )}
                                                                </span>
                                                                {edited ? (
                                                                    <span
                                                                        aria-hidden="true"
                                                                        className="bg-secondary size-1.5 shrink-0 rounded-full"
                                                                    />
                                                                ) : null}
                                                            </span>
                                                            <span className="text-on-surface-variant/80 block truncate font-mono text-[10px]">
                                                                {field.var}
                                                            </span>
                                                        </span>

                                                        <span className="flex shrink-0 items-center gap-1">
                                                            {field.contrast ? (
                                                                <>
                                                                    <span
                                                                        title={`${fieldLabel(field.var)} / ${fieldLabel(field.contrast)}: ${ratio}`}
                                                                        className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
                                                                            ratio >=
                                                                            min
                                                                                ? 'border-success-border bg-success-container text-success-foreground'
                                                                                : 'border-danger-border bg-danger-container text-danger-foreground'
                                                                        }`}
                                                                    >
                                                                        {ratio}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        title={t(
                                                                            'theme.auto',
                                                                        )}
                                                                        aria-label={`${t('theme.auto')}: ${fieldLabel(field.var)}`}
                                                                        onClick={() =>
                                                                            commit(
                                                                                field.var,
                                                                                readableOn(
                                                                                    background ||
                                                                                        value ||
                                                                                        '#000000',
                                                                                ),
                                                                            )
                                                                        }
                                                                        className="text-on-surface-variant hover:text-on-surface rounded-md p-1"
                                                                    >
                                                                        <Sparkles
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                    </button>
                                                                </>
                                                            ) : null}

                                                            <button
                                                                type="button"
                                                                title={t(
                                                                    'theme.resetToken',
                                                                )}
                                                                aria-label={`${t('theme.resetToken')}: ${fieldLabel(field.var)}`}
                                                                disabled={
                                                                    !edited
                                                                }
                                                                onClick={() =>
                                                                    resetSeat(
                                                                        field.var,
                                                                    )
                                                                }
                                                                className="text-on-surface-variant hover:text-on-surface rounded-md p-1 disabled:opacity-30"
                                                            >
                                                                <Undo2
                                                                    size={14}
                                                                />
                                                            </button>
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            aria-label={fieldLabel(
                                                                field.var,
                                                            )}
                                                            value={value}
                                                            onChange={(event) =>
                                                                commit(
                                                                    field.var,
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="border-outline-variant h-10 w-14 shrink-0 cursor-pointer rounded-md border bg-transparent"
                                                        />
                                                        <input
                                                            dir="ltr"
                                                            aria-label={fieldLabel(
                                                                field.var,
                                                            )}
                                                            value={
                                                                drafts[
                                                                    draftKey
                                                                ] ?? value
                                                            }
                                                            onChange={(event) =>
                                                                draft(
                                                                    draftKey,
                                                                    field.var,
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            onBlur={() =>
                                                                draft(
                                                                    draftKey,
                                                                    field.var,
                                                                    value,
                                                                )
                                                            }
                                                            className="field font-mono text-xs"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : null}
                            </section>
                        );
                    })}

                    <section className="border-outline-variant bg-card rounded-lg border p-4 md:p-6">
                        <h2 className="text-on-surface text-lg font-semibold">
                            {t('theme.contrast.title')}
                        </h2>
                        <p className="text-on-surface-variant mt-1 text-sm">
                            {t('theme.contrast.hint')}
                        </p>

                        <ul className="mt-4 space-y-2">
                            {contrastPairs.map((pair) => {
                                const ratio = contrastRatio(
                                    values[mode][pair.text] ?? '',
                                    values[mode][pair.on] ?? '',
                                );
                                const passes = ratio >= pair.min;

                                return (
                                    <li
                                        key={`${pair.text}-${pair.on}`}
                                        className="border-outline-variant flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
                                    >
                                        <span className="text-on-surface min-w-0 truncate">
                                            {fieldLabel(pair.text)}{' '}
                                            <span className="text-on-surface-variant">
                                                {t('theme.contrast.on')}{' '}
                                                {fieldLabel(pair.on)}
                                            </span>
                                        </span>
                                        <span
                                            className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${
                                                passes
                                                    ? 'border-success-border bg-success-container text-success-foreground'
                                                    : 'border-danger-border bg-danger-container text-danger-foreground'
                                            }`}
                                        >
                                            {passes ? (
                                                <Check size={12} />
                                            ) : (
                                                <X size={12} />
                                            )}
                                            {`${ratio} / ${pair.min}`}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    <div className="border-outline-variant bg-card sticky bottom-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                        <p className="text-on-surface-variant text-sm">
                            {hint}
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                disabled={!hasOverride && !dirty}
                                onClick={reset}
                                className="border-outline-variant text-on-surface inline-flex items-center gap-2 rounded-full border px-5 py-3 font-semibold disabled:opacity-40"
                            >
                                <RotateCcw size={16} />
                                {t('theme.reset')}
                            </button>
                            <button
                                type="submit"
                                disabled={!dirty || form.processing}
                                className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold disabled:opacity-40"
                            >
                                <Save size={16} />
                                {t('theme.save')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}
