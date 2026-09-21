<?php

namespace App\Http\Requests\Academics;

use App\Enums\UserRole;
use App\Models\School;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/**
 * Validates binding an existing student login to a student record.
 *
 * Both sides are constrained to the school acting on the request, so a school
 * can never attach an account or a record that belongs to someone else.
 */
class LinkStudentAccountRequest extends FormRequest
{
    private ?School $school = null;

    public function authorize(): bool
    {
        $school = $this->school();

        return $school !== null && Gate::allows('manage-enrollment', $school);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $school = $this->school();

        return [
            'student_id' => [
                'required',
                'integer',
                Rule::exists('students', 'id')->where('school_id', $school?->id),
            ],
            'user_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')
                    ->where('organization_id', $school?->organization_id)
                    ->where('role', UserRole::Student->value),
                // An account may only ever point at one student record, and
                // repeating the same link is a no-op rather than an error.
                Rule::unique('students', 'user_id')->ignore($this->input('student_id')),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'user_id.unique' => 'This account is already linked to another student.',
            'user_id.exists' => 'That account is not a student login for this school.',
            'student_id.exists' => 'That student does not belong to this school.',
        ];
    }

    private function school(): ?School
    {
        if ($this->school instanceof School) {
            return $this->school;
        }

        $school = $this->route('school');

        if (is_numeric($school)) {
            $school = School::query()->find($school);
        }

        return $this->school = $school instanceof School ? $school : null;
    }
}
