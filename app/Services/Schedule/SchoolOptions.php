<?php

namespace App\Services\Schedule;

use App\Enums\UserRole;
use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\BellSchedule;
use App\Models\ClassSubject;
use App\Models\School;
use App\Models\SchoolScheduleSetting;
use App\Models\Section;
use App\Models\Subject;
use App\Models\User;

/**
 * The option lists every schedule screen picks from.
 *
 * Each list is scoped to one school and serialized as the named fields the
 * pages read, so a page never receives more (or less) than it renders.
 */
class SchoolOptions
{
    /**
     * @return list<array{id: int, name: string, is_current: bool}>
     */
    public function academicYears(School $school): array
    {
        return array_values(AcademicYear::query()
            ->where('school_id', $school->id)
            ->orderByDesc('starts_on')
            ->get(['id', 'name', 'is_current'])
            ->map(fn (AcademicYear $year): array => [
                'id' => $year->id,
                'name' => $year->name,
                'is_current' => (bool) $year->is_current,
            ])
            ->all());
    }

    /**
     * @return list<array{id: int, name: string}>
     */
    public function bellSchedules(School $school): array
    {
        return array_values(BellSchedule::query()
            ->where('school_id', $school->id)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (BellSchedule $schedule): array => ['id' => $schedule->id, 'name' => $schedule->name])
            ->all());
    }

    /**
     * @return list<array{id: int, name: string}>
     */
    public function classes(School $school): array
    {
        return array_values(AcademicClass::query()
            ->where('school_id', $school->id)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (AcademicClass $class): array => ['id' => $class->id, 'name' => $class->name])
            ->all());
    }

    /**
     * @return list<array{id: int, name: string, class_id: int}>
     */
    public function sections(School $school): array
    {
        return array_values(Section::query()
            ->where('school_id', $school->id)
            ->orderBy('name')
            ->get(['id', 'name', 'class_id'])
            ->map(fn (Section $section): array => [
                'id' => $section->id,
                'name' => $section->name,
                'class_id' => $section->class_id,
            ])
            ->all());
    }

    /**
     * @return list<array{id: int, code: string, name_en: string, name_ar: string, color: string|null}>
     */
    public function subjects(School $school): array
    {
        return array_values(Subject::query()
            ->where('school_id', $school->id)
            ->where('is_active', true)
            ->orderBy('code')
            ->get(['id', 'code', 'name_en', 'name_ar', 'color'])
            ->map(fn (Subject $subject): array => [
                'id' => $subject->id,
                'code' => $subject->code,
                'name_en' => $subject->name_en,
                'name_ar' => $subject->name_ar,
                'color' => $subject->color,
            ])
            ->all());
    }

    /**
     * @return list<array{id: int, name: string}>
     */
    public function teachers(School $school): array
    {
        return array_values(User::query()
            ->where('organization_id', $school->organization_id)
            ->where('role', UserRole::Teacher)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (User $teacher): array => ['id' => $teacher->id, 'name' => $teacher->name])
            ->all());
    }

    /**
     * @return list<array{class_id: int, subject_id: int, periods_per_week: int}>
     */
    public function classSubjects(School $school): array
    {
        return array_values(ClassSubject::query()
            ->where('school_id', $school->id)
            ->get(['class_id', 'subject_id', 'periods_per_week'])
            ->map(fn (ClassSubject $requirement): array => [
                'class_id' => $requirement->class_id,
                'subject_id' => $requirement->subject_id,
                'periods_per_week' => (int) $requirement->periods_per_week,
            ])
            ->all());
    }

    /**
     * @return list<int>
     */
    public function workingDays(School $school): array
    {
        return array_values(SchoolScheduleSetting::forSchool($school)->working_days);
    }
}
