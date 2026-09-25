import { useT } from '@/hooks/useT';
import { humanizeToken } from '@/lib/theme';

/** Group keys in `config/theme.php` paired with their translated headings. */
export function useGroupLabel() {
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
export function useFieldLabel() {
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
