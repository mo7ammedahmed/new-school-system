import { Bell, Menu, Search } from 'lucide-react';
import { Link, usePage, useRouter } from '@inertiajs/react';
import type { HTMLAttributes } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { dashboard } from '@/routes';
import { SearchField } from '@/components/forms/search-field';
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
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Navigate to search results page - this would need a search route/page implemented
        // For demonstration, we're logging the search term
        console.log('Global search for:', search);
        // In a real implementation, this would navigate to a search page:
        // router.get('/search', { search }, { preserveState: true, replace: true });
    };

    return (
        <header
            className={cn(
                'sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/90 backdrop-blur-xl',
                className,
            )}
            {...props}
        >
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open navigation"
                >
                    <Menu size={20} />
                </Button>

                <Link
                    href={dashboard()}
                    className="text-sm font-black text-foreground hover:text-primary"
                >
                    Madrasati
                </Link>
            </div>

            <div className="flex-1 flex items-center justify-center">
                {/* Search Field - Visible on lg and up */}
                <div className="hidden lg:flex lg:items-center lg:w-1/2">
                    <form onSubmit={handleSearch} className="w-full">
                        <SearchField
                            placeholder="Search students, teachers, classes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />
                    </form>
                </div>

                {/* Mobile search button */}
                <div className="lg:hidden flex items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        aria-label="Toggle search"
                    >
                        <Search size={18} />
                    </Button>

                    {/* Mobile search dropdown */}
                    {isSearchOpen && (
                        <div className="absolute top-16 right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                            <form onSubmit={handleSearch} className="p-4">
                                <SearchField
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full mb-2"
                                />
                                <Button
                                    type="submit"
                                    variant="default"
                                    size="sm"
                                    width="full"
                                >
                                    Search
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1.5">
                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex"
                    aria-label="Search"
                >
                    <Search size={18} />
                </Button>

                <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    aria-label="Notifications"
                >
                    <Bell size={18} />
                    <Badge
                        variant="secondary"
                        className="absolute -top-1 -right-1 h-5 w-5 min-w-[1.25rem] rounded-full p-0 text-xs"
                    >
                        0
                    </Badge>
                </Button>

                <LocaleSwitcher />

                {auth?.user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(auth.user.name)}`}
                                        alt={auth.user.name}
                                    />
                                    <AvatarFallback className="bg-primary text-xs font-black text-primary-foreground">
                                        {auth.user.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:inline">
                                    {auth.user.name}
                                </span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 space-y-1">
                            <DropdownMenuLabel className="px-4 py-3">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">
                                        {auth.user.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {auth.user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/profile/edit"
                                        className="flex w-full items-center gap-2 text-sm"
                                    >
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/appearance/edit"
                                        className="flex w-full items-center gap-2 text-sm"
                                    >
                                        Appearance
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/notifications"
                                        className="flex w-full items-center gap-2 text-sm"
                                    >
                                        Notifications
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/help"
                                        className="flex w-full items-center gap-2 text-sm"
                                    >
                                        Help & Support
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator className="my-1"/>
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
                                    Log out
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