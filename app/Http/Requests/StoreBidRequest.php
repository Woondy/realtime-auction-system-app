<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBidRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'bidder_name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'gt:0'],
        ];
    }

    /**
     * Prepare the input for validation.
     * Ensure amount is a clean numeric string for bcmath comparisons.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('amount') && is_numeric($this->amount)) {
            $this->merge([
                'amount' => (string) $this->amount,
            ]);
        }
    }
}
