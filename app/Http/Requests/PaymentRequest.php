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
        $schoolId = (int) $this->route('school');

        return [
            // A payment settles an installment or an invoice, exactly one.
            'installment_id' => [
                'nullable',
                'integer',
                'required_without:invoice_id',
                'prohibits:invoice_id',
                Rule::exists('installments', 'id')->where(fn ($query) => $query
                    ->where('organization_id', $organizationId)
                    ->where('school_id', $schoolId)),
            ],
            'invoice_id' => [
                'nullable',
                'integer',
                'required_without:installment_id',
                'prohibits:installment_id',
                Rule::exists('invoices', 'id')->where(fn ($query) => $query
                    ->where('organization_id', $organizationId)
                    ->where('school_id', $schoolId)),
            ],
            'received_by' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where(fn ($query) => $query->where('organization_id', $organizationId)),
            ],
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
