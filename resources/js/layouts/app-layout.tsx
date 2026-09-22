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
    let LayoutComponent;
    
    switch (variant) {
        case 'header':
            LayoutComponent = AppHeaderLayout;
            break;
        case 'public':
            LayoutComponent = PublicLayout;
            break;
        case 'auth':
            LayoutComponent = AuthLayout;
            break;
        case 'settings':
            LayoutComponent = SettingsLayout;
            break;
        case 'sidebar':
        default:
            LayoutComponent = AppSidebarLayout;
            break;
    }
    
    return (
        <LayoutComponent
            breadcrumbs={breadcrumbs}
            title={title}
            description={description}
            active={active}
            className={className}
            {...props}
        >
            {children}
        </LayoutComponent>
    );
}
