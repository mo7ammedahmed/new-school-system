<?php

namespace App\Http\Requests;

use App\Models\School;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SectionRequest extends FormRequest
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
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'name' => [
                'required',
                'string',
                'max:80',
                // Mirrors the section_scope_unique index.
                Rule::unique('sections', 'name')
                    ->where(fn ($query) => $query
                        ->where('organization_id', $organizationId)
                        ->where('class_id', $this->input('class_id')))
                    ->ignore($this->route('section')),
            ],
        ];
    }
}
