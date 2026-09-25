<?php

namespace App\Http\Requests;

use App\Models\School;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PaymentRequest extends FormRequest
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
        $paymentId = $this->route('payment');

        return [
            'organization_id' => ['required', 'integer'],
            'school_id' => ['required', 'integer'],
            // A payment settles an installment or an invoice, exactly one.
            'installment_id' => ['nullable', 'integer', 'required_without:invoice_id', 'prohibits:invoice_id'],
            'invoice_id' => ['nullable', 'integer', 'required_without:installment_id', 'prohibits:installment_id'],
            'received_by' => ['required', 'integer'],
            'payment_method' => ['nullable', 'string', 'max:50'],
            'reference_number' => ['nullable', 'string', 'max:100'],
            'payment_date' => ['required', 'date'],
            'amount_minor' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'string', 'in:pending,completed,failed,refunded'],
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
