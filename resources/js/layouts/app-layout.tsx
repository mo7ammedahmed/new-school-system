import AppHeaderLayout from './app/app-header-layout';
import AppSidebarLayout from './app/app-sidebar-layout';
import PublicLayout from '@/layouts/public-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import type { BreadcrumbItem } from '@/types';
import type { LayoutProps } from '@/types/shared';

export default function AppLayout({
    variant = 'sidebar',
    breadcrumbs = [],
    title,
    description,
    active,
    className,
    children,
    ...props
}: {
    variant?: 'sidebar' | 'header' | 'public' | 'auth' | 'settings';
    breadcrumbs?: BreadcrumbItem[];
    title?: string;
    description?: string;
    active?: string;
    className?: string;
    children: React.ReactNode;
} & LayoutProps) {
    switch (variant) {
        case 'header':
            return (
                <AppHeaderLayout
                    breadcrumbs={breadcrumbs}
                    title={title}
                    description={description}
                    className={className}
                    {...props}
                >
                    {children}
                </AppHeaderLayout>
            );
        case 'public':
            return (
                <PublicLayout
                    active={active}
                    title={title}
                    description={description}
                    className={className}
                    {...props}
                >
                    {children}
                </PublicLayout>
            );
        case 'auth':
            return (
                <AuthLayout
                    title={title}
                    description={description}
                    className={className}
                    {...props}
                >
                    {children}
                </AuthLayout>
            );
        case 'settings':
            return (
                <SettingsLayout
                    title={title}
                    description={description}
                    className={className}
                    {...props}
                >
                    {children}
                </SettingsLayout>
            );
        case 'sidebar':
        default:
            return (
                <AppSidebarLayout
                    breadcrumbs={breadcrumbs}
                    title={title}
                    description={description}
                    active={active}
                    className={className}
                    {...props}
                >
                    {children}
                </AppSidebarLayout>
            );
    }
}
