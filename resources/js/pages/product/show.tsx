import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { useAuctionSocket } from '@/hooks/useAuctionSocket';
import { useCountdown } from '@/hooks/useCountdown';
import type { ShowProps } from '@/lib/types';
import { AuctionActive } from './components/AuctionActive';
import { AuctionEnded } from './components/AuctionEnded';
import { AuctionPending } from './components/AuctionPending';
import { BidHistory } from './components/BidHistory';
import { ProductCard } from './components/ProductCard';
import { useFlash, Toast } from './components/Toast';

export default function Show({ product, highestBid }: ShowProps) {
    const flash = useFlash();
    const [toastKey, setToastKey] = useState(0);

    // bidderName: the current value in the input field (user can change freely).
    // Initialized empty — user types their own name on first visit.
    const [bidderName, setBidderName] = useState('');

    // lastBidName: the name used for the user's last *successful* bid.
    // Recalled from localStorage so "You are the winner" works across page refreshes
    // and auction-end reloads. This is NOT the same as the current input value —
    // if the user changes the input to a different name without bidding, it
    // should not affect winner detection.
    const [lastBidName, setLastBidName] = useState(() => {
        if (typeof window === 'undefined') {
            return '';
        }

        return localStorage.getItem('lastBidderName') ?? '';
    });

    const currentPrice = highestBid
        ? Number(highestBid.amount)
        : Number(product.starting_price);

    const initialAmount = String(
        highestBid
            ? Number(highestBid.amount) + 100
            : Number(product.starting_price) + 100,
    );

    const isEnded = product.status === 'ended';
    const isActive = product.status === 'active';
    const isPending = product.status === 'pending';
    const isOwnTopBid = Boolean(
        highestBid && lastBidName && highestBid.bidder_name === lastBidName,
    );

    const handleCountdownEnd = () => {
        const key = `last_reload_${product.id}`;
        const last = sessionStorage.getItem(key);
        const now = Date.now();

        if (!last || now - parseInt(last) > 5000) {
            sessionStorage.setItem(key, now.toString());
            window.location.reload();
        }
    };

    const timeLeft = useCountdown(
        product.ends_at && !isEnded ? product.ends_at : null,
        { onEnd: handleCountdownEnd },
    );

    useAuctionSocket(product.id);

    const handleBidSuccess = (usedName: string) => {
        // Record the name that was actually used for this successful bid,
        // not the current input value (which may have changed during the
        // request flight).
        localStorage.setItem('lastBidderName', usedName);
        setLastBidName(usedName);
        setToastKey((k) => k + 1);
    };

    return (
        <>
            <Head title={product.name} />
            <div className="flex min-h-screen flex-col items-center bg-gray-100 p-4">
                <div className="mb-4 w-full max-w-md">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-800"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to List
                    </Link>
                </div>

                <ProductCard product={product}>
                    {isPending && (
                        <AuctionPending
                            productId={product.id}
                            bidderName={bidderName}
                            onBidderNameChange={setBidderName}
                            initialAmount={initialAmount}
                            onBidSuccess={handleBidSuccess}
                        />
                    )}
                    {isActive && (
                        <AuctionActive
                            productId={product.id}
                            timeLeft={timeLeft}
                            currentPrice={currentPrice}
                            highestBid={highestBid}
                            isOwnTopBid={isOwnTopBid}
                            bidderName={bidderName}
                            onBidderNameChange={setBidderName}
                            initialAmount={initialAmount}
                            onBidSuccess={handleBidSuccess}
                        />
                    )}
                    {isEnded && (
                        <AuctionEnded
                            highestBid={highestBid}
                            isOwnTopBid={isOwnTopBid}
                        />
                    )}
                    <BidHistory
                        bids={product.bids}
                        highestBid={highestBid}
                        ownBidderName={lastBidName}
                    />
                </ProductCard>
            </div>

            {toastKey > 0 && (
                <Toast message={flash?.success} toastKey={toastKey} />
            )}
        </>
    );
}
