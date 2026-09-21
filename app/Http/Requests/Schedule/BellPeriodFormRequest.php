<?php

namespace App\Http\Requests\Schedule;

use App\Models\School;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class BellPeriodFormRequest extends FormRequest
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
            'bell_schedule_id' => ['required', 'integer', 'exists:bell_schedules,id'],
            'number' => ['required', 'integer', 'min:1'],
            'label_en' => ['required', 'string', 'max:255'],
            'label_ar' => ['required', 'string', 'max:255'],
            'starts_at' => ['required', 'date_format:H:i'],
            'ends_at' => ['required', 'date_format:H:i', 'after:starts_at'],
            'is_break' => ['boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_break' => $this->boolean('is_break'),
        ]);
    }
}
