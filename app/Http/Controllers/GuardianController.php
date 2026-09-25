<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesSchool;
use App\Http\Requests\GuardianRequest;
use App\Models\Guardian;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class GuardianController
{
    use ResolvesSchool;

    /**
     * Display a listing of guardians.
     */
    public function index(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        $guardians = Guardian::query()
            ->where('school_id', $schoolModel->id)
            ->with('students')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/guardians/index', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'guardians' => $guardians,
        ]);
    }

    /**
     * Show the form for creating a new guardian.
     */
    public function create(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/guardians/create', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
        ]);
    }

    /**
     * Store a newly created guardian in storage.
     */
    public function store(GuardianRequest $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-enrollment', $schoolModel);

        $validated = $request->validated();

        $guardian = Guardian::create([...$validated, 'organization_id' => $schoolModel->organization_id, 'school_id' => $schoolModel->id]);

        $audit->record('guardian.created', $guardian, after: $guardian->only([
            'name', 'email', 'phone', 'address', 'occupation', 'relationship',
        ]));

        return redirect()->route('guardians.index', $schoolModel->id)
            ->with('success', 'Guardian created successfully.');
    }

    /**
     * Display the specified guardian.
     */
    public function show(int $school, int $guardian): Response
    {
        $schoolModel = $this->school($school);
        $guardianModel = Guardian::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $guardian)
            ->with('students')
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/guardians/show', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'guardian' => [
                'id' => $guardianModel->id,
                'name' => $guardianModel->name,
                'email' => $guardianModel->email,
                'phone' => $guardianModel->phone,
                'address' => $guardianModel->address,
                'occupation' => $guardianModel->occupation,
                'relationship' => $guardianModel->relationship,
                'students' => $guardianModel->students->map(function ($student) {
                    return [
                        'id' => $student->id,
                        'name' => trim($student->first_name.' '.$student->last_name),
                        'student_number' => $student->student_number,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified guardian.
     */
    public function edit(int $school, int $guardian): Response
    {
        $schoolModel = $this->school($school);
        $guardianModel = Guardian::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $guardian)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        return Inertia::render('admin/guardians/edit', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'guardian' => [
                'id' => $guardianModel->id,
                'name' => $guardianModel->name,
                'email' => $guardianModel->email,
                'phone' => $guardianModel->phone,
                'address' => $guardianModel->address,
                'occupation' => $guardianModel->occupation,
                'relationship' => $guardianModel->relationship,
            ],
        ]);
    }

    /**
     * Update the specified guardian in storage.
     */
    public function update(GuardianRequest $request, int $school, int $guardian, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        $guardianModel = Guardian::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $guardian)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        $validated = $request->validated();

        // Store old values for audit
        $oldValues = $guardianModel->only([
            'name', 'email', 'phone', 'address', 'occupation', 'relationship',
        ]);

        $guardianModel->update($validated);

        $audit->record('guardian.updated', $guardianModel, before: $oldValues, after: $guardianModel->only([
            'name', 'email', 'phone', 'address', 'occupation', 'relationship',
        ]));

        return back()->with('success', 'Guardian updated successfully.');
    }

    /**
     * Remove the specified guardian from storage.
     */
    public function destroy(int $school, int $guardian, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        $guardianModel = Guardian::query()
            ->where('school_id', $schoolModel->id)
            ->where('id', $guardian)
            ->firstOrFail();

        Gate::authorize('manage-enrollment', $schoolModel);

        // Store values for audit before deletion
        $recordValues = $guardianModel->only([
            'name', 'email', 'phone', 'address', 'occupation', 'relationship',
        ]);

        $guardianModel->delete();

        $audit->record('guardian.deleted', null, before: $recordValues);

        return redirect()->route('guardians.index', $schoolModel->id)
            ->with('success', 'Guardian deleted successfully.');
    }
}
