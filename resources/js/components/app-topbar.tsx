import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    Calendar,
    ChevronDown,
    Globe,
    LogOut,
    MessageCircle,
    Settings,
    Sun,
    Moon,
    User,
    Users,
} from 'lucide-react';
import { useState } from 'react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import LocaleSwitcher from '@/components/locale-switcher';
import { usePageContext } from '@/hooks/use-page-context';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

export function AppTopbar({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItem[];
}) {
    const {
        locale = 'ar',
        school,
        auth,
    } = usePage<{
        locale?: 'ar' | 'en';
        school?: { id: number; name: string };
        auth?: {
            user: { id: number; name: string; email: string; avatar?: string };
        };
    }>().props;
    const { locales } = usePageContext();
    const isArabic = locale === 'ar';
    const [notificationCount, setNotificationCount] = useState(3); // Simulated count

    return (
        <div className="bg-background border-muted flex h-16 w-full items-center justify-between border-b px-4">
            {/* Left side: Brand and navigation */}
            <div className="flex items-center space-x-4">
                {/* App Logo/Brand */}
                <Link href="/">
                    <div className="flex items-center space-x-3">
                        <Users className="text-primary-foreground h-8 w-8" />
                        <div className="space-y-1">
                            <p className="text-foreground text-sm font-medium">
                                Universal School
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Management Platform
                            </p>
                        </div>
                    </div>
                </Link>

                {/* Page Title and Breadcrumbs */}
                <div className="hidden flex-1 items-center space-x-4 md:flex">
                    <h1 className="text-foreground text-lg font-semibold">
                        {isArabic ? 'لوحة التحكم' : 'Control Panel'}
                    </h1>
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            {/* Center: Search and Actions */}
            <div className="hidden flex-1 items-center justify-center space-x-4 md:flex">
                {/* Global Search */}
                <div className="relative w-64">
                    <input
                        type="text"
                        placeholder={
                            isArabic ? 'بحث عام...' : 'Global search...'
                        }
                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-4 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    <div className="text-muted-foreground pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <Globe className="h-4 w-4" />
                    </div>
                </div>

                {/* Language Switcher */}
                <LocaleSwitcher />

                {/* Theme Switcher */}
                <div className="border-input bg-background relative inline-flex items-center gap-2 rounded-md border px-2 py-1 text-sm">
                    <span className="sr-only">Theme</span>
                    <button
                        onClick={() => {
                            // Toggle theme logic would go here
                            const html = document.documentElement;
                            html.classList.toggle('dark');
                        }}
                        className="hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {document.documentElement.classList.contains('dark') ? (
                            <Sun className="h-4 w-4" />
                        ) : (
                            <Moon className="h-4 w-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Right side: User actions and notifications */}
            <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                    <button className="bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring relative inline-flex items-center justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50">
                        <Bell className="h-4 w-4" />
                        {notificationCount > 0 && (
                            <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 px-1 py-1 text-xs font-medium text-white">
                                {notificationCount}
                            </div>
                        )}
                    </button>
                    {/* Notification dropdown would go here */}
                </div>

                {/* Messages */}
                <div className="relative">
                    <button className="bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring relative inline-flex items-center justify-center rounded-md border border-transparent px-3 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50">
                        <MessageCircle className="h-4 w-4" />
                    </button>
                    {/* Messages dropdown would go here */}
                </div>

                {/* User Menu */}
                <div className="relative">
                    <div className="rtl:reverse flex items-center gap-2">
                        {auth?.user?.avatar ? (
                            <img
                                src={auth.user.avatar}
                                alt={auth.user.name}
                                className="border-border/50 h-8 w-8 rounded-full"
                            ></img>
                        ) : (
                            <User className="text-primary-foreground h-8 w-8" />
                        )}
                        <div className="space-y-1 text-left">
                            <p className="text-foreground max-w-xs truncate text-sm font-medium">
                                {auth?.user?.name}
                            </p>
                            <p className="text-muted-foreground max-w-xs truncate text-xs">
                                {school?.name ?? 'School Name'}
                            </p>
                        </div>
                        <ChevronDown className="text-muted-foreground h-4 w-4" />
                    </div>

                    {/* User menu dropdown */}
                    <div
                        className="bg-popover border-popover/50 ring-offset-background absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md border p-1 shadow-[0_8px_9px_-4px_rgb(0,0,0,0.3),0_4px_18px_0_rgb(0,0,0,0.2)] shadow-lg focus:outline-none"
                        data-state="closed"
                    >
                        <div className="px-4 pt-2 pb-3">
                            <p className="text-popover-foreground text-sm font-medium">
                                {auth?.user?.name}
                            </p>
                            <p className="text-popover-muted text-xs">
                                {auth?.user?.email}
                            </p>
                        </div>
                        <div className="border-popover/20 border-t"></div>
                        <div className="px-4 pb-3">
                            <Link
                                href="/admin/schools"
                                className="text-popover-foreground hover:bg-popover/70 block w-full rounded-md px-3 py-2 text-left text-sm font-medium"
                            >
                                School Management
                            </Link>
                            <Link
                                href="/admin/organization"
                                className="text-popover-foreground hover:bg-popover/70 block w-full rounded-md px-3 py-2 text-left text-sm font-medium"
                            >
                                Organization Settings
                            </Link>
                            <Link
                                href="/profile"
                                className="text-popover-foreground hover:bg-popover/70 block w-full rounded-md px-3 py-2 text-left text-sm font-medium"
                            >
                                Profile
                            </Link>
                            <Link
                                href="/settings"
                                className="text-popover-foreground hover:bg-popover/70 block w-full rounded-md px-3 py-2 text-left text-sm font-medium"
                            >
                                Settings
                            </Link>
                            <Link
                                href="/logout"
                                method="post"
                                className="text-popover-foreground hover:bg-popover/70 text-destructive block w-full rounded-md px-3 py-2 text-left text-sm font-medium"
                            >
                                Log Out
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
