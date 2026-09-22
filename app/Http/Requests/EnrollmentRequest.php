<?php

namespace App\Http\Requests;

use App\Models\School;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EnrollmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Authorization will be handled in the controller via Gate::authorize
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $organizationId = School::query()
            ->whereKey($this->route('school'))
            ->value('organization_id');

        return [
            'student_id' => [
                'required',
                'integer',
                'exists:students,id',
                // Mirrors the enrollment_scope_unique index: one enrollment per
                // student per academic year.
                Rule::unique('enrollments', 'student_id')
                    ->where(fn ($query) => $query
                        ->where('organization_id', $organizationId)
                        ->where('academic_year_id', $this->input('academic_year_id')))
                    ->ignore($this->route('enrollment')),
            ],
            'academic_year_id' => ['required', 'integer', 'exists:academic_years,id'],
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'section_id' => ['nullable', 'integer', 'exists:sections,id'],
            'enrolled_on' => ['required', 'date'],
        ];
    }
}
