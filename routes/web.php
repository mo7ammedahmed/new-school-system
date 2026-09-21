<?php

use App\Http\Controllers\AcademicAdminController;
use App\Http\Controllers\AdmissionsController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AttendanceReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeliveryMonitoringController;
use App\Http\Controllers\ExamPaperController;
use App\Http\Controllers\ExamScheduleController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\FinanceReconciliationController;
use App\Http\Controllers\FinanceReportController;
use App\Http\Controllers\GuardianPortalController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\NoticeAdminController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PageAdminController;
use App\Http\Controllers\PublicSchoolController;
use App\Http\Controllers\ReceiptDownloadController;
use App\Http\Controllers\ReportCardDownloadController;
use App\Http\Controllers\ScheduleSetupController;
use App\Http\Controllers\SiteContentController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherPortalController;
use App\Http\Controllers\TimetableController;
use App\Http\Controllers\UserController;
use App\Models\Media;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

Route::inertia('/', 'public/home')->name('home');
Route::inertia('/about', 'public/about')->name('public.about');
Route::inertia('/features', 'public/features')->name('public.features');
Route::inertia('/pricing', 'public/pricing')->name('public.pricing');
Route::inertia('/faq', 'public/faq')->name('public.faq');
Route::inertia('/security', 'public/security')->name('public.security');
Route::inertia('/privacy', 'public/privacy')->name('public.privacy');
Route::inertia('/terms', 'public/terms')->name('public.terms');
Route::inertia('/contact', 'public/contact')->name('public.contact');
Route::get('/robots.txt', fn () => response("User-agent: *\nAllow: /\nSitemap: ".url('/sitemap.xml'), 200, ['Content-Type' => 'text/plain']))->name('public.robots');
Route::get('/sitemap.xml', fn () => response()->view('sitemap', ['urls' => ['/', '/about', '/features', '/pricing', '/faq', '/security', '/privacy', '/terms', '/contact']])->header('Content-Type', 'application/xml'))->name('public.sitemap');
Route::get('health/ready', HealthController::class)->name('health.ready');
Route::get('schools/{organization:slug}/{school}/apply', [AdmissionsController::class, 'create'])->name('public.admissions.create');
Route::post('schools/{organization:slug}/{school}/apply', [AdmissionsController::class, 'store'])->middleware('throttle:10,1')->name('public.admissions.store');
Route::post('webhooks/stripe', StripeWebhookController::class)->middleware('throttle:stripe-webhook')->withoutMiddleware([ValidateCsrfToken::class])->name('webhooks.stripe');
Route::get('schools/{organization:slug}/{school}/{page?}', [PublicSchoolController::class, 'show'])
    ->where('page', '[A-Za-z0-9-]+')
    ->name('public.school');

