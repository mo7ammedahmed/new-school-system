<?php

namespace App\Http\Requests\Schedule;

use App\Models\School;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class TeachingAssignmentFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        $school = $this->route('school');

        if (is_numeric($school)) {
            $school = School::query()->findOrFail($school);
        }

        if (! $school instanceof School) {
            return false;
        }

        return Gate::allows('manage-schedule', $school);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'academic_year_id' => ['required', 'integer', 'exists:academic_years,id'],
            'section_id' => ['required', 'integer', 'exists:sections,id'],
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'teacher_id' => ['required', 'integer', 'exists:users,id', 'exists:users,role'],
            'periods_per_week' => ['nullable', 'integer', 'min:1', 'max:20'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'periods_per_week' => $this->input('periods_per_week'),
        ]);
    }
}
