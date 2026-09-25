<?php

namespace App\Http\Controllers;

use App\Concerns\ResolvesSchool;
use App\Enums\UserRole;
use App\Http\Requests\UserRequest;
use App\Models\School;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
    use ResolvesSchool;

    /** @var list<UserRole> */
    private const MANAGED_ROLES = [
        UserRole::SchoolAdmin,
        UserRole::AcademicCoordinator,
        UserRole::Teacher,
        UserRole::FinanceStaff,
    ];

    public function index(Request $request, int $school): Response
    {
        $schoolModel = $this->school($school);
        Gate::authorize('manage-users', $schoolModel);

        $search = trim((string) $request->query('search', ''));
        // MANAGED_ROLES stays the outer bound, so a crafted role value can only
        // narrow this list, never widen it to roles this screen does not own.
        $role = in_array($request->query('role'), $this->managedRoleValues(), true)
            ? (string) $request->query('role')
            : '';

        $users = User::query()
            ->where('organization_id', $schoolModel->organization_id)
            ->whereIn('role', self::MANAGED_ROLES)
            ->when($role !== '', fn ($query) => $query->where('role', $role))
            ->when($search !== '', fn ($query) => $query->where(fn ($inner) => $inner
                ->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")))
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role'])
            ->map(fn (User $user): array => $this->payload($user))
            ->values()
            ->all();

        return Inertia::render('admin/users/index', [
            'school' => $this->schoolPayload($schoolModel),
            'users' => $users,
            'filters' => ['search' => $search, 'role' => $role],
        ]);
    }

    /**
     * @return list<string>
     */
    private function managedRoleValues(): array
    {
        return array_map(static fn (UserRole $role): string => $role->value, self::MANAGED_ROLES);
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

        $data = $request->validated();

        // role and organization_id are intentionally not mass-assignable on User
        // (registration shares that model), so they are assigned explicitly here
        // instead of being silently dropped by fill().
        $user = new User([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);
        $user->role = UserRole::from($data['role']);
        $user->organization_id = $schoolModel->organization_id;
        $user->save();

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

        $record->name = $data['name'];
        $record->email = $data['email'];
        $record->role = UserRole::from($data['role']);

        // A blank password field means "leave the password alone".
        if (! empty($data['password'])) {
            $record->password = $data['password'];
        }

        $record->save();

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
}
