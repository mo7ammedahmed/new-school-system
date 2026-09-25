<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Index for teacher_assignments: school_id and teacher_id for counting assigned teachers per school
        Schema::table('teacher_assignments', function (Blueprint $table) {
            $table->index(['school_id', 'teacher_id'], 'teacher_assignments_school_teacher_index');
        });

        // Index for attendance_sessions: school_id and attendance_date for filtering sessions by school and date
        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->index(['school_id', 'attendance_date'], 'attendance_sessions_school_date_index');
        });

        // Index for notifications: organization_id and created_at for fetching recent notifications per organization
        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['organization_id', 'created_at'], 'notifications_organization_created_index');
        });

        // Index for audit_logs: organization_id and created_at for fetching recent audit logs per organization
        // (existing index includes action, but we add a separate index for better performance on queries without action filter)
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index(['organization_id', 'created_at'], 'audit_logs_organization_created_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teacher_assignments', function (Blueprint $table) {
            $table->dropIndex('teacher_assignments_school_teacher_index');
        });

        Schema::table('attendance_sessions', function (Blueprint $table) {
            $table->dropIndex('attendance_sessions_school_date_index');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('notifications_organization_created_index');
        });

        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex('audit_logs_organization_created_index');
        });
    }
};
