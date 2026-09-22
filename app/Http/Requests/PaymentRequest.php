<?php

namespace App\Http\Requests;

use App\Models\School;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'installment_id' => ['nullable', 'integer'],
            'invoice_id' => ['nullable', 'integer'],
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
