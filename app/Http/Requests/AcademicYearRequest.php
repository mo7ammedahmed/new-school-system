<?php

namespace App\Http\Requests;

use App\Models\School;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AcademicYearRequest extends FormRequest
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
        $schoolId = $this->route('school');
        $organizationId = School::query()->whereKey($schoolId)->value('organization_id');

        return [
            'name' => [
                'required',
                'string',
                'max:80',
                // Mirrors the academic_year_scope_unique index.
                Rule::unique('academic_years', 'name')
                    ->where(fn ($query) => $query
                        ->where('organization_id', $organizationId)
                        ->where('school_id', $schoolId))
                    ->ignore($this->route('academicYear')),
            ],
            'starts_on' => ['required', 'date'],
            'ends_on' => ['required', 'date', 'after:starts_on'],
            'is_current' => ['sometimes', 'boolean'],
        ];
    }
}
