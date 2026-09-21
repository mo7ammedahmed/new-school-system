<<<<<<< HEAD
import { Link } from '@inertiajs/react';
=======
import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    BookOpenCheck,
    CalendarDays,
    ClipboardList,
    CreditCard,
    FileText,
    GraduationCap,
    LayoutGrid,
    Megaphone,
    Settings2,
    UsersRound,
    WalletCards,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
>>>>>>> origin/main
import {
  LayoutGrid,
  Users,
  User,
  ShieldCheck,
  BookOpen,
  FileText,
  BarChart3,
  TrendingUp,
  Bell,
  Calendar,
  ClipboardList,
  Settings,
  LogOut,
  Home,
  Folder,
  PlusCircle,
  ArrowRightLeft,
  Building,
  GraduationCap,
  MessageSquare,
  PiggyBank,
  Receive,
  Send,
  Banknote,
  Briefcase,
  List,
  CheckSquare,
  Truck,
  Palette,
  Zap,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { useCurrentUrl } from '@/hooks/use-current-url';
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
  SidebarInset,
} from '@/components/ui/sidebar';
<<<<<<< HEAD
import {
  dashboard,
  // Student routes
  students,
  studentsShow,
  // Teacher routes
  teacher,
  teacherPortal,
  // Guardian routes
  guardian,
  guardianPortal,
  // Academic routes
  adminAcademics,
  adminAcademicsYears,
  adminAcademicsClasses,
  adminAcademicsSections,
  adminAcademicsEnrollments,
  adminAcademicsTeacherAssignments,
  // Finance routes
  adminFinance,
  adminFinanceFees,
  adminFinanceInvoices,
  adminFinanceReports,
  adminFinanceReconciliation,
  // Attendance routes
  adminReportsAttendance,
  // Assessment routes
  assessments,
  // Notice routes
  adminNotices,
  // Notification routes
  notifications,
  notificationsIndex,
  // Delivery monitoring routes
  adminNotificationsDeliveries,
  // Site content routes
  adminSiteContent,
  // Page routes
  adminPages,
  // Media routes
  media,
  // Admissions routes
  adminAdmissions,
  // Settings routes
  settings,
  settingsAppearance,
  settingsProfile,
  settingsSecurity,
} from '@/routes';
import type { NavItem } from '@/types';

export function AppSidebar() {
  const { isCurrentUrl } = useCurrentUrl();

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
        <SidebarGroup className="px-2 py-0">
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarMenu>
            {/* Dashboard */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(dashboard())}
                tooltip={{ children: 'Dashboard' }}
              >
                <Link href={dashboard()} prefetch>
                  <LayoutGrid />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Students */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(students()) || isCurrentUrl(studentsShow(':id'))}
                tooltip={{ children: 'Students' }}
              >
                <Link href={students()} prefetch>
                  <Users />
                  <span>Students</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Teachers */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(teacher()) || isCurrentUrl(teacherPortal())}
                tooltip={{ children: 'Teachers' }}
              >
                <Link href={teacher()} prefetch>
                  <User />
                  <span>Teachers</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Guardians */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(guardian()) || isCurrentUrl(guardianPortal())}
                tooltip={{ children: 'Guardians' }}
              >
                <Link href={guardian()} prefetch>
                  <ShieldCheck />
                  <span>Guardians</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Academics */}
            <SidebarGroup>
              <SidebarGroupLabel>Academics</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isCurrentUrl(adminAcademics())}
                      tooltip={{ children: 'Academics' }}
                    >
                      <Link href={adminAcademics()} prefetch>
                        <GraduationCap className="h-4 w-4" />
                        <span className="ms-2">Academics</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isCurrentUrl(adminAcademicsYears())}
                      tooltip={{ children: 'Academic Years' }}
                    >
                      <Link href={adminAcademicsYears()} prefetch>
                        <Calendar className="h-4 w-4" />
                        <span className="ms-2">Academic Years</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isCurrentUrl(adminAcademicsClasses())}
                      tooltip={{ children: 'Classes' }}
                    >
                      <Link href={adminAcademicsClasses()} prefetch>
                        <Building className="h-4 w-4" />
                        <span className="ms-2">Classes</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isCurrentUrl(adminAcademicsSections())}
                      tooltip={{ children: 'Sections' }}
                    >
                      <Link href={adminAcademicsSections()} prefetch>
                        <List className="h-4 w-4" />
                        <span className="ms-2">Sections</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isCurrentUrl(adminAcademicsEnrollments())}
                      tooltip={{ children: 'Enrollments' }}
                    >
                      <Link href={adminAcademicsEnrollments()} prefetch>
                        <UserPlus className="h-4 w-4" />
                        <span className="ms-2">Enrollments</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isCurrentUrl(adminAcademicsTeacherAssignments())}
                      tooltip={{ children: 'Teacher Assignments' }}
                    >
                      <Link href={adminAcademicsTeacherAssignments()} prefetch>
                        <ArrowRightLeft className="h-4 w-4" />
                        <span className="ms-2">Teacher Assignments</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
