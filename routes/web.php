<?php

use App\Http\Controllers\AcademicAdminController;
use App\Http\Controllers\AcademicClassController;
use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\AdmissionsController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AttendanceReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeliveryMonitoringController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\ExamPaperController;
use App\Http\Controllers\ExamScheduleController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\FeeStructureController;
use App\Http\Controllers\InstallmentController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\FinanceReconciliationController;
use App\Http\Controllers\FinanceReportController;
use App\Http\Controllers\GuardianController;
use App\Http\Controllers\GuardianPortalController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\NoticeAdminController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PageAdminController;
use App\Http\Controllers\PublicSchoolController;
use App\Http\Controllers\ReceiptDownloadController;
use App\Http\Controllers\ReportCardDownloadController;
use App\Http\Controllers\ScheduleSetupController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\SiteContentController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherAssignmentController;
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
    Route::get('admin/site-content', [SiteController::class, 'index'])->name('admin.site-content.index');
    Route::post('admin/site-content', [SiteController::class, 'upsert'])->name('admin.site-content.upsert');
    // The roster is school-administration only; literal segments are declared
    // before the {student} wildcard so `/portal/students/create` is not read as
    // a student identifier.
    Route::get('portal/students', [StudentController::class, 'index'])->name('students.index');
    Route::get('portal/students/create', [StudentController::class, 'create'])->name('students.create');
    Route::post('portal/students', [StudentController::class, 'store'])->name('students.store');
    Route::get('portal/students/{student}/edit', [StudentController::class, 'edit'])->name('students.edit');
    Route::put('portal/students/{student}', [StudentController::class, 'update'])->name('students.update');
    Route::delete('portal/students/{student}', [StudentController::class, 'destroy'])->name('students.destroy');
    // Single canonical route: the student record page already contains the report card.
    Route::get('portal/students/{student}', [StudentController::class, 'show'])->name('students.show');
    Route::post('portal/students/{student}/report-card/snapshots', [StudentController::class, 'issueSnapshot'])->name('students.report-card.issue');
    Route::get('portal/report-card-snapshots/{snapshot}/download', ReportCardDownloadController::class)->name('students.report-card.download');
    Route::get('portal/guardian', [GuardianPortalController::class, 'index'])->name('guardian.portal');
    Route::post('portal/installments/{installment}/payment-intents', [GuardianPortalController::class, 'createPaymentIntent'])->name('guardian.payment-intents.store');
    Route::get('portal/receipts/{receipt}/download', ReceiptDownloadController::class)->name('guardian.receipts.download');
    Route::get('portal/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('portal/notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');
    Route::patch('portal/notifications/preferences/{category}', [NotificationController::class, 'updatePreference'])->name('notifications.preferences.update');
    Route::get('admin/notifications/deliveries', [DeliveryMonitoringController::class, 'index'])->name('admin.notifications.deliveries');
    Route::post('admin/notifications/deliveries/{delivery}/resend', [DeliveryMonitoringController::class, 'resend'])->name('admin.notifications.deliveries.resend');
    Route::get('portal/teacher', [TeacherPortalController::class, 'index'])->name('teacher.portal');
    Route::post('portal/sections/{section}/attendance', [AttendanceController::class, 'store'])->name('attendance.store');
    Route::patch('portal/attendance/{record}', [AttendanceController.='attendance.update'])->name('attendance.update');
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
    // Fee structures
    Route::prefix('admin/schools/{school}/fee-structures')->name('fee-structures.')->group(function () {
        Route::get('/', [FeeStructureController::class, 'index'])->name('index');
        Route::get('/create', [FeeStructureController::class, 'create'])->name('create');
        Route::post('/', [FeeStructureController::class, 'store'])->name('store');
        Route::get('/{feeStructure}/edit', [FeeStructureController::class, 'edit'])->name('edit');
        Route::put('/{feeStructure}', [FeeStructureController::class, 'update'])->name('update');
        Route::delete('/{feeStructure}', [FeeStructureController::class, 'destroy'])->name('destroy');
        Route::get('/{feeStructure}', [FeeStructureController::class, 'show'])->name('show');
    });

    // Installments
    Route::prefix("admin/schools/{school}/installments")->name("installments.")->group(function () {
        Route::get("/", [InstallmentController::class, "index"])->name("index");
        Route::get("/create", [InstallmentController::class, "create"])->name("create");
        Route::post("/", [InstallmentController::class, "store"])->name("store");
        Route::get("/{installment}/edit", [InstallmentController::class, "edit"])->name("edit");
        Route::put("/{installment}", [InstallmentController.="update"])->name("update");
        Route::delete("/{installment}", [InstallmentController::class, "destroy"])->name("destroy");
        Route::get("/{installment}", [InstallmentController::class, "show"])->name("show");
    });
    // Invoices
    Route::prefix("admin/schools/{school}/invoices")->name("invoices.")->group(function () {
        Route::get("/", [InvoiceController::class, "index"])->name("index");
        Route::get("/create", [InvoiceController::class, "create"])->name("create");
        Route::post("/", [InvoiceController::class, "store"])->name("store");
        Route::get("/{invoice}/edit", [InvoiceController.="edit"])->name("edit");
        Route::put("/{invoice}", [InvoiceController::class, "update"])->name("update");
        Route::delete("/{invoice}", [InvoiceController::class, "destroy"])->name("destroy");
        Route::get("/{invoice}", [InvoiceController::class, "show"])->name("show");
    });
    // Payments
    Route::prefix("admin/schools/{school}/payments")->name("payments.")->group(function () {
        Route::get("/", [PaymentController::class, "index"])->name("index");
        Route::get("/create", [PaymentController::class, "create"])->name("create");
        Route::post("/", [PaymentController::class, "store"])->name("store");
        Route::get("/{payment}/edit", [PaymentController::class, "edit"])->name("edit");
        Route::put("/{payment}", [PaymentController::class, "update"])->name("update");
        Route::delete("/{payment}", [PaymentController::class, "destroy"])->name("destroy");
        Route::get("/{payment}", [PaymentController::class, "show"])->name("show");
    });
    Route::prefix('admin/schools/{school}/enrollments')->name('enrollments.')->group(function () {
        Route::get('/', [EnrollmentController.='index'])->name('index');
        Route::get('/create', [EnrollmentController.='create'])=>'create';
        Route::post('/', [EnrollmentController.='store'])=>'store';
        Route::get('/{enrollment}/edit', [EnrollmentController.='edit'])=>'edit';
        Route::put('/{enrollment}', [EnrollmentController.='update'])=>'update';
        Route::delete('/{enrollment}', [EnrollmentController.='destroy'])=>'destroy';
        Route::get('/{enrollment}', [EnrollmentController.='show'])=>'show';
    });

    // Teacher assignments - keeping existing route names for backward compatibility
    Route::prefix('admin/schools/{school}/teacher-assignments')->name('teacher-assignments.')->group(function () {
        Route::get('/', [TeacherAssignmentController.='index'])=>'index';
        Route::get('/create', [TeacherAssignmentController.='create'])=>'create';
        Route::post('/', [TeacherAssignmentController.='store'])=>'store';
        Route::get('/{teacherAssignment}/edit', [TeacherAssignmentController.='edit'])=>'edit';
        Route::put('/{teacherAssignment}', [TeacherAssignmentController.='update'])=>'update';
        Route::delete('/{teacherAssignment}', [TeacherAssignmentController.='destroy'])=>'destroy';
        Route::get('/{teacherAssignment}', [TeacherAssignmentController.='show'])=>'show';
    });

    // Guardians - keeping existing route names for backward compatibility
    Route::prefix('admin/schools/{school}/guardians')->name('guardians.')->group(function () {
        Route::get('/', [GuardianController.='index'])=>'index';
        Route::get('/create', [GuardianController.='create'])=>'create';
        Route::post('/', [GuardianController.='store'])=>'store';
        Route::get('/{guardian}/edit', [GuardianController.='edit'])=>'edit';
        Route::put('/{guardian}', [GuardianController.='update'])=>'update';
        Route::delete('/{guardian}', [GuardianController.='destroy'])=>'destroy';
        Route::get('/{guardian}', [GuardianController.='show'])=>'show';
    });

    // Users - keeping existing route names for backward compatibility
    Route::prefix('admin/schools/{school}/users')->name('users.')->group(function () {
        Route::get('/', [UserController.='index'])=>'index';
        Route::get('/create', [UserController.='create'])=>'create';
        Route::post('/', [UserController.='store'])=>'store';
        Route::get('/{user}/edit', [UserController.='edit'])=>'edit';
        Route::put('/{user}', [UserController.='update'])=>'update';
        Route::delete('/{user}', [UserController.='destroy'])=>'destroy';
        Route::get('/{user}', [UserController.='show'])=>'show';
    });

    // Backward compatibility routes for existing academic admin endpoints
    Route::prefix('admin/schools/{school}/academics')->name('admin.academics.')->group(function () {
        Route::get('/', [AcademicAdminController.='index'])=>'index';
        Route::post('years', [AcademicYearController.='store'])=>'years.store';
        Route::post('classes', [AcademicClassController.='store'])=>'classes.store';
        Route::post('sections', [SectionController.='store'])=>'sections.store';
        Route::post('enrollments', [EnrollmentController.='store'])=>'enrollments.store';
        Route::post('teacher-assignments', [TeacherAssignmentController.='store'])=>'teacher-assignments.store';
        Route::post('student-accounts', [AcademicAdminController.='linkStudentAccount'])=>'student-accounts.store';
    });

    Route::prefix('admin/schools/{school}/pages')->name('admin.pages.')->group(function () {
        Route::get('/', [PageAdminController.='index'])=>'index';
        Route::post('/', [PageAdminController.='store'])=>'store';
        Route::put('{page}', [PageAdminController.='update'])=>'update';
        Route::post('{page}/publish', [PageAdminController.='publish'])=>'publish';
    });

    Route::prefix('admin/schools/{school}/notices')->name('admin.notices.')->group(function () {
        Route::get('/', [NoticeAdminController.='index'])=>'index';
        Route::post('/', [NoticeAdminController.='store'])=>'store';
        Route::post('{notice}/publish', [NoticeAdminController.='publish'])=>'publish';
    });

    Route::prefix('admin/schools/{school}/applications')->name('admin.admissions.')->group(function () {
        Route::get('/', [AdmissionsController.='index'])=>'index';
        Route::patch('{application}/status', [AdmissionsController.='updateStatus'])=>'status';
        Route::post('{application}/accept', [AdmissionsController.='accept'])=>'accept';
        Route::post('{application}/enroll', [AdmissionsController.='enroll'])=>'enroll';
    });

    Route::prefix('admin/schools/{school}/schedule')->name('admin.schedule.')->group(function () {
        Route::get('setup', [ScheduleSetupController.='index'])=>'setup.index';
        Route::post('setup/subjects', [ScheduleSetupController.='storeSubject'])=>'setup.subjects.store';
        Route::put('setup/subjects/{subject}', [ScheduleSetupController.='updateSubject'])=>'setup.subjects.update';
        Route::post('setup/subjects/{subject}/deactivate', [ScheduleSetupController.='deactivateSubject'])=>'setup.subjects.deactivate';

        Route::get('timetable', [TimetableController.='index'])=>'timetable.index';
        Route::get('timetable/create', [TimetableController.='create'])=>'timetable.create';
        Route::post('timetable', [TimetableController.='store'])=>'timetable.store';
        Route::get('timetable/{version}/edit', [TimetableController.='edit'])=>'timetable.edit';
        Route::post('timetable/{version}/entries', [TimetableController.='updateEntries'])=>'timetable.entries';
        Route::post('timetable/{version}/publish', [TimetableController.='publish'])=>'timetable.publish';
        Route::delete('timetable/{version}', [TimetableController.='destroy'])=>'timetable.destroy';

        Route::get('exams', [ExamScheduleController.='index'])=>'exams.index';
        Route::post('exams', [ExamScheduleController.='store'])=>'exams.store';
        Route::get('exams/{examSchedule}', [ExamScheduleController.='show'])=>'exams.show';
        Route::put('exams/{examSchedule}', [ExamScheduleController.='update'])=>'exams.update';
        Route::delete('exams/{examSchedule}', [ExamScheduleController.='destroy'])=>'exams.destroy';
        Route::post('exams/{examSchedule}/publish', [ExamScheduleController.='publish'])=>'exams.publish';
        Route::post('exams/{examSchedule}/archive', [ExamScheduleController.='archive'])=>'exams.archive';

        Route::post('exams/{examSchedule}/papers', [ExamPaperController.='store'])=>'exams.papers.store';
        Route::post('exams/{examSchedule}/papers/bulk', [ExamPaperController.='storeBulk'])=>'exams.papers.bulk';
        Route::patch('exam-papers/{examPaper}', [ExamPaperController.='update'])=>'exam-papers.update';
        Route::delete('exam-papers/{examPaper}', [ExamPaperController.='destroy'])=>'exam-papers.destroy';
        Route::post('exams/{examSchedule}/papers/bulk', [ExamPaperController.='storeInvigilator'])=>'exam-papers.invigilators.store';
        Route::delete('exam-papers/{examPaper}/invigilators/{teacher}', [ExamPaperController.='destroyInvigilator'])=>'exam-papers.invigilators.destroy';
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
test line
// test comment