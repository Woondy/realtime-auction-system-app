<?php

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
}
