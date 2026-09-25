import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { confirmDelete } from '@/lib/confirm-delete';
import { useT } from '@/hooks/useT';

type Props = {
    school: { id: number; name: string };
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
};

export default function UserShow({ school, user }: Props) {
    const { t } = useT();
    const listUrl = `/admin/schools/${school.id}/users`;

    return (
        <>
            <Head title={user.name} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('users.title')}
                    </h1>
                    <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
                        <Button asChild>
                            <Link href={`${listUrl}/${user.id}/edit`}>
                                {t('users.edit')}
                            </Link>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                confirmDelete(`${listUrl}/${user.id}`)
                            }
                        >
                            {t('actions.delete')}
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={listUrl}>{t('users.backToList')}</Link>
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('users.information')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-xl">
                                    <User className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        {user.name}
                                    </h2>
                                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                        <Badge variant="secondary">
                                            {t(`roles.${user.role}`)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h3 className="text-muted-foreground text-sm font-medium">
                                        {t('users.email')}
                                    </h3>
                                    <p className="mt-1 block truncate">
                                        {user.email}
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
