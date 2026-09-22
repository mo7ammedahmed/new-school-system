import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import type { LayoutProps } from '@/types/shared';

export default function AuthLayout({
    children,
    title = '',
    description = '',
    className,
    ...props
}: LayoutProps) {
    return (
        <AuthLayoutTemplate title={title} description={description} className={className} {...props}>
            {children}
        </AuthLayoutTemplate>
    );
}