<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\UserRequest;
use App\Models\School;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The staff directory for one school.
 *
 * Only school-scoped staff roles are managed here; guardians and students have
 * their own surfaces, and organization-level accounts stay with the
 * organization administrator.
 */
class UserController
{
    /** @var list<UserRole> */
    private const MANAGED_ROLES = [
        UserRole::SchoolAdmin,
        UserRole::AcademicCoordinator,
        UserRole::Teacher,
        UserRole::FinanceStaff,
    ];

    public function index(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-users', $schoolModel);

        $users = User::query()
            ->where('organization_id', $schoolModel->organization_id)
            ->whereIn('role', self::MANAGED_ROLES)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role'])
            ->map(fn (User $user): array => $this->payload($user))
            ->values()
            ->all();

        return Inertia::render('admin/users/index', [
            'school' => $this->schoolPayload($schoolModel),
            'users' => $users,
        ]);
    }

    public function create(int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-users', $schoolModel);

        return Inertia::render('admin/users/create', [
            'school' => $this->schoolPayload($schoolModel),
            'roles' => $this->roleOptions(),
        ]);
    }

    public function store(UserRequest $request, int $school, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-users', $schoolModel);

        $user = User::create([
            ...$request->validated(),
            'organization_id' => $schoolModel->organization_id,
        ]);

        $audit->record('user.created', $user, after: $user->only(['name', 'email', 'role']));

        return redirect()->route('users.index', $schoolModel->id)
            ->with('success', 'User created successfully.');
    }

    public function show(int $school, int $user): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-users', $schoolModel);

        return Inertia::render('admin/users/show', [
            'school' => $this->schoolPayload($schoolModel),
            'user' => $this->payload($this->staff($schoolModel, $user)),
        ]);
    }

    public function edit(int $school, int $user): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-users', $schoolModel);

        return Inertia::render('admin/users/edit', [
            'school' => $this->schoolPayload($schoolModel),
            'user' => $this->payload($this->staff($schoolModel, $user)),
            'roles' => $this->roleOptions(),
        ]);
    }

    public function update(UserRequest $request, int $school, int $user, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-users', $schoolModel);

        $record = $this->staff($schoolModel, $user);
        $before = $record->only(['name', 'email', 'role']);

        $data = $request->validated();

        // A blank password field means "leave the password alone".
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $record->update($data);

        $audit->record('user.updated', $record, before: $before, after: $record->only(['name', 'email', 'role']));

        return back()->with('success', 'User updated successfully.');
    }

    public function destroy(int $school, int $user, AuditLogger $audit): RedirectResponse
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-users', $schoolModel);

        $record = $this->staff($schoolModel, $user);
        $before = $record->only(['name', 'email', 'role']);

        if ($record->id === auth()->id()) {
            return back()->withErrors(['user' => 'You cannot delete your own account.']);
        }

        $record->delete();

        $audit->record('user.deleted', null, before: $before);

        return redirect()->route('users.index', $schoolModel->id)
            ->with('success', 'User deleted successfully.');
    }

    /**
     * @return array{id: int, name: string, email: string, role: string}
     */
    private function payload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role->value,
        ];
    }

    /**
     * @return array<string, string>
     */
    private function roleOptions(): array
    {
        $options = [];

        foreach (self::MANAGED_ROLES as $role) {
            $options[$role->value] = str($role->value)->replace('_', ' ')->title()->toString();
        }

        return $options;
    }

    /**
     * @return array{id: int, name: string}
     */
    private function schoolPayload(School $school): array
    {
        return ['id' => $school->id, 'name' => $school->name];
    }

    private function staff(School $school, int $id): User
    {
        return User::query()
            ->where('organization_id', $school->organization_id)
            ->whereIn('role', self::MANAGED_ROLES)
            ->whereKey($id)
            ->firstOrFail();
    }

    private function school(int $id): School
    {
        return School::query()->findOrFail($id);
    }
}
