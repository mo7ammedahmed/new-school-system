import { Link } from '@inertiajs/react';
import { PanelLeftOpenIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useT } from '@/hooks/useT';
import { useNavigation } from '@/lib/navigation';
import { useSidebar } from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Destinations worth a permanent thumb slot on a phone, in priority order.
 * Anything the user cannot reach is dropped, because the list is filtered
 * through the same ability-gated navigation the sidebar uses.
 */
const PRIORITY = ['/portal/students', '/finance', '/notices'];

/**
 * Destinations that fit beside the "More" slot at a 320px phone width. A
 * sixth slot squeezes every label past the point where it truncates. Its
 * Arabic label is short on purpose: "الرئيسية" and "الإشعارات" are the
 * longest strings the bar has to hold.
 */
const MAX_ITEMS = 4;

export function MobileNav() {
    const isMobile = useIsMobile();
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { flat } = useNavigation();
    const { setOpenMobile } = useSidebar();
    const { t } = useT();

    if (!isMobile) {
        return null;
    }

    const dashboardItem = flat[0];
    const notifications = flat.find(
        (item) => item.href === '/portal/notifications',
    );
    // Nav hrefs are school-scoped (`/admin/schools/3/finance`), so a priority
    // entry matches on the tail of the path rather than on equality.
    const prioritised = PRIORITY.map((fragment) =>
        flat.find(
            (item) =>
                typeof item.href === 'string' &&
                (item.href === fragment || item.href.endsWith(fragment)),
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

    // The school notices surface and the personal notifications list read as
    // almost the same word in Arabic, so the bar keeps only the school-scoped
    // one. Notifications stays one tap away in the topbar bell and in the
    // drawer, which is a better trade than two identical-looking thumbs.
    const hasNotices = items.some(
        (item) =>
            typeof item.href === 'string' && item.href.endsWith('/notices'),
    );

    if (
        notifications &&
        !hasNotices &&
        !items.some((item) => item.href === notifications.href)
    ) {
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
                        key={typeof item.href === 'string' ? item.href : ''}
                        href={item.href}
                        prefetch
                        className={cn(
                            'text-label-caps flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 font-medium transition-colors',
                            isActive
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {item.icon && <item.icon className="size-4 shrink-0" />}
                        <span className="w-full truncate text-center">
                            {item.shortTitle ?? item.title}
                        </span>
                    </Link>
                );
            })}

            {/* Opens the full sidebar rather than navigating to a dead route. */}
            {items.length < flat.length && (
                <button
                    type="button"
                    onClick={() => setOpenMobile(true)}
                    aria-label={t('shell.openNavigation')}
                    className="text-muted-foreground hover:text-foreground text-label-caps flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 font-medium"
                >
                    <PanelLeftOpenIcon
                        className="size-3 shrink-0"
                        opacity="75"
                    />
                    <span className="text-label-caps max-w-full truncate">
                        {t('shell.more')}
                    </span>
                </button>
            )}
        </nav>
    );
}
