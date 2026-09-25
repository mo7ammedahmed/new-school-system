import type { ThemeOverrides } from '@/lib/theme';

export type Field = { var: string; contrast?: string };

export type ContrastPair = { text: string; on: string; min: number };

export type ThemeScope = 'school' | 'platform';

export type ThemeEditorProps = {
    /** Which palette this screen edits: a school's own, or the platform-wide one. */
    scope: ThemeScope;
    /** Endpoint the form writes to, so one screen can serve both scopes. */
    action: string;
    school: { id: number; name: string } | null;
    theme: ThemeOverrides;
    groups: Record<string, Field[]>;
    contrastPairs: ContrastPair[];
    hasOverride: boolean;
};

export type ThemeSection = {
    key: string;
    fields: Field[];
    changed: number;
};
