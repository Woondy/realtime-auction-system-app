import { formatCountdown, formatPrice } from '@/lib/format';
import type { Bid } from '@/lib/types';
import { BidForm } from './BidForm';

interface AuctionActiveProps {
    productId: number;
    timeLeft: number | null;
    currentPrice: number;
    highestBid: Bid | null;
    isOwnTopBid: boolean;
    bidderName: string;
    onBidderNameChange: (name: string) => void;
    initialAmount: string;
    onBidSuccess?: (usedName: string, nextAmount: string) => void;
}

/**
 * Active auction state: live countdown, current price, and bid form.
 */
export function AuctionActive({
    productId,
    timeLeft,
    currentPrice,
    highestBid,
    isOwnTopBid,
    bidderName,
    onBidderNameChange,
    initialAmount,
    onBidSuccess,
}: AuctionActiveProps) {
    const isUrgent = timeLeft !== null && timeLeft <= 10;
    const ending = timeLeft === 0;

    return (
        <div className="p-6">
            <div
                className={`mb-4 flex items-center justify-center gap-2 font-mono text-2xl font-bold transition-colors ${isUrgent ? 'text-red-500' : 'text-gray-700'}`}
            >
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
                {timeLeft !== null ? formatCountdown(timeLeft) : '00:00'}
            </div>

            <div className="mb-6 flex flex-col items-center gap-3 py-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-500">
                    {highestBid
                        ? highestBid.bidder_name.charAt(0).toUpperCase()
                        : '?'}
                </div>
                <p className="text-2xl font-bold text-gray-800">
                    {formatPrice(currentPrice)}
                </p>
                <p className="text-sm text-gray-500">
                    {isOwnTopBid
                        ? 'Current Bid by You'
                        : `Current Bid by ${highestBid?.bidder_name ?? 'N/A'}`}
                </p>
            </div>

            <BidForm
                productId={productId}
                bidderName={bidderName}
                onBidderNameChange={onBidderNameChange}
                initialAmount={initialAmount}
                disabled={ending}
                submitLabel={ending ? 'Ending...' : 'Bid'}
                onSuccess={onBidSuccess}
            />
        </div>
    );
}
