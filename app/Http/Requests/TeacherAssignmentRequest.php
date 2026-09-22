<?php

namespace App\Http\Requests;

use App\Enums\UserRole;
use App\Models\School;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TeacherAssignmentRequest extends FormRequest
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
        $school = $this->school();
        $organizationId = $school?->organization_id;

        return [
            'teacher_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')
                    ->where('organization_id', $organizationId)
                    ->where('role', UserRole::Teacher->value),
            ],
            'section_id' => [
                'required',
                'integer',
                Rule::exists('sections', 'id')->where('school_id', $school?->id),
            ],
        ];
    }

    private function school(): ?School
    {
        $schoolId = $this->route('school');

        return $schoolId === null ? null : School::query()->whereKey($schoolId)->first();
    }
}
