<?php

namespace App\Http\Requests;

use App\Models\Student;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StudentRequest extends FormRequest
{
    /**
     * Authorization is enforced in the controller via Gate::authorize.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $student = $this->route('student');
        $organizationId = $student !== null
            ? Student::query()->whereKey($student)->value('organization_id')
            : $this->organizationId();

        return [
            'first_name' => ['required', 'string', 'max:160'],
            'last_name' => ['required', 'string', 'max:160'],
            'student_number' => [
                'required',
                'string',
                'max:80',
                Rule::unique('students', 'student_number')
                    ->where(fn ($query) => $query->where('organization_id', $organizationId))
                    ->ignore($student),
            ],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'status' => ['sometimes', 'string', Rule::in(['active', 'inactive', 'graduated', 'withdrawn'])],
        ];
    }

    /**
     * Platform operators create records inside whichever school they can reach
     * first; everyone else is pinned to their own organization.
     */
    private function organizationId(): ?int
    {
        $user = $this->user();

        if ($user === null) {
            return null;
        }

        return $user->organization_id ?? $user->accessibleSchools()->first()?->organization_id;
    }
}
