<?php

namespace App\Http\Requests\Schedule;

use App\Models\School;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class ExamPaperFormRequest extends FormRequest
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
        return [
            'class_id' => ['required', 'integer'],
            'section_id' => ['required', 'integer'],
            'subject_id' => ['required', 'integer'],
            'exam_date' => ['required', 'date'],
            'starts_at' => ['required', 'date_format:H:i'],
            'ends_at' => ['required', 'date_format:H:i', 'after:starts_at'],
            'room' => ['nullable', 'string', 'max:64'],
            'max_score' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'instructions' => ['nullable', 'string', 'max:2000'],
            'invigilator_ids' => ['nullable', 'array'],
            'invigilator_ids.*' => ['integer'],
            'apply_to_batch' => ['nullable', 'boolean'],
        ];
    }
}
