import { Bell, Menu, Search } from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import type { HTMLAttributes } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import LocaleSwitcher from '@/components/locale-switcher';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useT } from '@/hooks/useT';
import { useInitials } from '@/hooks/use-initials';
import { dashboard } from '@/routes';
import { SearchField } from '@/components/forms/search-field';
import { useSidebar } from '@/components/ui/sidebar';
import { useState } from 'react';

export function AppTopbar({
    className,
    ...props
}: HTMLAttributes<HTMLElement>) {
    const { auth } = usePage().props as {
        auth: {
            user: { name: string; email: string } | null;
        };
    };
    const [search, setSearch] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { toggleSidebar } = useSidebar();
    const { t } = useT();
    const getInitials = useInitials();

    // The roster is the one list that answers a name, a number or a class, so
    // the shell search submits there rather than to a route that does nothing.
    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();

        const term = search.trim();

        if (term === '') {
            return;
        }

        router.get(
            '/portal/students',
            { search: term },
            { preserveState: true },
        );
        setIsSearchOpen(false);
    };

    // Bundle shell: a 56px control bar on the lowest surface step.
    return (
        <header
            className={cn(
                'bg-surface-container-lowest/90 border-outline-variant sm:gap-gutter-md sm:px-gutter-md sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b px-3 backdrop-blur-xl',
                className,
            )}
            {...props}
        >
            <div className="flex min-w-0 items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label={t('shell.openNavigation')}
                    onClick={toggleSidebar}
                >
                    <Menu size={20} />
                </Button>

                <Link
                    href={dashboard()}
                    className="text-foreground hover:text-primary truncate text-sm font-semibold"
                >
                    Madrasati
                </Link>
            </div>

            <div className="flex min-w-0 flex-1 items-center justify-center">
                {/* Search Field - Visible on lg and up */}
                <div className="hidden lg:flex lg:w-1/2 lg:items-center">
                    <form onSubmit={handleSearch} className="w-full">
                        <SearchField
                            placeholder={t('shell.searchPlaceholder')}
                            value={search}
                            onChange={setSearch}
                            className="w-full"
                        />
                    </form>
                </div>

                {/* Mobile search button */}
                <div className="flex items-center lg:hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        aria-label={t('shell.toggleSearch')}
                    >
                        <Search size={18} />
                    </Button>

                    {/* Mobile search dropdown */}
                    {isSearchOpen && (
                        <div className="border-outline-variant bg-card absolute end-0 top-16 z-20 mt-2 w-56 rounded-md border shadow-lg">
                            <form onSubmit={handleSearch} className="p-4">
                                <SearchField
                                    placeholder={t('shell.searchPlaceholder')}
                                    value={search}
                                    onChange={setSearch}
                                    className="mb-2 w-full"
                                />
                                <Button
                                    type="submit"
                                    variant="default"
                                    size="sm"
                                    className="w-full"
                                >
                                    {t('shell.search')}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
                <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label={t('shell.notifications')}
                >
                    <Link href="/portal/notifications">
                        <Bell size={18} />
                    </Link>
                </Button>

                <LocaleSwitcher />

                {auth?.user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="text-muted-foreground hover:text-foreground hover:bg-accent focus:ring-ring flex shrink-0 items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-bold focus:ring-2 focus:outline-none"
                            >
                                {/* Initials only: no external avatar service is
                                    called for a name we already have. */}
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                                        {getInitials(auth.user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:inline">
                                    {auth.user.name}
                                </span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-56 space-y-1"
                        >
                            <DropdownMenuLabel className="px-4 py-3">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">
                                        {auth.user.name}
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        {auth.user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/settings/profile"
                                        className="flex w-full items-center gap-2 text-sm"
                                    >
                                        {t('shell.accountSettings')}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/settings/appearance"
                                        className="flex w-full items-center gap-2 text-sm"
                                    >
                                        {t('shell.appearance')}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/portal/notifications"
                                        className="flex w-full items-center gap-2 text-sm"
                                    >
                                        {t('shell.notifications')}
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/faq"
                                        className="flex w-full items-center gap-2 text-sm"
                                    >
                                        {t('shell.help')}
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem
                                onSelect={() => {
                                    const form = document.createElement('form');
                                    form.method = 'post';
                                    form.action = '/logout';
                                    document.body.appendChild(form);
                                    form.requestSubmit();
                                }}
                            >
                                <span className="flex w-full items-center gap-2 text-sm">
                                    {t('shell.logOut')}
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : null}
            </div>
        </header>
    );
}

export default AppTopbar;
