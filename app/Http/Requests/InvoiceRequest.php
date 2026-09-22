<?php

namespace App\Http\Requests;

use App\Models\School;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InvoiceRequest extends FormRequest
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
        $invoiceId = $this->route('invoice');

        return [
            'student_id' => ['required', 'integer'],
            'issued_by' => ['required', 'integer'],
            'number' => ['required', 'string', 'max:50'],
            'issued_on' => ['required', 'date'],
            'due_on' => ['nullable', 'date'],
            'status' => ['required', 'string', 'in:draft,issued,paid,voided'],
            'currency' => ['required', 'string', 'in:SAR,USD,EUR,GBP'],
            'subtotal_minor' => ['required', 'integer', 'min:0'],
            'total_minor' => ['required', 'integer', 'min:0'],
            'items' => ['required', 'array'],
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