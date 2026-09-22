import { Link } from '@inertiajs/react';
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

    return (
        <Sidebar collapsible="icon" variant="inset">
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
                    <>
                        <SidebarGroup key={`group-${section.key}`}>
                            <SidebarGroupLabel>
                                <div className="flex items-center gap-2">
                                    {/* Section icon based on key */}
                                    {section.key === 'platform' && <LayoutGrid className="h-4 w-4 text-muted-foreground" />}
                                    {section.key === 'administration' && <Users className="h-4 w-4 text-muted-foreground" />}
                                    {section.key === 'mySpace' && <Bell className="h-4 w-4 text-muted-foreground" />}
                                    <span className="text-xs font-medium text-sidebar-foreground/80">{section.label}</span>
                                </div>
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <NavMain
                                    items={section.items}
                                    label={section.label}
                                />
                            </SidebarGroupContent>
                        </SidebarGroup>
                        
                        {/* Add separator between sections (except after last section) */}
                        {index < sections.length - 1 && (
                            <SidebarSeparator className="my-2" />
                        )}
                    </>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
