import { useForm } from '@inertiajs/react';

interface BidFormProps {
    productId: number;
    bidderName: string;
    onBidderNameChange: (name: string) => void;
    initialAmount: string;
    disabled?: boolean;
    submitLabel?: string;
    /**
     * Called after a successful bid.
     * @param usedName The bidder_name that was actually submitted.
     * @param nextAmount The next suggested bid amount.
     */
    onSuccess?: (usedName: string, nextAmount: string) => void;
}

/**
 * Shared bid form used by both Pending and Active states.
 *
 * bidderName is controlled by the parent (show.tsx) via props, not by
 * useForm's initial value — this ensures the name survives component
 * remounts when auction transitions from pending → active.
 */
export function BidForm({
    productId,
    bidderName,
    onBidderNameChange,
    initialAmount,
    disabled = false,
    submitLabel = 'Bid',
    onSuccess,
}: BidFormProps) {
    const { data, setData, post, processing, errors } = useForm({
        bidder_name: bidderName,
        amount: initialAmount,
    });

    // Sync form's bidder_name with parent state when parent value changes.
    if (data.bidder_name !== bidderName) {
        setData('bidder_name', bidderName);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Capture the name at submit time — the user may change the input
        // while the request is in flight, but this bid used the current value.
        const usedName = data.bidder_name;
        post(`/products/${productId}/bids`, {
            onSuccess: () => {
                const nextAmount = String(Number(data.amount) + 100);
                setData('amount', nextAmount);
                onSuccess?.(usedName, nextAmount);
            },
        });
    };

    const addHundred = () => {
        setData('amount', (Number(data.amount || 0) + 100).toString());
    };

    const inputBase =
        'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-rose-300 focus:ring-1 focus:ring-rose-300 focus:outline-none disabled:opacity-50';

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-wrap items-center gap-2 rounded-xl bg-gray-50 p-3"
        >
            <input
                type="text"
                value={bidderName}
                onChange={(e) => {
                    onBidderNameChange(e.target.value);
                    setData('bidder_name', e.target.value);
                }}
                placeholder="Name"
                disabled={disabled || processing}
                className={`w-full min-w-0 ${inputBase} min-[440px]:order-2 min-[440px]:w-auto min-[440px]:flex-1`}
            />
            <input
                type="number"
                value={data.amount}
                onChange={(e) => setData('amount', e.target.value)}
                placeholder="Amount"
                disabled={disabled || processing}
                className={`order-2 w-24 shrink-0 ${inputBase} min-[440px]:order-1`}
            />
            <button
                type="button"
                onClick={addHundred}
                disabled={disabled || processing}
                className={`order-3 shrink-0 ${inputBase} text-gray-600 transition-colors hover:bg-gray-100 min-[440px]:order-3`}
            >
                +100
            </button>
            <button
                type="submit"
                disabled={disabled || processing}
                className="order-4 flex shrink-0 items-center gap-1.5 rounded-lg bg-rose-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-50 min-[440px]:order-4"
            >
                {processing && (
                    <svg
                        className="h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                )}
                {submitLabel}
            </button>
            {errors.amount && (
                <p className="mt-2 w-full text-center text-xs text-red-500">
                    {errors.amount}
                </p>
            )}
            {errors.bidder_name && (
                <p className="mt-2 w-full text-center text-xs text-red-500">
                    {errors.bidder_name}
                </p>
            )}
        </form>
    );
}
