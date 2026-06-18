import { BidForm } from './BidForm';

interface AuctionPendingProps {
    productId: number;
    bidderName: string;
    onBidderNameChange: (name: string) => void;
    initialAmount: string;
    onBidSuccess?: (usedName: string, nextAmount: string) => void;
}

/**
 * Pre-auction state: static 01:00 timer and the form that starts the auction
 * on first bid.
 */
export function AuctionPending({
    productId,
    bidderName,
    onBidderNameChange,
    initialAmount,
    onBidSuccess,
}: AuctionPendingProps) {
    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-center gap-2 font-mono text-2xl font-bold text-gray-300">
                <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                </svg>
                01:00
            </div>

            <div className="mb-6 flex flex-col items-center gap-3 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    <svg
                        className="h-6 w-6 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                    >
                        <path
                            strokeLinecap="round"
                            d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.749.749 0 011.06 0z"
                        />
                    </svg>
                </div>
                <p className="text-base font-semibold text-gray-800">
                    Please{' '}
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">
                        Bid
                    </span>{' '}
                    to Start
                </p>
            </div>

            <BidForm
                productId={productId}
                bidderName={bidderName}
                onBidderNameChange={onBidderNameChange}
                initialAmount={initialAmount}
                onSuccess={onBidSuccess}
            />
        </div>
    );
}
