import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { FormField } from '@/components/forms/form-field';
import { FormSection } from '@/components/forms/form-section';
import { FormErrors } from '@/components/forms/form-errors';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useT } from '@/hooks/useT';

type Props = {
    school: { id: number; name: string };
    user: { id: number; name: string; email: string; role: string };
    /** The roles this screen may assign, keyed by role value. */
    roles: Record<string, string>;
};

export default function UserEdit({ school, user, roles }: Props) {
    const { t } = useT();
    const listUrl = `/admin/schools/${school.id}/users`;

    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '',
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        put(`${listUrl}/${user.id}`);
    };

    const fieldError = (field: keyof typeof data) =>
        errors[field] ? (
            <p className="text-destructive text-sm">{errors[field]}</p>
        ) : null;

    return (
        <>
            <Head title={t('users.edit')} />
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-semibold">
                        {t('users.edit')}
                    </h1>
                    <Button asChild variant="outline">
                        <Link href={listUrl}>{t('users.backToList')}</Link>
                    </Button>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} noValidate>
                        <CardHeader>
                            <CardTitle>{t('users.information')}</CardTitle>
                            <CardDescription>
                                {t('users.editDescription', {
                                    name: user.name,
                                })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormErrors errors={errors} />

                            <FormSection>
                                <FormField
                                    id="name"
                                    label={t('users.name')}
                                    description={t('users.nameHint')}
                                    required
                                >
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        maxLength={255}
                                        required
                                        autoComplete="name"
                                    />
                                </FormField>
                                {fieldError('name')}
                            </FormSection>

                            <FormSection>
                                <FormField
                                    id="email"
                                    label={t('users.email')}
                                    description={t('users.emailHint')}
                                    required
                                >
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        maxLength={255}
                                        required
                                        autoComplete="email"
                                    />
                                </FormField>
                                {fieldError('email')}
                            </FormSection>

                            <FormSection>
                                <FormField
                                    id="role"
                                    label={t('users.role')}
                                    description={t('users.roleHint')}
                                    required
                                >
                                    <Select
                                        id="role"
                                        value={data.role}
                                        onValueChange={(value) =>
                                            setData('role', value)
                                        }
                                        required
                                    >
                                        {Object.keys(roles).map((role) => (
                                            <option key={role} value={role}>
                                                {t(`roles.${role}`)}
                                            </option>
                                        ))}
                                    </Select>
                                </FormField>
                                {fieldError('role')}
                            </FormSection>

                            <FormSection>
                                <FormField
                                    id="password"
                                    label={t('users.password')}
                                    description={t('users.passwordKeep')}
                                >
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        autoComplete="new-password"
                                    />
                                </FormField>
                                {fieldError('password')}
                            </FormSection>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 pt-4">
                            <Button asChild variant="outline">
                                <Link href={listUrl}>{t('common.cancel')}</Link>
                            </Button>
                            <Button type="submit" isLoading={processing}>
                                {t('common.update')}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </>
    );
}
