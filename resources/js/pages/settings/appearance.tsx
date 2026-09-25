import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { useT } from '@/hooks/useT';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    const { t } = useT();

    return (
        <>
            <Head title={t('settings.appearance')} />

            <h1 className="sr-only">{t('settings.appearance')}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('settings.appearance')}
                    description={t('settings.appearanceDescription')}
                />
                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'settings.appearance',
            href: editAppearance(),
        },
    ],
};
