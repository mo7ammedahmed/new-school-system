import { usePage } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from '@inertiajs/react';
import {
  Calendar,
  CheckCircle2,
  Users,
  Bell,
  CreditCard,
  BookOpen,
  Building,
  MessageSquare,
  ShieldCheck,
  Settings,
  Megaphone,
  User,
  Zap,
  BarChart3,
} from 'lucide-react';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';

// Define navigation items for different sections
const navItems = {
  dashboard: [
    { name: 'Dashboard', href: () => import('@/routes').then(r => r.dashboard()), icon: Calendar },
  ],
  students: [
    { name: 'Students', href: () => import('@/routes').then(r => r.students()), icon: Users },
    { name: 'Attendance', href: () => import('@/routes').then(r => r.adminReportsAttendance()), icon: CheckCircle2 },
    { name: 'Grades', href: '#', icon: BookOpen }, // Placeholder
  ],
  teachers: [
    { name: 'Teachers', href: () => import('@/routes').then(r => r.teacher()), icon: Users },
    { name: 'Timetable', href: '#', icon: Building }, // Placeholder
    { name: 'Attendance', href: () => import('@/routes').then(r => r.adminReportsAttendance()), icon: CheckCircle2 },
  ],
  finance: [
    { name: 'Finance', href: () => import('@/routes').then(r => r.adminFinance()), icon: CreditCard },
    { name: 'Invoices', href: () => import('@/routes').then(r => r.adminFinanceInvoices()), icon: BookOpen },
    { name: 'Reports', href: () => import('@/routes').then(r => r.adminFinanceReports()), icon: BarChart3 },
  ],
  communications: [
    { name: 'Messages', href: () => import('@/routes').then(r => r.notifications()), icon: MessageSquare },
    { name: 'Notices', href: () => import('@/routes').then(r => r.adminNotices()), icon: Megaphone },
    { name: 'Notifications', href: () => import('@/routes').then(r => r.notificationsIndex()), icon: Bell },
  ],
  settings: [
    { name: 'Settings', href: () => import('@/routes').then(r => r.settings()), icon: Settings },
    { name: 'Profile', href: () => import('@/routes').then(r => r.settingsProfile()), icon: User },
    { name: 'Security', href: () => import('@/routes').then(r => r.settingsSecurity()), icon: Zap },
  ],
};

// Default navigation items (dashboard)
const DEFAULT_ITEMS = navItems.dashboard;

// Helper to get current route name from inertia page
function getCurrentRouteName(pageProps: any): keyof typeof navItems | 'default' {
  const url = new URL(window.location.href);
  const path = url.pathname;

  // Simple route matching - in a real app, this would be more sophisticated
  if (path.includes('/dashboard') || path === '/') return 'dashboard';
  if (path.includes('/students')) return 'students';
  if (path.includes('/teachers')) return 'teachers';
  if (path.includes('/finance')) return 'finance';
  if (path.includes('/notices') || path.includes('/notifications')) return 'communications';
  if (path.includes('/settings')) return 'settings';

  return 'default';
}

export function MobileNav() {
  const isMobile = useIsMobile();
  const { props: pageProps } = usePage();

  // Hide on desktop
  if (!isMobile) {
    return null;
  }

  const currentRoute = getCurrentRouteName(pageProps);
  const items = navItems[currentRoute as keyof typeof navItems] || DEFAULT_ITEMS;

  // Handle navigation with inertia
  const navigateTo = useCallback((href: string) => {
    // In a real implementation, this would use inertia's router
    window.location.href = href;
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-14 bg-background border-t border-muted flex items-center justify-center gap-1 z-50 shadow-lg">
      {items.map((item, index) => {
        const href = typeof item.href === 'function' ? item.href() : item.href;
        return (
          <Link
            key={index}
            href={typeof item.href === 'function' ? '#' : item.href}
            onClick={(e) => {
              if (typeof item.href === 'function') {
                e.preventDefault();
                // For dynamic imports, we'd need to handle this differently
                // For now, we'll just navigate to the href
                navigateTo(item.href instanceof Promise ? '#' : item.href);
              }
            }}
            className={cn(
              "flex flex-col items-center gap-1 p-1 rounded-md hover:bg-accent hover:text-accent-foreground",
              "text-xs font-medium",
              "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            <span className="sr-only">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}