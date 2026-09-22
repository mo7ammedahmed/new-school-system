import { Link } from '@inertiajs/react';
import { PanelLeftOpenIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useNavigation } from '@/lib/navigation';
import type { NavItem } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Destinations worth a permanent thumb slot on a phone, in priority order.
 * Anything the user cannot reach is dropped, because the list is filtered
 * through the same ability-gated navigation the sidebar uses.
 */
const PRIORITY = ['/portal/students', '/finance', '/notices'];

const MAX_ITEMS = 5;

export function MobileNav() {
    const isMobile = useIsMobile();
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { flat } = useNavigation();

    if (!isMobile) {
        return null;
    }

    const dashboardItem = flat[0];
    const notifications = flat.find(
        (item) => item.href === '/portal/notifications',
    );
    const prioritised = PRIORITY.map((fragment) =>
        flat.find((item) =>
            item.href === fragment ||
            item.href.startsWith(`${fragment}/`) ||
            item.href === `${fragment}`
        ),
    ).filter((item): item is NavItem => item !== undefined);

    // Build items list: dashboard + prioritized items
    // We'll handle notifications separately to avoid duplication
    let items = [dashboardItem, ...prioritised]
        .filter((item): item is NavItem => item !== undefined)
        .filter(
            (item, index, all) =>
                all.findIndex((other) => other.href === item.href) === index,
        ); // Remove duplicates

    // Add notifications if it exists and isn't already in our list
    if (notifications && !items.some(item => item.href === notifications.href)) {
        items = [...items, notifications];
    }

    // Limit to max items
    items = items.slice(0, MAX_ITEMS);

    if (items.length === 0) {
        return null;
    }

    return (
        <nav
            aria-label="Mobile navigation"
            className="bg-background border-border fixed inset-x-0 bottom-0 z-50 flex h-14 border-t shadow-lg md:hidden"
        >
            {items.map((item) => {
                const isActive = isCurrentOrParentUrl(item.href);

                return (
                    <Link
                        key={String(item.href)}
                        href={item.href}
                        prefetch
                        className={cn(
                            'flex flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[0.6875rem] font-medium transition-colors',
                            isActive
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {item.icon && <item.icon className="size-4 shrink-0" />}
                        <span className="max-w-full truncate">
                            {item.title}
                        </span>
                    </Link>
                );
            })}

            {/* Visual indicator when there are more items available via sidebar */}
            {flat.length > MAX_ITEMS && (
                <Link
                    href="/admin/schools" // Link to sidebar-accessible area
                    prefetch
                    className="flex flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[0.6875rem] font-medium text-muted-foreground hover:text-foreground"
                >
                    <PanelLeftOpenIcon className="size-3 shrink-0" opacity="75" />
                    <span className="max-w-full truncate text-xs">More</span>
                </Link>
            )}
        </nav>
    );
}
