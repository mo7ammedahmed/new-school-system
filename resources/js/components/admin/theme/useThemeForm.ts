import { useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useT } from '@/hooks/useT';
import { confirmDelete } from '@/lib/confirm-delete';
import {
    applyThemeCss,
    diffFromBaseline,
    emptyOverrides,
    hasAnyOverride,
    mergeOverrides,
    readThemeVars,
    sameOverrides,
} from '@/lib/theme';
import type { ThemeMode, ThemeOverrides } from '@/lib/theme';
import type { ThemeEditorProps, ThemeSection } from './types';
import { useFieldLabel } from './labels';

type UseThemeFormArgs = Pick<
    ThemeEditorProps,
    'scope' | 'action' | 'theme' | 'groups' | 'hasOverride'
> & {
    /** Raw `flash.success` value, used to pick the right translated notice. */
    flash?: string | null;
};

export function useThemeForm({
    scope,
    action,
    theme,
    groups,
    hasOverride,
    flash = null,
}: UseThemeFormArgs) {
    const { t } = useT();
    const fieldLabel = useFieldLabel();

    const variables = useMemo(
        () =>
            Object.values(groups)
                .flat()
                .map((field) => field.var),
        [groups],
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

    const sections: ThemeSection[] = Object.entries(groups)
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

    function toggleGroup(key: string, open: boolean): void {
        setOpenGroups((current) => ({ ...current, [key]: open }));
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
        flash === 'theme.saved'
            ? t('theme.notice.saved')
            : flash === 'theme.reset'
              ? t('theme.notice.reset')
              : flash === 'theme.platform.saved'
                ? t('theme.platform.notice.saved')
                : flash === 'theme.platform.reset'
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

    return {
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
        overrides,
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
    };
}
