<?php

namespace App\Http\Controllers;

use App\Models\School;
use App\Models\User;
use App\Enums\UserRole;
use App\Services\AuditLogger;
use App\Http\Requests\UserRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController
{
    /**
     * Display a listing of users (teachers/staff).
     */
    public function index(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('view', User::class);

        $users = User::query()
            ->where('organization_id', $schoolModel->organization_id)
            ->whereIn('role', [UserRole::Teacher, UserRole::Staff])
            ->orderBy('name')
            ->get();

        return Inertia::render('users/index', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a new user (teacher/staff).
     */
    public function create(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('create', User::class);

        return Inertia::render('users/create', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'roles' => [
                UserRole::Teacher => 'Teacher',
                UserRole::Staff => 'Staff',
            ],
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(UserRequest $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('create', User::class);

        $validated = $request->validated();

        // Hash the password if provided
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user = User::create([...$validated, 'organization_id' => $schoolModel->organization_id]);

        $audit->record('user.created', $user, after: $user->only([
            'name', 'email', 'role', 'phone', 'status'
        ]));

        return redirect()->route('users.index', $schoolModel->id)
            ->with('success', 'User created successfully.');
    }

    /**
     * Display the specified user.
     */
    public function show(int $school, int $user): Response
    {
        $schoolModel = $this->school($school);
        $userModel = User::query()
            ->where('organization_id', $schoolModel->organization_id)
            ->where('id', $user)
            ->firstOrFail();

        Gate::authorize('view', $userModel);

        return Inertia::render('users/show', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'user' => [
                'id' => $userModel->id,
                'name' => $userModel->name,
                'email' => $userModel->email,
                'role' => $userModel->role,
                'phone' => $userModel->phone,
                'status' => $userModel->status,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(int $school, int $user): Response
    {
        $schoolModel = $this->school($school);
        $userModel = User::query()
            ->where('organization_id', $schoolModel->organization_id)
            ->where('id', $user)
            ->firstOrFail();

        Gate::authorize('update', $userModel);

        return Inertia::render('users/edit', [
            'school' => ['id' => $schoolModel->id, 'name' => $schoolModel->name],
            'user' => [
                'id' => $userModel->id,
                'name' => $userModel->name,
                'email' => $userModel->email,
                'role' => $userModel->role,
                'phone' => $userModel->phone,
                'status' => $userModel->status,
            ],
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UserRequest $request, int $school, int $user, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        $userModel = User::query()
            ->where('organization_id', $schoolModel->organization_id)
            ->where('id', $user)
            ->firstOrFail();

        Gate::authorize('update', $userModel);

        $validated = $request->validated();

        // Store old values for audit
        $oldValues = $userModel->only([
            'name', 'email', 'role', 'phone', 'status'
        ]);

        // Hash the password if provided
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } elseif (isset($validated['password']) && empty($validated['password'])) {
            // Remove empty password
            unset($validated['password']);
        }

        $userModel->update($validated);

        $audit->record('user.updated', $userModel, before: $oldValues, after: $userModel->only([
            'name', 'email', 'role', 'phone', 'status'
        ]));

        return back()->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(int $school, int $user, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        $userModel = User::query()
            ->where('organization_id', $schoolModel->organization_id)
            ->where('id', $user)
            ->firstOrFail();

        Gate::authorize('delete', $userModel);

        // Store values for audit before deletion
        $recordValues = $userModel->only([
            'name', 'email', 'role', 'phone', 'status'
        ]);

        $userModel->delete();

        $audit->record('user.deleted', null, before: $recordValues);

        return redirect()->route('users.index', $schoolModel->id)
            ->with('success', 'User deleted successfully.');
    }

    private function school(int $id): School
    {
        return School::query()->findOrFail($id);
    }
}