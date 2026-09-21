<?php

namespace App\Http\Requests\Schedule;

use App\Models\School;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class SubjectFormRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:32'],
            'name_en' => ['required', 'string', 'max:255'],
            'name_ar' => ['required', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'size:7', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function validationData(): array
    {
        $data = $this->all();
        $data['is_active'] = $this->boolean('is_active', true);

        return $data;
    }
}
