import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  ArrowUpLeft,
  Bell,
  BookOpenCheck,
  CalendarCheck2,
  CheckCircle2,
  CreditCard,
  FileText,
  GraduationCap,
  Megaphone,
  WalletCards,
  BarChart3,
  UsersRound,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  List,
  Activity,
  MessageSquare,
  Send,
  Settings,
  LogOut,
} from 'lucide-react';
import type { ComponentType } from 'react';

type TodayExam = {
    id: number;
    class_name: string | null;
    section_name: string | null;
    subject_name_en: string | null;
    subject_name_ar: string | null;
    starts_at: string;
    ends_at: string;
    room: string | null;
};

type ExamPeriod = {
    id: number;
    school_id: number;
    school_name: string | null;
    title: string;
    title_ar: string | null;
    starts_on: string;
    ends_on: string;
    papers_count: number;
};

type TodayClass = {
    id: number;
    period: number;
    section_name: string | null;
    subject_name_en: string | null;
    subject_name_ar: string | null;
};

type DashboardProps = {
  locale?: 'ar' | 'en';
  school?: { id: number; name: string };
  metrics?: {
    students?: {
      total: number;
      active: number;
      inactive: number;
      trend: string;
    };
    teachers?: {
      total: number;
      active: number;
      onLeave: number;
      trend: string;
    };
    attendanceToday?: {
      present: number;
      absent: number;
      late: number;
      excused: number;
      presentPercentage: number;
      absentPercentage: number;
      latePercentage: number;
      excusedPercentage: number;
    };
    activeClasses: number;
    pendingAdmissions: number;
    outstandingBalances?: {
      amount: number;
      formatted: string;
    };
    paymentsToday?: {
      amount: number;
      count: number;
      formattedAmount: string;
    };
    upcomingExams?: Array<{
      id: number;
      title: string;
      date: string;
      subject: string;
      class: string;
    }>;
  };
  widgets?: {
    attendanceOverview?: {
      today?: {
        present: number;
        absent: number;
        late: number;
        excused: number;
      };
      weekly?: {
        present: number;
        absent: number;
        late: number;
        excused: number;
      };
    };
    admissionsPipeline?: {
      new: number;
      pending: number;
      accepted: number;
      enrolled: number;
      rejected: number;
    };
    financeSummary?: {
      income?: {
        today: number;
        month: number;
      };
      expenses?: {
        today: number;
        month: number;
      };
      balance: number;
    };
    upcomingExamsList?: Array<{
      id: number;
      title: string;
      date: string;
      subject: string;
      class: string;
    }>;
    todaysTimetable?: Array<{
      time: string;
      subject: string;
      teacher: string;
      room: string;
    }>;
    recentActivity?: Array<{
      type: string;
      description: string;
      time: string;
    }>;
    recentNotices?: Array<{
      id: number;
      title: string;
      created_at: string;
    }>;
    paymentStatus?: {
      successful: number;
      failed: number;
      pending: number;
    };
    outstandingInvoices?: Array<{
      id: number;
      number: string;
      student: string;
      amount: number;
      due_date: string;
      status: string;
    }>;
    notificationActivity?: {
      sentToday: number;
      readToday: number;
      deliveredToday: number;
    };
    quickActions?: Array<{
      title: string;
      href: string;
      icon: string;
    }>;
  };
};

type Icon = ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;

