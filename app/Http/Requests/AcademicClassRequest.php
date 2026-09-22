<?php

namespace App\Http\Requests;

use App\Models\School;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AcademicClassRequest extends FormRequest
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
                // Mirrors the class_scope_unique index so a duplicate name is a
                // field error instead of a 500 from the database.
                Rule::unique('classes', 'name')
                    ->where(fn ($query) => $query
                        ->where('organization_id', $organizationId)
                        ->where('school_id', $schoolId))
                    ->ignore($this->route('academicClass')),
            ],
        ];
    }
}