=======
import { useT } from '@/hooks/useT';
import { dashboard } from '@/routes';
import type { SharedPageProps } from '@/types/shared';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const { t } = useT();
    const { auth } = usePage<SharedPageProps>().props;

    const abilities = auth?.abilities;
    const user = auth?.user;
    const schools = auth?.schools ?? [];
    const school = schools[0];
    const base = school ? `/admin/schools/${school.id}` : null;

    const mainItems: NavItem[] = [
        { title: t('shell.dashboard'), href: dashboard(), icon: LayoutGrid },
    ];

    const administrationItems: NavItem[] = [];

    if (base && abilities?.manageSchedule) {
        administrationItems.push(
            {
                title: t('shell.scheduleSetup'),
                href: `${base}/schedule/setup`,
                icon: Settings2,
            },
            {
                title: t('shell.timetable'),
                href: `${base}/schedule/timetable`,
                icon: CalendarDays,
            },
            {
                title: t('shell.exams'),
                href: `${base}/schedule/exams`,
                icon: ClipboardList,
            },
        );
    }

    if (base && abilities?.manageEnrollment) {
        administrationItems.push({
            title: t('shell.academics'),
            href: `${base}/academics`,
            icon: GraduationCap,
        });
    }

    if (base && abilities?.manageAdmissions) {
        administrationItems.push({
            title: t('shell.admissions'),
            href: `${base}/applications`,
            icon: UsersRound,
        });
    }

    if (base && abilities?.manageFinance) {
        administrationItems.push(
            {
                title: t('shell.finance'),
                href: `${base}/finance`,
                icon: WalletCards,
            },
            {
                title: t('shell.financeReports'),
                href: `${base}/reports/finance`,
                icon: CreditCard,
            },
        );
    }

    if (base && abilities?.viewAttendanceReports) {
        administrationItems.push({
            title: t('shell.attendanceReports'),
            href: `${base}/reports/attendance`,
            icon: BarChart3,
        });
    }

    if (base && abilities?.manageContent) {
        administrationItems.push(
            {
                title: t('shell.notices'),
                href: `${base}/notices`,
                icon: Megaphone,
            },
            { title: t('shell.pages'), href: `${base}/pages`, icon: FileText },
        );
    }

    if (abilities?.manageSiteContent) {
        administrationItems.push({
            title: t('shell.siteContent'),
            href: '/admin/site-content',
            icon: FileText,
        });
    }

    if (abilities?.manageFinance) {
        administrationItems.push({
            title: t('shell.deliveries'),
            href: '/admin/notifications/deliveries',
            icon: Bell,
        });
    }

    const workspaceItems: NavItem[] = [];

    if (user?.role === 'teacher') {
        workspaceItems.push({
            title: t('shell.teacherPortal'),
            href: '/portal/teacher',
            icon: BookOpenCheck,
        });
    }

    if (user?.role === 'guardian') {
        workspaceItems.push({
            title: t('shell.guardianPortal'),
            href: '/portal/guardian',
            icon: UsersRound,
        });
    }

    if (user !== null && user !== undefined) {
        workspaceItems.push({
            title: t('shell.notifications'),
            href: '/portal/notifications',
            icon: Bell,
        });
    }

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
>>>>>>> origin/main
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

