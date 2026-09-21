import { Link, usePage } from '@inertiajs/react';
import {
  Bell,
  Calendar,
  ChevronDown,
  Globe,
  GlobeAlt,
  LogOut,
  MessageCircle,
  Settings,
  User,
  Users,
} from 'lucide-react';
import { useState } from 'react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { usePageContext } from '@/hooks/use-page-context';
import { cn } from '@/lib/utils';

export function AppTopbar({
  breadcrumbs = [],
}: {
  breadcrumbs?: Array<{ title: string; href: string }>;
}) {
  const { locale = 'ar', school, auth } = usePage<{
    locale?: 'ar' | 'en';
    school?: { id: number; name: string };
    auth?: { user: { id: number; name: string; email: string; avatar?: string } };
  }>().props;
  const { locales } = usePageContext();
  const isArabic = locale === 'ar';
  const [notificationCount, setNotificationCount] = useState(3); // Simulated count

  return (
    <div className="flex h-16 w-full items-center justify-between px-4 bg-background border-b border-muted">
      {/* Left side: Brand and navigation */}
      <div className="flex items-center space-x-4">
        {/* App Logo/Brand */}
        <Link href="/">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-primary-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Universal School
              </p>
              <p className="text-xs text-muted-foreground">
                Management Platform
              </p>
            </div>
          </div>
        </Link>

        {/* Page Title and Breadcrumbs */}
        <div className="hidden md:flex flex-1 items-center space-x-4">
          <h1 className="text-lg font-semibold text-foreground">
            {isArabic ? 'لوحة التحكم' : 'Control Panel'}
          </h1>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>

      {/* Center: Search and Actions */}
      <div className="hidden md:flex flex-1 items-center justify-center space-x-4">
        {/* Global Search */}
        <div className="relative w-64">
          <input
            type="text"
            placeholder={isArabic ? 'بحث عام...' : 'Global search...'}
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
            <Globe className="h-4 w-4" />
          </div>
        </div>

        {/* Language Switcher */}
        <LocaleSwitcher />

        {/* Theme Switcher */}
        <div className="relative inline-flex items-center gap-2 rounded-md border border-input bg-background px-2 py-1 text-sm">
          <span className="sr-only">Theme</span>
          <button
            onClick={() => {
              // Toggle theme logic would go here
              const html = document.documentElement;
              html.classList.toggle('dark');
            }}
            className="hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {document.documentElement.classList.contains('dark') ? (
              <GlobeAlt className="h-4 w-4" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Right side: User actions and notifications */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button
            className="relative inline-flex items-center justify-center rounded-md border border-transparent bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
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
          <button
            className="relative inline-flex items-center justify-center rounded-md border border-transparent bg-background px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          {/* Messages dropdown would go here */}
        </div>

        {/* User Menu */}
        <div className="relative">
          <div className="flex items-center gap-2 rtl:reverse">
            {auth?.user?.avatar ? (
              <img
                src={auth.user.avatar}
                alt={auth.user.name}
                className="h-8 w-8 rounded-full border-border/50"
              >
              </img>
            ) : (
              <User className="h-8 w-8 text-primary-foreground" />
            )}
            <div className="space-y-1 text-left">
              <p className="text-sm font-medium text-foreground truncate max-w-xs">
                {auth?.user?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate max-w-xs">
                {school?.name ?? 'School Name'}
              }
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* User menu dropdown */}
          <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-popover p-1 shadow-lg border border-popover/50 z-50 ring-offset-background shadow-[0_8px_9px_-4px_rgb(0,0,0,0.3),0_4px_18px_0_rgb(0,0,0,0.2)] focus:outline-none" data-state="closed">
            <div className="px-4 pt-2 pb-3">
              <p className="text-sm font-medium text-popover-foreground">
                {auth?.user?.name}
              </p>
              <p className="text-xs text-popover-muted">
                {auth?.user?.email}
              }
            </div>
            <div className="border-t border-popover/20"></div>
            <div className="px-4 pb-3">
              <Link
                href="/admin/schools"
                className="block w-full text-left rounded-md px-3 py-2 text-sm font-medium text-popover-foreground hover:bg-popover/70"
              >
                School Management
              </Link>
              <Link
                href="/admin/organization"
                className="block w-full text-left rounded-md px-3 py-2 text-sm font-medium text-popover-foreground hover:bg-popover/70"
              >
                Organization Settings
              </Link>
              <Link
                href="/profile"
                className="block w-full text-left rounded-md px-3 py-2 text-sm font-medium text-popover-foreground hover:bg-popover/70"
              >
                Profile
              </Link>
              <Link
                href="/settings"
                className="block w-full text-left rounded-md px-3 py-2 text-sm font-medium text-popover-foreground hover:bg-popover/70"
              >
                Settings
              </Link>
              <Link
                href="/logout"
                method="post"
                className="block w-full text-left rounded-md px-3 py-2 text-sm font-medium text-popover-foreground hover:bg-popover/70 text-destructive"
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