const StatCard = ({
  title,
  value,
  trend,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  trend?: string;
  icon: Icon;
  color: string;
}) => {
  const isArabic = usePage<{ locale?: 'ar' | 'en' }>().props.locale === 'ar';
  return (
    <div className="rounded-xl border border-[#dbe8df] bg-white p-6 shadow-[0_16px_45px_-30px_#17342f]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <icon size={18} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#6c837c]">{title}</p>
            <p className="mt-1 text-2xl font-bold text-[#17342f]">{value}</p>
          </div>
        </div>
        {trend && (
          <p className={`text-xs font-bold ${trend.startsWith('-') ? 'text-[#dc2626]' : 'text-[#059669]'}`}>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
};

const Widget = ({
  title,
  icon,
  color,
  children,
}: {
  title: string;
  icon: Icon;
  color: string;
  children: React.ReactNode;
}) => {
  const isArabic = usePage<{ locale?: 'ar' | 'en' }>().props.locale === 'ar';
  return (
    <div className="rounded-xl border border-[#dbe8df] bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#17342f] flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
            <icon size={16} aria-hidden="true" />
          </div>
          {title}
        </h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default function Dashboard() {
  const { locale = 'ar', school, metrics, widgets } = usePage<DashboardProps>().props;
  const isArabic = locale === 'ar';
  const schoolBase = school ? `/admin/schools/${school.id}` : null;

  return (
    <>
      <Head title={isArabic ? 'لوحة التحكم' : 'Dashboard'} />
      <div className="space-y-8 p-4 md:p-8">
        {/* Header */}
        <header className="flex flex-col gap-4 rounded-[1.75rem] bg-[#143e36] p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-sm font-bold text-[#b7d7c5]">
              {isArabic ? 'نظرة اليوم' : "Today's overview"}
            </p>
            <h1 className="mt-2 text-3xl font-black md:text-4xl">
              {isArabic
                ? 'صباح الخير، أ. نورة'
                : 'Good morning, Administrator'}
            </h1>
            <p className="mt-3 max-w-xl leading-7 text-[#d2e6d8]">
              {isArabic
                ? 'كل ما تحتاجينه لمتابعة يوم المدرسة واتخاذ قرارات أوضح في مكان واحد.'
                : 'Everything you need to run the school day and make clearer decisions in one place.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {schoolBase && (
              <>
                <Link
                  href={`${schoolBase}/academics`}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-black text-[#0d5c4d] transition hover:bg-[#eaf4ec]"
                >
                  {isArabic ? 'فتح الأكاديميات' : 'Open academics'}
                  <ArrowUpLeft size={17} aria-hidden="true" />
                </Link>
                <Link
                  href="/admin/site-content"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#b7d7c5] px-5 py-3 font-black text-white transition hover:bg-white/10"
                >
                  {isArabic ? 'تحرير الموقع العام' : 'Edit public site'}
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Metrics Grid */}
        <section aria-labelledby="metrics-heading">
          <h2 id="metrics-heading" className="sr-only">
            {isArabic ? 'مؤشرات المدرسة' : 'School metrics'}
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
            {/* Students */}
            <StatCard
              title={isArabic ? 'الطلاب' : 'Students'}
              value={metrics?.students?.total ?? 0}
              trend={metrics?.students?.trend}
              icon={UsersRound}
              color="bg:#dcecdf text-[#0d5c4d]"
            />
            {/* Teachers */}
            <StatCard
              title={isArabic ? 'المعلمون' : 'Teachers'}
              value={metrics?.teachers?.total ?? 0}
              trend={metrics?.teachers?.trend}
              icon={Users}
              color="bg:#e9e3f4 text-[#624c8d]"
            />
            {/* Attendance Today */}
            <StatCard
              title={isArabic ? 'الحضور اليوم' : 'Attendance Today'}
              value={`${metrics?.attendanceToday?.present ?? 0} Present`}
              icon={CalendarCheck2}
              color="bg:#f8e4d8 text-[#a5552e]"
            />
            {/* Active Classes */}
            <StatCard
              title={isArabic ? 'الفصول النشطة' : 'Active Classes'}
              value={metrics?.activeClasses ?? 0}
              icon={BookOpenCheck}
              color="bg:#dcecdf text-[#0d5c4d]"
            />
            {/* Pending Admissions */}
            <StatCard
              title={isArabic ? 'طلبات القبول' : 'Pending Admissions'}
              value={metrics?.pendingAdmissions ?? 0}
              icon={List}
              color="bg:#e9e3f4 text-[#624c8d]"
            />
            {/* Outstanding Balances */}
            <StatCard
              title={isArabic ? 'الرصيد المستحق' : 'Outstanding Balance'}
              value={metrics?.outstandingBalances?.formatted ?? '$0'}
              trend={isArabic ? 'مستحق الدفع' : 'Due for payment'}
              icon={WalletCards}
              color="bg:#fce7f3 text:#be185d"
            />
            {/* Payments Today */}
            <StatCard
              title={isArabic ? 'الدفعات اليوم' : 'Payments Today'}
              value={metrics?.paymentsToday?.formattedAmount ?? '$0'}
              icon={DollarSign}
              color="bg:#dcfce7 text:#166534"
            />
            {/* Upcoming Exams */}
            <StatCard
              title={isArabic ? 'الاختبارات القادمة' : 'Upcoming Exams'}
              value={metrics?.upcomingExams?.length ?? 0}
              icon={Clock}
              color="bg:#eff6ff text:#1e40af"
            />
          </div>
        </section>

        {/* Widgets */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          {/* Left Column - Main Widgets */}
          <section className="flex flex-col gap-6">
            {/* Attendance Overview */}
            <Widget
              title={isArabic ? 'نظرة عامة على الحضور' : 'Attendance Overview'}
              icon={CalendarCheck2}
              color="bg:#dcfce7 text:#166534"
            >
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-[#6b7280]">
                      {isArabic ? 'اليوم' : 'Today'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-3 h-3 rounded-full bg-[#16a34a]" />
                      <span className="text-sm font-medium text-[#17342f]">
                        {widgets?.attendanceOverview?.today?.present ?? 0} Present
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-3 h-3 rounded-full bg-[#dc2626]" />
                      <span className="text-sm font-medium text-[#17342f]">
                        {widgets?.attendanceOverview?.today?.absent ?? 0} Absent
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-3 h-3 rounded-full bg-[#d97706]" />
                      <span className="text-sm font-medium text-[#17342f]">
                        {widgets?.attendanceOverview?.today?.late ?? 0} Late
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-3 h-3 rounded-full bg-[#059669]" />
                      <span className="text-sm font-medium text-[#17342f]">
                        {widgets?.attendanceOverview?.today?.excused ?? 0} Excused
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6b7280]">
                      {isArabic ? 'الأسبوعي' : 'Weekly'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-3 h-3 rounded-full bg/#16a34a" />
                      <span className="text-sm font-medium text-[#17342f]">
                        {widgets?.attendanceOverview?.weekly?.present ?? 0} Present
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-3 h-3 rounded-full bg/#dc2626" />
                      <span className="text-sm font-medium text-[#17342f]">
                        {widgets?.attendanceOverview?.weekly?.absent ?? 0} Absent
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-3 h-3 rounded-full bg/#d97706" />
                      <span className="text-sm font-medium text-[#17342f]">
                        {widgets?.attendanceOverview?.weekly?.late ?? 0} Late
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-3 h-3 rounded-full bg/#059669" />
                      <span className="text-sm font-medium text-[#17342f]">
                        {widgets?.attendanceOverview?.weekly?.excused ?? 0} Excused
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Widget>

            {/* Admissions Pipeline */}
            <Widget
              title={isArabic ? 'خط أنابيب القبول' : 'Admissions Pipeline'}
              icon={Users}
              color="bg:#fce7f3 text:#be185d"
            >
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#6b7280]">
                      {isArabic ? 'جديد' : 'New'}
                    </p>
                    <p className="text-2xl font-bold text-[#17342f]">
                      {widgets?.admissionsPipeline?.new ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6b7280]">
                      {isArabic ? 'معلق' : 'Pending'}
                    </p>
                    <p className="text-2xl font-bold text-[#17342f]">
                      {widgets?.admissionsPipeline?.pending ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6b7280]">
                      {isArabic ? 'مقبول' : 'Accepted'}
                    </p>
                    <p className="text-2xl font-bold text-[#17342f]">
                      {widgets?.admissionsPipeline?.accepted ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6b7280]">
                      {isArabic ? 'مسجل' : 'Enrolled'}
                    </p>
                    <p className="text-2xl font-bold text-[#17342f]">
                      {widgets?.admissionsPipeline?.enrolled ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6b7280]">
                      {isArabic ? 'مرفوض' : 'Rejected'}
                    </p>
                    <p className="text-2xl font-bold text-[#17342f]">
                      {widgets?.admissionsPipeline?.rejected ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </Widget>

            {/* Finance Summary */}
            <Widget
              title={isArabic ? 'ملخص مالي' : 'Finance Summary'}
              icon={BarChart3}
              color="bg:#fef3c7 text:#92400e"
            >
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-[#6b7280]">
                      {isArabic ? 'الإيرادات' : 'Income'}
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#17342f]">
                        {isArabic ? 'اليوم' : 'Today'}
                      </p>
                      <p className="text-lg font-bold text-[#92400e]">
                        ${widgets?.financeSummary?.income?.today ?? 0}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#17342f]">
                        {isArabic ? 'الشهر' : 'Month'}
                      </p>
                      <p className="text-lg font-bold text-[#92400e]">
                        ${widgets?.financeSummary?.income?.month ?? 0}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#6b7280]">
                      {isArabic ? 'المصروفات' : 'Expenses'}
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#17342f]">
                        {isArabic ? 'اليوم' : 'Today'}
                      </p>
                      <p className="text-lg font-bold text-[#92400e]">
                        ${widgets?.financeSummary?.expenses?.today ?? 0}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[#17342f]">
                        {isArabic ? 'الشهر' : 'Month'}
                      </p>
                      <p className="text-lg font-bold text-[#92400e]">
                        ${widgets?.financeSummary?.expenses?.month ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-[#f3f4f6]">
                  <p className="text-sm font-medium text-[#6b7280]">
                    {isArabic ? 'الرصيد' : 'Balance'}
                  </p>
                  <p className="text-2xl font-bold text-[#17342f]">
                    ${widgets?.financeSummary?.balance ?? 0}
                  </p>
                </div>
              </div>
            </Widget>

            {/* Today's Timetable */}
            <Widget
              title={isArabic ? 'جدول اليوم' : 'Today\'s Timetable'}
              icon={Clock}
              color="bg:#ede9fe text:#6d28d9"
            >
              {widgets?.todaysTimetable && widgets?.todaysTimetable.length > 0 ? (
                <div className="space-y-3">
                  {widgets.todaysTimetable.map((period, index) => (
                    <div key={index} className="border border-[#e5e7eb] rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[#6b7280]">{period.time}</p>
                          <p className="text-lg font-bold text-[#17342f]">{period.subject}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-[#6b7280]">
                            {period.teacher}
                          </p>
                          <p className="text-sm font-medium text-[#6b7280]">
                            {period.room}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                </div>
              ) : (
                <p className="text-center text-[#6b7280] py-8">
                  {isArabic ? 'لا توجد حصص مقررة اليوم' : 'No classes scheduled today'}
                </p>
              )}
            </Widget>
          </section>

          {/* Right Column - Secondary Widgets */}
          <section className="flex flex-col gap-6">
            {/* Recent Activity */}
            <Widget
              title={isArabic ? 'النشاط الأخير' : 'Recent Activity'}
              icon={Activity}
              color="bg:#fff7ed text:#c2410c"
            >
              {widgets?.recentActivity && widgets?.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {widgets.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border border-[#f3f4f6] rounded-lg">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#fed7aa]">
                        <Activity size={16} aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#17342f]">
                          {activity.description}
                        </p>
                        <p className="text-xs text-[#6b7280]">{activity.time}</p>
                      </div>
                    </div>
                  ))
                </div>
              ) : (
                <p className="text-center text-[#6b7280] py-8">
                  {isArabic ? 'لا نشاط حديث' : 'No recent activity'}
                </p>
              )}
            </Widget>

            {/* Recent Notices */}
            <Widget
              title={isArabic ? 'الإعلانات الأخيرة' : 'Recent Notices'}
              icon={Megaphone}
              color="bg:#f0f9ff text:#0284c7"
            >
              {widgets?.recentNotices && widgets?.recentNotices.length > 0 ? (
                <div className="space-y-3">
                  {widgets.recentNotices.map((notice, index) => (
                    <div key={notice.id} className="p-3 border border-[#f3f4f6] rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-lg font-bold text-[#17342f]">
                            {notice.title}
                          </p>
                        </div>
                        <div className="text-right text-xs text-[#6b7280]">
                          {notice.created_at}
                        </div>
                      </div>
                    </div>
                  ))
                </div>
              ) : (
                <p className="text-center text-[#6b7280] py-8">
                  {isArabic ? 'لا إعلانات حديثة' : 'No recent notices'}
                </p>
              )}
            </Widget>

            {/* Payment Status */}
            <Widget
              title={isArabic ? 'حالة الدفعات' : 'Payment Status'}
              icon={CreditCard}
              color="bg:#f0fdf4 text:#166534"
            >
              <div className="grid gap-4">
                <div>
                  <p className="text-sm font-medium text-[#6b7280]">
                    {isArabic ? 'ناجح' : 'Successful'}
                  </p>
                  <p className="text-2xl font-bold text-[#17342f]">
                    {widgets?.paymentStatus?.successful ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#6b7280]">
                    {isArabic ? 'فاشل' : 'Failed'}
                  </p>
                  <p className="text-2xl font-bold text-[#17342f]">
                    {widgets?.paymentStatus?.failed ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#6b7280]">
                    {isArabic ? 'معلق' : 'Pending'}
                  </p>
                  <p className="text-2xl font-bold text-[#17342f]">
                    {widgets?.paymentStatus?.pending ?? 0}
                  </p>
                </div>
              </div>
            </Widget>

            {/* Outstanding Invoices */}
            <Widget
              title={isArabic ? 'الفواتير المستحقة' : 'Outstanding Invoices'}
              icon={FileText}
              color="bg:#fefce8 text:#854d0e"
            >
              {widgets?.outstandingInvoices && widgets?.outstandingInvoices.length > 0 ? (
                <div className="space-y-3">
                  {widgets.outstandingInvoices.map((invoice, index) => (
                    <div key={invoice.id} className="border border-[#e5e7eb] rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#6b7280]">
                            #{invoice.number}
                          </p>
                          <p className="text-lg font-bold text-[#17342f] truncate max-w-xs">
                            {invoice.student}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-medium text-[#17342f]">
                            ${invoice.amount}
                          </p>
                          <p className="text-xs text-[#6b7280]">
                            {invoice.due_date}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                </div>
              ) : (
                <p className="text-center text-[#6b7280] py-8">
                  {isArabic ? 'لا فواتير مستحقة' : 'No outstanding invoices'}
                </p>
              )}
            </Widget>

            {/* Notification Activity */}
            <Widget
              title={isArabic ? 'نشاط الإشعارات' : 'Notification Activity'}
              icon={Bell}
              color="bg:#faf5ff text:#6d28d9"
            >
              <div className="grid gap-4">
                <div>
                  <p className="text-sm font-medium text-[#6b7280]">
                    {isArabic ? 'مرسل اليوم' : 'Sent Today'}
                  </p>
                  <p className="text-2xl font-bold text-[#17342f]">
                    {widgets?.notificationActivity?.sentToday ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#6b7280]">
                    {isArabic ? 'مقروء اليوم' : 'Read Today'}
                  </p>
                  <p className="text-2xl font-bold text-[#17342f]">
                    {widgets?.notificationActivity?.readToday ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#6b7280]">
                    {isArabic ? 'تم التسليم اليوم' : 'Delivered Today'}
                  </p>
                  <p className="text-2xl font-bold text-[#17342f]">
                    {widgets?.notificationActivity?.deliveredToday ?? 0}
                  </p>
                </div>
              </div>
            </Widget>

            {/* Quick Actions */}
            <Widget
              title={isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
              icon={Settings}
              color="bg:#fdf4ff text:#6d28d9"
            >
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {widgets?.quickActions?.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className="flex flex-col items-center justify-center p-4 border border-[#e5e7eb] rounded-lg hover:border-[#0d5c4d] hover:bg-[#f8fafc] transition-colors"
                  >
                    <div className="flex items-center justify-center w-10 h-10 mb-2 rounded-xl bg-[#f0f9ff]">
                      {action.icon === 'Users' && (
                        <Users size={18} aria-hidden="true" />
                      )}
                      {action.icon === 'ClipboardList' && (
                        <List size={18} aria-hidden="true" />
                      )}
                      {action.icon === 'CreditCard' && (
                        <CreditCard size={18} aria-hidden="true" />
                      )}
                      {action.icon === 'Megaphone' && (
                        <Megaphone size={18} aria-hidden="true" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-[#17342f]">{action.title}</p>
                  </div>
                ))}
              </div>
            </Widget>
          </section>
        </div>
      </div>
    </>
  );
}

Dashboard.layout = {
  breadcrumbs: [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
  ],
};