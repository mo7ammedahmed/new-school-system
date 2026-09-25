import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useT } from '@/hooks/useT';
import { confirmDelete } from '@/lib/confirm-delete';

type Props = {
    school: { id: number; name: string };
    feeStructure: {
        id: number;
        name: string;
        description: string | null;
        amount_minor: number;
        currency: string;
        frequency: string;
        is_active: boolean;
    };
};

export default function FeeStructureShow({ school, feeStructure }: Props) {
    const { t } = useT();

    return (
        <>
            <Head
                title={t('feeStructures.show', { name: feeStructure.name })}
            />
            <div className="space-y-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('feeStructures.show', { name: feeStructure.name })}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-4 md:mt-0">
                        <Link
                            href={`/admin/schools/${school.id}/fee-structures/${feeStructure.id}/edit`}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-4 py-2 text-sm font-medium"
                        >
                            {t('actions.edit')}
                        </Link>
                        <Button
                            onClick={() =>
                                confirmDelete(
                                    `/admin/schools/${school.id}/fee-structures/${feeStructure.id}`,
                                    {
                                        message: t(
                                            'common.deleteConfirmation',
                                            {
                                                name: t('feeStructures.title'),
                                            },
                                        ),
                                    },
                                )
                            }
                            variant="destructive"
                        >
                            {t('actions.delete')}
                        </Button>
                        <Button
                            href={`/admin/schools/${school.id}/fee-structures`}
                            variant="outline"
                        >
                            {t('common.back')}
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('feeStructures.form.title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('feeStructures.name')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {feeStructure.name}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('feeStructures.description')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {feeStructure.description ??
                                            t('common.notAvailable')}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('feeStructures.amount')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {(
                                            feeStructure.amount_minor / 100
                                        ).toFixed(2)}{' '}
                                        {t(
                                            `currencies.${feeStructure.currency}`,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('feeStructures.currency')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {t(
                                            `currencies.${feeStructure.currency}`,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('feeStructures.frequency')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {t(
                                            `frequencies.${feeStructure.frequency}`,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('feeStructures.isActive')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {feeStructure.is_active
                                            ? t('common.yes')
                                            : t('common.no')}
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
