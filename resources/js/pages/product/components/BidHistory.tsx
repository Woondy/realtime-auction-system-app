import { formatPrice } from '@/lib/format';
import type { Bid } from '@/lib/types';

interface BidHistoryProps {
    bids: Bid[];
    highestBid: Bid | null;
    ownBidderName: string | null;
    maxItems?: number;
}

/**
 * Bid history list - shows top N bids sorted by id descending (newest first).
 */
export function BidHistory({
    bids,
    highestBid,
    ownBidderName,
    maxItems = 5,
}: BidHistoryProps) {
    if (bids.length === 0) {
        return null;
    }

    return (
        <div className="border-t border-gray-100 px-6 pb-6">
            <h4 className="mt-4 mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                Bid History
            </h4>
            <div className="space-y-2">
                {[...bids]
                    .sort((a, b) => b.id - a.id)
                    .slice(0, maxItems)
                    .map((bid) => {
                        const isTopBid = highestBid && bid.id === highestBid.id;
                        const isOwn =
                            ownBidderName && bid.bidder_name === ownBidderName;

                        return (
                            <div
                                key={bid.id}
                                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${isTopBid ? 'bg-green-50' : ''} ${isOwn ? 'ring-1 ring-blue-100' : ''}`}
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${isOwn ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        {bid.bidder_name.charAt(0)}
                                    </span>
                                    <span className="font-medium text-gray-700">
                                        {bid.bidder_name}
                                        {isOwn && (
                                            <span className="ml-1 text-xs text-blue-500">
                                                (you)
                                            </span>
                                        )}
                                    </span>
                                </div>
                                <span
                                    className={`font-mono text-xs font-semibold ${isTopBid ? 'text-green-600' : 'text-gray-500'}`}
                                >
                                    {formatPrice(bid.amount)}
                                </span>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
