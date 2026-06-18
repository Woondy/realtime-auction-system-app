import { formatPrice } from '@/lib/format';
import type { Bid } from '@/lib/types';

interface AuctionEndedProps {
    highestBid: Bid | null;
    isOwnTopBid: boolean;
}

/**
 * Post-auction state: shows winner card (you won / someone else won / no bids).
 */
export function AuctionEnded({ highestBid, isOwnTopBid }: AuctionEndedProps) {
    if (highestBid && isOwnTopBid) {
        return (
            <div className="p-6">
                <div className="mb-4 rounded-xl bg-green-500 p-6 text-center text-white">
                    <svg
                        className="mx-auto mb-2 h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="text-lg font-bold">You are the winner!</p>
                    <p className="mt-1 text-3xl font-extrabold">
                        {formatPrice(highestBid.amount)}
                    </p>
                </div>
            </div>
        );
    }

    if (highestBid) {
        return (
            <div className="p-6">
                <div className="mb-4 rounded-xl bg-gray-100 p-6 text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-600">
                        {highestBid.bidder_name.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                        Won by{' '}
                        <span className="font-bold text-gray-800">
                            {highestBid.bidder_name}
                        </span>
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-gray-800">
                        {formatPrice(highestBid.amount)}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-4 rounded-xl bg-gray-100 p-6 text-center">
                <p className="text-gray-500">Auction ended with no bids</p>
            </div>
        </div>
    );
}
