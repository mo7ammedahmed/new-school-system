<?php

namespace App\Http\Requests;

use App\Models\School;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InstallmentRequest extends FormRequest
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
        $installmentId = $this->route('installment');

        return [
            'invoice_id' => ['required', 'integer'],
            'sequence' => ['required', 'integer', 'min:1'],
            'due_on' => ['required', 'date'],
            'amount_minor' => ['required', 'integer', 'min:0'],
            'paid_minor' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', 'string', 'in:created,succeeded,partially_paid,paid'],
            'paid_at' => ['nullable', 'date'],
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