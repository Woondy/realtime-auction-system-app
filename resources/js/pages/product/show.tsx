import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Bid {
    id: number;
    product_id: number;
    bidder_name: string;
    amount: string;
    created_at: string;
}

interface Product {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    starting_price: string;
    status: 'pending' | 'active' | 'ended';
    ends_at: string | null;
    bids: Bid[];
}

interface Props {
    product: Product;
    highestBid: Bid | null;
}

export default function Show({ product, highestBid }: Props) {
    const { errors } = usePage().props;
    const flash = (usePage().props as Record<string, unknown>).flash as { success?: string } | undefined;
    const [showToast, setShowToast] = useState(false);

    const ownBidderName = typeof window !== 'undefined' ? localStorage.getItem('lastBidderName') : null;

    const { data, setData, post, processing, reset } = useForm({
        bidder_name: ownBidderName ?? '',
        amount: (highestBid ? Number(highestBid.amount) + 100 : Number(product.starting_price) + 100).toString(),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/products/${product.id}/bids`, {
            onSuccess: () => {
                if (data.bidder_name) {
                    localStorage.setItem('lastBidderName', data.bidder_name);
                }

                // Pre-fill amount for next bid
                const nextAmount = Number(data.amount) + 100;
                reset();
                setData('amount', nextAmount.toString());
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            },
        });
    };

    const addHundred = () => {
        setData('amount', (Number(data.amount || 0) + 100).toString());
    };

    const currentPrice = highestBid
        ? Number(highestBid.amount)
        : Number(product.starting_price);

    const isEnded = product.status === 'ended';
    const isActive = product.status === 'active';
    const isPending = product.status === 'pending';
    const isOwnTopBid = highestBid && ownBidderName && highestBid.bidder_name === ownBidderName;

    const formatPrice = (value: number | string) =>
        '$' + Number(value).toLocaleString('en-US');

    // Countdown timer
    const calcRemaining = (endsAt: string): number =>
        Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));

    const [timeLeft, setTimeLeft] = useState<number | null>(() => {
        if (!product.ends_at || isEnded) {
return null;
}

        return calcRemaining(product.ends_at);
    });

    useEffect(() => {
        if (!product.ends_at || isEnded) {
return;
}

        const interval = setInterval(() => {
            const remaining = calcRemaining(product.ends_at!);
            setTimeLeft(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                window.location.reload();
            }
        }, 200);

        return () => clearInterval(interval);
    }, [product.ends_at, isEnded]);

    const formatCountdown = (seconds: number): string => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;

        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const isUrgent = timeLeft !== null && timeLeft <= 10;

    // Real-time WebSocket listeners
    useEffect(() => {
        if (typeof window.Echo === 'undefined') {
return;
}

        const channel = window.Echo.channel(`auction.${product.id}`);
        channel.listen('.BidPlaced', () => {
            router.reload({ only: ['product', 'highestBid'], preserveState: true, preserveScroll: true });
        });
        channel.listen('.AuctionStarted', () => {
            router.reload({ preserveScroll: true });
        });
        channel.listen('.AuctionEnded', () => {
            router.reload({ preserveScroll: true });
        });

        return () => {
            channel.stopListening('.BidPlaced');
            channel.stopListening('.AuctionStarted');
            channel.stopListening('.AuctionEnded');
        };
    }, [product.id]);

    return (
        <>
            <Head title={product.name} />
            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
                {/* Card */}
                <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
                    {/* Header Image */}
                    <div className="relative h-56 bg-gradient-to-br from-orange-100 via-pink-100 to-rose-200">
                        {product.image ? (
                            <img src={product.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full items-end justify-end p-6">
                                {/* Watch illustration placeholder */}
                                <svg className="h-40 w-40 text-rose-300/60" viewBox="0 0 100 100" fill="currentColor">
                                    <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="8" fill="none" />
                                    <circle cx="50" cy="50" r="28" fill="white" fillOpacity="0.6" />
                                    <line x1="50" y1="22" x2="50" y2="28" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                    <line x1="50" y1="72" x2="50" y2="78" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Toast */}
                    {showToast && (
                        <div className="animate-[slideDown_0.3s_ease-out] fixed left-1/2 top-4 z-50 -translate-x-1/2">
                            <div className="flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                {flash?.success ?? 'Bid Placed!'}
                            </div>
                        </div>
                    )}

                    {/* ===== WAITING STATE ===== */}
                    {isPending && (
                        <div className="p-6">
                            {/* Timer - static 01:00 */}
                            <div className="mb-4 flex items-center justify-center gap-2 text-2xl font-mono font-bold text-gray-300">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                                01:00
                            </div>

                            {/* Status */}
                            <div className="mb-6 flex flex-col items-center gap-3 py-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.749.749 0 011.06 0z" />
                                    </svg>
                                </div>
                                <p className="text-base font-semibold text-gray-800">
                                    Please <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">Bid</span> to Start
                                </p>
                            </div>

                            {/* Action Bar */}
                            <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-xl bg-gray-50 p-3">
                                <input
                                    type="number"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    placeholder="Amount"
                                    className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-300"
                                />
                                <input
                                    type="text"
                                    value={data.bidder_name}
                                    onChange={(e) => setData('bidder_name', e.target.value)}
                                    placeholder="Name"
                                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-300"
                                />
                                <button
                                    type="button"
                                    onClick={addHundred}
                                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                                >
                                    +100
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-50"
                                >
                                    {processing && (
                                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    )}
                                    Bid
                                </button>
                            </form>
                            {errors.amount && <p className="mt-2 text-center text-xs text-red-500">{errors.amount}</p>}
                            {errors.bidder_name && <p className="mt-2 text-center text-xs text-red-500">{errors.bidder_name}</p>}
                        </div>
                    )}

                    {/* ===== ACTIVE STATE ===== */}
                    {isActive && (
                        <div className="p-6">
                            {/* Timer */}
                            <div className={`mb-4 flex items-center justify-center gap-2 text-2xl font-mono font-bold transition-colors
                                ${isUrgent ? 'text-red-500' : 'text-gray-700'}`}
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                                {timeLeft !== null ? formatCountdown(timeLeft) : '00:00'}
                            </div>

                            {/* Status */}
                            <div className="mb-6 flex flex-col items-center gap-2 py-4">
                                <img src="https://api.dicebear.com/7.x/initials/svg?seed=GU&backgroundColor=rose" className="h-10 w-10 rounded-full" alt="" />
                                <p className="text-lg font-semibold text-gray-800">
                                    {formatPrice(currentPrice)}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {isOwnTopBid ? 'Current Bid by You' : `Current Bid by ${highestBid?.bidder_name ?? 'N/A'}`}
                                </p>
                            </div>

                            {/* Action Bar */}
                            <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-xl bg-gray-50 p-3">
                                <input
                                    type="number"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    placeholder="Amount"
                                    className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-300"
                                />
                                <input
                                    type="text"
                                    value={data.bidder_name}
                                    onChange={(e) => setData('bidder_name', e.target.value)}
                                    placeholder="Name"
                                    className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-300"
                                />
                                <button
                                    type="button"
                                    onClick={addHundred}
                                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                                >
                                    +100
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-50"
                                >
                                    {processing && (
                                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    )}
                                    Bid
                                </button>
                            </form>
                            {errors.amount && <p className="mt-2 text-center text-xs text-red-500">{errors.amount}</p>}
                            {errors.bidder_name && <p className="mt-2 text-center text-xs text-red-500">{errors.bidder_name}</p>}
                        </div>
                    )}

                    {/* ===== ENDED STATE ===== */}
                    {isEnded && (
                        <div className="p-6">
                            {highestBid && isOwnTopBid ? (
                                /* You won */
                                <div className="mb-4 rounded-xl bg-green-500 p-6 text-center text-white">
                                    <svg className="mx-auto mb-2 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-lg font-bold">You are the winner!</p>
                                    <p className="mt-1 text-3xl font-extrabold">{formatPrice(highestBid.amount)}</p>
                                </div>
                            ) : highestBid ? (
                                /* Someone else won */
                                <div className="mb-4 rounded-xl bg-gray-100 p-6 text-center">
                                    <img
                                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${highestBid.bidder_name.charAt(0)}&backgroundColor=rose`}
                                        className="mx-auto mb-3 h-14 w-14 rounded-full"
                                        alt=""
                                    />
                                    <p className="text-sm font-medium text-gray-500">
                                        Won by <span className="font-bold text-gray-800">{highestBid.bidder_name}</span>
                                    </p>
                                    <p className="mt-1 text-2xl font-extrabold text-gray-800">{formatPrice(highestBid.amount)}</p>
                                </div>
                            ) : (
                                <div className="mb-4 rounded-xl bg-gray-100 p-6 text-center">
                                    <p className="text-gray-500">Auction ended with no bids</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== BID HISTORY ===== */}
                    {product.bids.length > 0 && (
                        <div className="border-t border-gray-100 px-6 pb-6">
                            <h4 className="mb-3 mt-4 text-xs font-semibold uppercase tracking-wide text-gray-400">Bid History</h4>
                            <div className="space-y-2">
                                {[...product.bids].sort((a, b) => b.id - a.id).slice(0, 5).map((bid) => {
                                    const isTopBid = highestBid && bid.id === highestBid.id;
                                    const isOwn = ownBidderName && bid.bidder_name === ownBidderName;

                                    return (
                                        <div key={bid.id} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm
                                            ${isTopBid ? 'bg-green-50' : ''}
                                            ${isOwn ? 'ring-1 ring-blue-100' : ''}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
                                                    ${isOwn ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}
                                                >
                                                    {bid.bidder_name.charAt(0)}
                                                </span>
                                                <span className="font-medium text-gray-700">
                                                    {bid.bidder_name}
                                                    {isOwn && <span className="ml-1 text-xs text-blue-500">(you)</span>}
                                                </span>
                                            </div>
                                            <span className={`font-mono text-xs font-semibold ${isTopBid ? 'text-green-600' : 'text-gray-500'}`}>
                                                {formatPrice(bid.amount)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
