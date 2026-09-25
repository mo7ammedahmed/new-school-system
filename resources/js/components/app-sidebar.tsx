import { Link, usePage } from '@inertiajs/react';
import type { SharedPageProps } from '@/types/shared';
import { dashboard } from '@/routes';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { useNavigation } from '@/lib/navigation';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { LayoutGrid, Users, Bell } from 'lucide-react';

export function AppSidebar() {
    const { sections } = useNavigation();
    const { direction } = usePage<SharedPageProps>().props;

    // Arabic reads right to left: the rail belongs on the right edge.
    return (
        <Sidebar
            side={direction === 'rtl' ? 'right' : 'left'}
            collapsible="icon"
            variant="sidebar"
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {sections.map((section, index) => (
                    <SidebarGroup key={`group-${section.key}`}>
                        <SidebarGroupLabel>
                            <div className="flex items-center gap-2">
                                {/* Section icon based on key */}
                                {section.key === 'platform' && (
                                    <LayoutGrid className="text-muted-foreground h-4 w-4" />
                                )}
                                {section.key === 'administration' && (
                                    <Users className="text-muted-foreground h-4 w-4" />
                                )}
                                {section.key === 'mySpace' && (
                                    <Bell className="text-muted-foreground h-4 w-4" />
                                )}
                                <span className="text-sidebar-foreground/80 text-xs font-medium">
                                    {section.label}
                                </span>
                            </div>
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <NavMain items={section.items} />
                        </SidebarGroupContent>
                        {/* Separator between sections, never after the last one. */}
                        {index < sections.length - 1 && (
                            <SidebarSeparator className="my-2" />
                        )}
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