<<<<<<< HEAD
            {/* Finance */}
            <SidebarGroup>
              <SidebarGroupLabel>Finance</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isCurrentUrl(adminFinance())}
                      tooltip={{ children: 'Finance' }}
                    >
                      <Link href={adminFinance()} prefetch>
                        <PiggyBank className="h-4 w-4" />
                        <span className="ms-2">Finance</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isCurrentUrl(adminFinanceFees())}
                      tooltip={{ children: 'Fee Management' }}
                    >
                      <Link href={adminFinanceFees()} prefetch>
                        <Receive className="h-4 w-4" />
                        <span className="ms-2">Fee Management</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isCurrentUrl(adminFinanceInvoices())}
                      tooltip={{ children: 'Invoicing' }}
                    >
                      <Link href={adminFinanceInvoices()} prefetch>
                        <Send className="h-4 w-4" />
                        <span className="ms-2">Invoicing</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isCurrentUrl(adminFinanceReports())}
                      tooltip={{ children: 'Financial Reports' }}
                    >
                      <Link href={adminFinanceReports()} prefetch>
                        <BarChart3 className="h-4 w-4" />
                        <span className="ms-2">Financial Reports</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={isCurrentUrl(adminFinanceReconciliation())}
                      tooltip={{ children: 'Payment Reconciliation' }}
                    >
                      <Link href={adminFinanceReconciliation()} prefetch>
                        <Banknote className="h-4 w-4" />
                        <span className="ms-2">Payment Reconciliation</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Attendance */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(adminReportsAttendance())}
                tooltip={{ children: 'Attendance' }}
              >
                <Link href={adminReportsAttendance()} prefetch>
                  <ClipboardList />
                  <span>Attendance</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Assessments */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(assessments())}
                tooltip={{ children: 'Assessments' }}
              >
                <Link href={assessments()} prefetch>
                  <CheckSquare />
                  <span>Assessments</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Notices */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(adminNotices())}
                tooltip={{ children: 'Notices' }}
              >
                <Link href={adminNotices()} prefetch>
                  <MessageSquare />
                  <span>Notices</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Notifications */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(notifications()) || isCurrentUrl(notificationsIndex())}
                tooltip={{ children: 'Notifications' }}
              >
                <Link href={notifications()} prefetch>
                  <Bell />
                  <span>Notifications</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Delivery Monitoring */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(adminNotificationsDeliveries())}
                tooltip={{ children: 'Delivery Monitoring' }}
              >
                <Link href={adminNotificationsDeliveries()} prefetch>
                  <Truck />
                  <span>Delivery Monitoring</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Site Content */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(adminSiteContent())}
                tooltip={{ children: 'Site Content' }}
              >
                <Link href={adminSiteContent()} prefetch>
                  <FileText />
                  <span>Site Content</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Pages */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(adminPages())}
                tooltip={{ children: 'Pages' }}
              >
                <Link href={adminPages()} prefetch>
                  <FileText />
                  <span>Pages</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Media */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(media())}
                tooltip={{ children: 'Media' }}
              >
                <Link href={media()} prefetch>
                  <Folder />
                  <span>Media</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Admissions */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(adminAdmissions())}
                tooltip={{ children: 'Admissions' }}
              >
                <Link href={adminAdmissions()} prefetch>
                  <FolderPlus />
                  <span>Admissions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup className="px-2 py-0">
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarMenu className="mt-4">
            {/* Settings */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(settings())}
                tooltip={{ children: 'Settings' }}
              >
                <Link href={settings()} prefetch>
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Profile */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(settingsProfile())}
                tooltip={{ children: 'Profile' }}
              >
                <Link href={settingsProfile()} prefetch>
                  <User />
                  <span>Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Appearance */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(settingsAppearance())}
                tooltip={{ children: 'Appearance' }}
              >
                <Link href={settingsAppearance()} prefetch>
                  <Palette />
                  <span>Appearance</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Security */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCurrentUrl(settingsSecurity())}
                tooltip={{ children: 'Security' }}
              >
                <Link href={settingsSecurity()} prefetch>
                  <Zap />
                  <span>Security</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {/* Logout */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isCurrentUrl('/logout')}
                tooltip={{ children: 'Logout' }}
              >
                <Link href="/logout" prefetch method="post">
                  <LogOut />
                  <span>Logout</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
=======
            <SidebarContent>
                <NavMain items={mainItems} label={t('shell.platform')} />
                <NavMain
                    items={administrationItems}
                    label={t('shell.administration')}
                />
                <NavMain items={workspaceItems} label={t('shell.mySpace')} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
>>>>>>> origin/main
