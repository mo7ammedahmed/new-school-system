<?php

namespace App\Http\Requests\Schedule;

use App\Models\School;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class ExamScheduleFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        $school = $this->route('school');

        if (is_numeric($school)) {
            $school = School::query()->find($school);
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
        $school = $this->route('school');

        if (is_numeric($school)) {
            $school = School::query()->find($school);
        }

        $schoolId = $school instanceof School ? $school->id : 0;

        return [
            'academic_year_id' => [
                'required',
                'integer',
                Rule::exists('academic_years', 'id')->where('school_id', $schoolId),
            ],
            'term' => ['nullable', 'string', 'max:32'],
            'title' => ['required', 'string', 'max:255'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'starts_on' => ['required', 'date'],
            'ends_on' => ['required', 'date', 'after_or_equal:starts_on'],
        ];
    }
}
