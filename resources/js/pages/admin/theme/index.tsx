import { Head, usePage } from '@inertiajs/react';
import { useMemo } from 'react';
import { PageHero } from '@/components/page-hero';
import { useT } from '@/hooks/useT';
import type { SharedPageProps } from '@/types/shared';
import { useGroupLabel, useFieldLabel } from '@/components/admin/theme/labels';
import { useThemeForm } from '@/components/admin/theme/useThemeForm';
import { ThemeToolbar } from '@/components/admin/theme/theme-toolbar';
import { ThemeGroupSection } from '@/components/admin/theme/theme-group-section';
import { ThemeContrastPanel } from '@/components/admin/theme/theme-contrast-panel';
import { ThemeActions } from '@/components/admin/theme/theme-actions';
import type {
    ContrastPair,
    ThemeEditorProps,
} from '@/components/admin/theme/types';

export default function ThemeEditor({
    scope,
    action,
    school,
    theme,
    groups,
    contrastPairs,
    hasOverride,
}: ThemeEditorProps) {
    const { t } = useT();
    const { flash } = usePage<SharedPageProps>().props;
    const groupLabel = useGroupLabel();
    const fieldLabel = useFieldLabel();

    const {
        form,
        mode,
        setMode,
        query,
        setQuery,
        onlyChanged,
        setOnlyChanged,
        values,
        drafts,
        baseline,
        dirty,
        changedCount,
        filtersActive,
        sections,
        openGroups,
        notice,
        hint,
        commit,
        draft,
        resetSeat,
        setAllGroups,
        toggleGroup,
        save,
        reset,
    } = useThemeForm({
        scope,
        action,
        theme,
        groups,
        hasOverride,
        flash: flash?.success,
    });

    const pairsByText = useMemo(
        () =>
            Object.fromEntries(
                contrastPairs.map((pair) => [pair.text, pair]),
            ) as Record<string, ContrastPair>,
        [contrastPairs],
    );

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
                    <ThemeToolbar
                        mode={mode}
                        onModeChange={setMode}
                        query={query}
                        onQueryChange={setQuery}
                        onlyChanged={onlyChanged}
                        onOnlyChangedChange={setOnlyChanged}
                        changedCount={changedCount}
                        onExpandAll={() => setAllGroups(true)}
                        onCollapseAll={() => setAllGroups(false)}
                        t={t}
                    />

                    {sections.length === 0 ? (
                        <p className="border-outline-variant bg-card text-on-surface-variant rounded-lg border px-4 py-6 text-center text-sm">
                            {t('theme.noMatches')}
                        </p>
                    ) : null}

                    {sections.map((section) => {
                        // Filtering opens what it found; otherwise only the
                        // groups carrying an override start open.
                        const open =
                            filtersActive ||
                            (openGroups[section.key] ?? section.changed > 0);

                        return (
                            <ThemeGroupSection
                                key={section.key}
                                section={section}
                                open={open}
                                onToggle={toggleGroup}
                                title={groupLabel(section.key)}
                                mode={mode}
                                values={values}
                                drafts={drafts}
                                baseline={baseline}
                                pairsByText={pairsByText}
                                fieldLabel={fieldLabel}
                                onCommit={commit}
                                onDraft={draft}
                                onReset={resetSeat}
                                t={t}
                            />
                        );
                    })}

                    <ThemeContrastPanel
                        contrastPairs={contrastPairs}
                        mode={mode}
                        values={values}
                        fieldLabel={fieldLabel}
                        t={t}
                    />

                    <ThemeActions
                        hint={hint}
                        canReset={hasOverride || dirty}
                        canSave={dirty}
                        processing={form.processing}
                        onReset={reset}
                        t={t}
                    />
                </form>
            </div>
        </>
    );
}
