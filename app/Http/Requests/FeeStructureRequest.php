<?php

namespace App\Http\Requests;

use App\Models\School;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class FeeStructureRequest extends FormRequest
{
    /**
     * Authorization is enforced in the controller via Gate::authorize.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $organizationId = $this->organizationId();
        $feeStructureId = $this->route('fee_structure');

        return [
            'name' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:500'],
            'amount_minor' => ['required', 'integer', 'min:0'],
            'currency' => ['required', 'string', 'in:SAR,USD,EUR,GBP'],
            'frequency' => ['required', 'string', 'in:one_time,monthly,termly,yearly'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Get the organization ID from the school route parameter.
     */
    private function organizationId(): ?int
    {
        $schoolId = $this->route('school');

        if ($schoolId === null) {
            return null;
        }

        return School::query()->whereKey($schoolId)->value('organization_id');
    }
}