Route::middleware(['auth', 'verified', 'tenant'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('admin/site-content', [SiteContentController::class, 'index'])->name('admin.site-content.index');
    Route::post('admin/site-content', [SiteContentController::class, 'upsert'])->name('admin.site-content.upsert');
    // Single canonical route: the student record page already contains the report card.
    Route::get('portal/students/{student}', [StudentController::class, 'show'])->name('students.show');
    Route::post('portal/students/{student}/report-card/snapshots', [StudentController::class, 'issueSnapshot'])->name('students.report-card.issue');
    Route::get('portal/report-card-snapshots/{snapshot}/download', ReportCardDownloadController::class)->name('students.report-card.download');
    Route::get('portal/guardian', [GuardianPortalController::class, 'index'])->name('guardian.portal');
    Route::post('portal/installments/{installment}/payment-intents', [GuardianPortalController::class, 'createPaymentIntent'])->name('guardian.payment-intents.store');
    Route::get('portal/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('portal/notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');
    Route::patch('portal/notifications/preferences/{category}', [NotificationController::class, 'updatePreference'])->name('notifications.preferences.update');
    Route::get('admin/notifications/deliveries', [DeliveryMonitoringController::class, 'index'])->name('admin.notifications.deliveries');
    Route::post('admin/notifications/deliveries/{delivery}/resend', [DeliveryMonitoringController::class, 'resend'])->name('admin.notifications.deliveries.resend');
    Route::get('portal/teacher', [TeacherPortalController::class, 'index'])->name('teacher.portal');
    Route::post('portal/sections/{section}/attendance', [AttendanceController::class, 'store'])->name('attendance.store');
    Route::patch('portal/attendance/{record}', [AttendanceController::class, 'update'])->name('attendance.update');
    Route::post('portal/sections/{section}/assessments', [AssessmentController::class, 'store'])->name('assessments.store');
    Route::get('admin/schools/{school}/reports/attendance', [AttendanceReportController::class, 'index'])->name('admin.reports.attendance');
    Route::get('admin/schools/{school}/reports/attendance.csv', [AttendanceReportController::class, 'export'])->name('admin.reports.attendance.export');
    Route::get('admin/schools/{school}/finance', [FinanceController::class, 'index'])->name('admin.finance.index');
    Route::get('admin/schools/{school}/reports/finance', [FinanceReportController::class, 'outstanding'])->name('admin.reports.finance');
    Route::get('admin/schools/{school}/reports/finance.csv', [FinanceReportController::class, 'export'])->name('admin.reports.finance.export');
    Route::post('admin/schools/{school}/finance/fees', [FinanceController::class, 'storeFee'])->name('admin.finance.fees.store');
    Route::post('admin/schools/{school}/finance/invoices', [FinanceController::class, 'storeInvoice'])->name('admin.finance.invoices.store');
    Route::post('admin/payment-intents/{paymentIntent}/retry', [FinanceReconciliationController::class, 'retry'])->name('admin.finance.payment-intents.retry');
    Route::post('admin/installments/{installment}/manual-payment', [FinanceReconciliationController::class, 'manualMatch'])->name('admin.finance.installments.manual-payment');

    // Academic years - keeping existing route names for backward compatibility
    Route::prefix('admin/schools/{school}/academic-years')->name('academic-years.')->group(function () {
        Route::get('/', [AcademicYearController::class, 'index'])->name('index');
        Route::get('/create', [AcademicYearController::class, 'create'])->name('create');
        Route::post('/', [AcademicYearController::class, 'store'])->name('store');
        Route::get('/{academicYear}/edit', [AcademicYearController::class, 'edit'])->name('edit');
        Route::put('/{academicYear}', [AcademicYearController::class, 'update'])->name('update');
        Route::delete('/{academicYear}', [AcademicYearController::class, 'destroy'])->name('destroy');
        Route::get('/{academicYear}', [AcademicYearController::class, 'show'])->name('show');
    });

    // Academic classes - keeping existing route names for backward compatibility
    Route::prefix('admin/schools/{school}/academic-classes')->name('academic-classes.')->group(function () {
        Route::get('/', [AcademicClassController::class, 'index'])->name('index');
        Route::get('/create', [AcademicClassController::class, 'create'])->name('create');
        Route::post('/', [AcademicClassController::class, 'store'])->name('store');
        Route::get('/{academicClass}/edit', [AcademicClassController::class, 'edit'])->name('edit');
        Route::put('/{academicClass}', [AcademicClassController::class, 'update'])->name('update');
        Route::delete('/{academicClass}', [AcademicClassController::class, 'destroy'])->name('destroy');
        Route::get('/{academicClass}', [AcademicClassController::class, 'show'])->name('show');
    });

    // Sections - keeping existing route names for backward compatibility
    Route::prefix('admin/schools/{school}/sections')->name('sections.')->group(function () {
        Route::get('/', [SectionController::class, 'index'])->name('index');
        Route::get('/create', [SectionController::class, 'create'])->name('create');
        Route::post('/', [SectionController::class, 'store'])->name('store');
        Route::get('/{section}/edit', [SectionController::class, 'edit'])->name('edit');
        Route::put('/{section}', [SectionController::class, 'update'])->name('update');
        Route::delete('/{section}', [SectionController::class, 'destroy'])->name('destroy');
        Route::get('/{section}', [SectionController::class, 'show'])->name('show');
    });

    // Enrollments - keeping existing route names for backward compatibility
    Route::prefix('admin/schools/{school}/enrollments')->name('enrollments.')->group(function () {
        Route::get('/', [EnrollmentController::class, 'index'])->name('index');
        Route::get('/create', [EnrollmentController::class, 'create'])->name('create');
        Route::post('/', [EnrollmentController::class, 'store'])->name('store');
        Route::get('/{enrollment}/edit', [EnrollmentController::class, 'edit'])->name('edit');
        Route::put('/{enrollment}', [EnrollmentController::class, 'update'])->name('update');
        Route::delete('/{enrollment}', [EnrollmentController::class, 'destroy'])->name('destroy');
        Route::get('/{enrollment}', [EnrollmentController::class, 'show'])->name('show');
    });

    // Teacher assignments - keeping existing route names for backward compatibility
    Route::prefix('admin/schools/{school}/teacher-assignments')->name('teacher-assignments.')->group(function () {
        Route::get('/', [TeacherAssignmentController::class, 'index'])->name('index');
        Route::get('/create', [TeacherAssignmentController::class, 'create'])->name('create');
        Route::post('/', [TeacherAssignmentController::class, 'store'])->name('store');
        Route::get('/{teacherAssignment}/edit', [TeacherAssignmentController::class, 'edit'])->name('edit');
        Route::put('/{teacherAssignment}', [TeacherAssignmentController::class, 'update'])->name('update');
        Route::delete('/{teacherAssignment}', [TeacherAssignmentController::class, 'destroy'])->name('destroy');
        Route::get('/{teacherAssignment}', [TeacherAssignmentController::class, 'show'])->name('show');
    });

    // Guardians - keeping existing route names for backward compatibility
    Route::prefix('admin/schools/{school}/guardians')->name('guardians.')->group(function () {
        Route::get('/', [GuardianController::class, 'index'])->name('index');
        Route::get('/create', [GuardianController::class, 'create'])->name('create');
        Route::post('/', [GuardianController::class, 'store'])->name('store');
        Route::get('/{guardian}/edit', [GuardianController::class, 'edit'])->name('edit');
        Route::put('/{guardian}', [GuardianController::class, 'update'])->name('update');
        Route::delete('/{guardian}', [GuardianController::class, 'destroy'])->name('destroy');
        Route::get('/{guardian}', [GuardianController::class, 'show'])->name('show');
    });

    // Users - keeping existing route names for backward compatibility
    Route::prefix('admin/schools/{school}/users')->name('users.')->group(function () {
        Route::get('/', [UserController::class, 'index'])->name('index');
        Route::get('/create', [UserController::class, 'create'])->name('create');
        Route::post('/', [UserController::class, 'store'])->name('store');
        Route::get('/{user}/edit', [UserController::class, 'edit'])->name('edit');
        Route::put('/{user}', [UserController::class, 'update'])->name('update');
        Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
        Route::get('/{user}', [UserController::class, 'show'])->name('show');
    });

    // Backward compatibility routes for existing academic admin endpoints
    Route::prefix('admin/schools/{school}/academics')->name('admin.academics.')->group(function () {
        Route::get('/', [AcademicAdminController::class, 'index'])->name('index');
        Route::post('years', [AcademicYearController::class, 'store'])->name('years.store');
        Route::post('classes', [AcademicClassController::class, 'store'])->name('classes.store');
        Route::post('sections', [SectionController::class, 'store'])->name('sections.store');
        Route::post('enrollments', [EnrollmentController::class, 'store'])->name('enrollments.store');
        Route::post('teacher-assignments', [TeacherAssignmentController::class, 'store'])->name('teacher-assignments.store');
    });

    Route::prefix('admin/schools/{school}/pages')->name('admin.pages.')->group(function () {
        Route::get('/', [PageAdminController::class, 'index'])->name('index');
        Route::post('/', [PageAdminController::class, 'store'])->name('store');
        Route::put('{page}', [PageAdminController::class, 'update'])->name('update');
        Route::post('{page}/publish', [PageAdminController::class, 'publish'])->name('publish');
    });

    Route::prefix('admin/schools/{school}/notices')->name('admin.notices.')->group(function () {
        Route::get('/', [NoticeAdminController::class, 'index'])->name('index');
        Route::post('/', [NoticeAdminController::class, 'store'])->name('store');
        Route::post('{notice}/publish', [NoticeAdminController::class, 'publish'])->name('publish');
    });

    Route::prefix('admin/schools/{school}/applications')->name('admin.admissions.')->group(function () {
        Route::get('/', [AdmissionsController::class, 'index'])->name('index');
        Route::patch('{application}/status', [AdmissionsController::class, 'updateStatus'])->name('status');
        Route::post('{application}/accept', [AdmissionsController::class, 'accept'])->name('accept');
        Route::post('{application}/enroll', [AdmissionsController::class, 'enroll'])->name('enroll');
    });

    Route::prefix('admin/schools/{school}/schedule')->name('admin.schedule.')->group(function () {
        Route::get('setup', [ScheduleSetupController::class, 'index'])->name('setup.index');
        Route::post('setup/subjects', [ScheduleSetupController::class, 'storeSubject'])->name('setup.subjects.store');
        Route::put('setup/subjects/{subject}', [ScheduleSetupController::class, 'updateSubject'])->name('setup.subjects.update');
        Route::post('setup/subjects/{subject}/deactivate', [ScheduleSetupController::class, 'deactivateSubject'])->name('setup.subjects.deactivate');

        Route::get('timetable', [TimetableController::class, 'index'])->name('timetable.index');
        Route::get('timetable/create', [TimetableController::class, 'create'])->name('timetable.create');
        Route::post('timetable', [TimetableController::class, 'store'])->name('timetable.store');
        Route::get('timetable/{version}/edit', [TimetableController::class, 'edit'])->name('timetable.edit');
        Route::post('timetable/{version}/entries', [TimetableController::class, 'updateEntries'])->name('timetable.entries');
        Route::post('timetable/{version}/publish', [TimetableController::class, 'publish'])->name('timetable.publish');
        Route::delete('timetable/{version}', [TimetableController::class, 'destroy'])->name('timetable.destroy');

        Route::get('exams', [ExamScheduleController::class, 'index'])->name('exams.index');
        Route::post('exams', [ExamScheduleController::class, 'store'])->name('exams.store');
        Route::get('exams/{examSchedule}', [ExamScheduleController::class, 'show'])->name('exams.show');
        Route::put('exams/{examSchedule}', [ExamScheduleController::class, 'update'])->name('exams.update');
        Route::delete('exams/{examSchedule}', [ExamScheduleController::class, 'destroy'])->name('exams.destroy');
        Route::post('exams/{examSchedule}/publish', [ExamScheduleController::class, 'publish'])->name('exams.publish');
        Route::post('exams/{examSchedule}/archive', [ExamScheduleController::class, 'archive'])->name('exams.archive');

        Route::post('exams/{examSchedule}/papers', [ExamPaperController::class, 'store'])->name('exams.papers.store');
        Route::post('exams/{examSchedule}/papers/bulk', [ExamPaperController::class, 'storeBulk'])->name('exams.papers.bulk');
        Route::patch('exam-papers/{examPaper}', [ExamPaperController::class, 'update'])->name('exam-papers.update');
        Route::delete('exam-papers/{examPaper}', [ExamPaperController::class, 'destroy'])->name('exam-papers.destroy');
        Route::post('exam-papers/{examPaper}/invigilators', [ExamPaperController::class, 'storeInvigilator'])->name('exam-papers.invigilators.store');
        Route::delete('exam-papers/{examPaper}/invigilators/{teacher}', [ExamPaperController::class, 'destroyInvigilator'])->name('exam-papers.invigilators.destroy');
    });

    Route::get('media/{media}/download', function (int $media) {
        $file = Media::query()->findOrFail($media);

        return Storage::disk($file->disk)->download(
            $file->path,
            $file->original_name,
            array_filter(['Content-Type' => $file->mime_type]),
        );
    })->middleware('signed')->name('media.download');
});

require __DIR__.'/settings.php';