import { Head, useForm, usePage } from '@inertiajs/react';
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

    const { data, setData, post, processing, reset } = useForm({
        bidder_name: '',
        amount: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/products/${product.id}/bids`, {
            onSuccess: () => reset(),
        });
    };

    const currentPrice = highestBid
        ? Number(highestBid.amount)
        : Number(product.starting_price);

    const isEnded = product.status === 'ended';
    const isActive = product.status === 'active';
    const isPending = product.status === 'pending';

    const formatPrice = (value: number | string) =>
        '¥' + Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 });

    const formatTime = (dateString: string) =>
        new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Countdown timer — initial value derived from props, updated by interval
    const calcRemaining = (endsAt: string): number => {
        return Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));
    };

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

    return (
        <>
            <Head title={product.name} />

            <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#0a0a0a]">
                <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                    {/* Product Image Placeholder */}
                    <div className="mb-8 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg dark:from-gray-800 dark:to-gray-700">
                        {product.image ? (
                            <img src={product.image} alt={product.name} className="h-64 w-full object-cover" />
                        ) : (
                            <div className="flex h-64 w-full items-center justify-center text-gray-400 dark:text-gray-500">
                                <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Winner Banner */}
                    {isEnded && highestBid && (
                        <div className="mb-6 rounded-xl border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 text-center shadow-lg dark:border-yellow-600 dark:from-yellow-900/20 dark:to-orange-900/20">
                            <div className="mb-1 text-sm font-medium text-yellow-700 dark:text-yellow-400">
                                Auction Ended &mdash; Winner
                            </div>
                            <div className="text-2xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">
                                {highestBid.bidder_name}
                            </div>
                            <div className="mt-1 text-3xl font-bold text-yellow-700 dark:text-yellow-400">
                                {formatPrice(highestBid.amount)}
                            </div>
                        </div>
                    )}

                    {isEnded && !highestBid && (
                        <div className="mb-6 rounded-xl border border-[#e3e3e0] bg-white p-6 text-center shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <p className="text-[#706f6c] dark:text-[#A1A09A]">
                                Auction ended with no bids.
                            </p>
                        </div>
                    )}

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium capitalize
                                ${product.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : ''}
                                ${product.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' : ''}
                                ${product.status === 'ended' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' : ''}
                            `}>
                                {product.status === 'pending' && 'Pending'}
                                {product.status === 'active' && 'Active'}
                                {product.status === 'ended' && 'Ended'}
                            </span>

                            {/* Countdown Timer */}
                            {isActive && timeLeft !== null && (
                                <span className={`rounded-full px-3 py-1 text-xs font-mono font-medium
                                    ${isUrgent
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 animate-pulse'
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}
                                `}>
                                    {formatCountdown(timeLeft)}
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl font-bold tracking-tight text-[#1b1b18] sm:text-4xl dark:text-[#EDEDEC]">
                            {product.name}
                        </h1>

                        {product.description && (
                            <p className="text-lg leading-relaxed text-[#706f6c] dark:text-[#A1A09A]">
                                {product.description}
                            </p>
                        )}

                        {/* Price Card */}
                        <div className="rounded-xl border border-[#e3e3e0] bg-white p-6 shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                    {highestBid ? 'Highest Bid' : 'Starting Price'}
                                </span>
                                <span className="text-3xl font-bold text-[#1b1b18] dark:text-[#EDEDEC]">
                                    {formatPrice(currentPrice)}
                                </span>
                            </div>
                        </div>

                        {/* Waiting banner for pending state */}
                        {isPending && (
                            <div className="rounded-xl border border-dashed border-[#e3e3e0] bg-white p-6 text-center shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                                <p className="text-[#706f6c] dark:text-[#A1A09A]">
                                    Waiting for the first bidder to start the auction.
                                </p>
                            </div>
                        )}

                        {/* Bid Form */}
                        {!isEnded && (
                            <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-[#e3e3e0] bg-white p-6 shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                                <h3 className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                                    {isActive ? 'Place Your Bid' : 'Be the First Bidder'}
                                </h3>

                                <div>
                                    <label htmlFor="bidder_name" className="mb-1 block text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                        Your Name
                                    </label>
                                    <input
                                        id="bidder_name"
                                        type="text"
                                        value={data.bidder_name}
                                        onChange={(e) => setData('bidder_name', e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors
                                            bg-white dark:bg-[#1b1b18] text-[#1b1b18] dark:text-[#EDEDEC]
                                            ${errors.bidder_name
                                                ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-[#e3e3e0] dark:border-[#3E3E3A] focus:border-[#1b1b18] dark:focus:border-[#EDEDEC]'
                                            }
                                            focus:outline-none focus:ring-1`}
                                        placeholder="Enter your name"
                                    />
                                    {errors.bidder_name && (
                                        <p className="mt-1 text-sm text-red-500">{errors.bidder_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="amount" className="mb-1 block text-sm font-medium text-[#706f6c] dark:text-[#A1A09A]">
                                        Bid Amount (min ¥{(currentPrice + 0.01).toLocaleString('en-US', { minimumFractionDigits: 2 })})
                                    </label>
                                    <input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min={currentPrice + 0.01}
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-colors
                                            bg-white dark:bg-[#1b1b18] text-[#1b1b18] dark:text-[#EDEDEC]
                                            ${errors.amount
                                                ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-500'
                                                : 'border-[#e3e3e0] dark:border-[#3E3E3A] focus:border-[#1b1b18] dark:focus:border-[#EDEDEC]'
                                            }
                                            focus:outline-none focus:ring-1`}
                                        placeholder="Enter bid amount"
                                    />
                                    {errors.amount && (
                                        <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full rounded-lg bg-[#1b1b18] px-4 py-3 text-sm font-medium text-white transition-all
                                        hover:bg-black active:scale-[0.98]
                                        disabled:cursor-not-allowed disabled:opacity-50
                                        dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white"
                                >
                                    {processing ? 'Submitting...' : 'Bid'}
                                </button>
                            </form>
                        )}

                        {isEnded && (
                            <div className="rounded-xl border border-[#e3e3e0] bg-white p-6 text-center shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                                <p className="text-[#706f6c] dark:text-[#A1A09A]">This auction has ended.</p>
                            </div>
                        )}

                        {/* Bid List */}
                        <div className="rounded-xl border border-[#e3e3e0] bg-white shadow-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                            <div className="border-b border-[#e3e3e0] px-6 py-4 dark:border-[#3E3E3A]">
                                <h3 className="font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">Bid History</h3>
                            </div>

                            {product.bids.length === 0 ? (
                                <div className="px-6 py-12 text-center">
                                    <p className="text-[#706f6c] dark:text-[#A1A09A]">No bids yet</p>
                                    {!isEnded && (
                                        <p className="mt-1 text-sm text-[#b0b0ab] dark:text-[#5E5E5A]">
                                            Be the first to bid and start the auction!
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="divide-y divide-[#e3e3e0] dark:divide-[#3E3E3A]">
                                    {[...product.bids]
                                        .sort((a, b) => b.id - a.id)
                                        .map((bid) => {
                                            const isTopBid = highestBid && bid.id === highestBid.id;

                                            return (
                                                <div key={bid.id} className={`flex items-center justify-between px-6 py-3
                                                    ${isTopBid ? 'bg-green-50 dark:bg-green-900/10' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e3e3e0] text-sm font-medium text-[#706f6c] dark:bg-[#3E3E3A] dark:text-[#A1A09A]">
                                                            {bid.bidder_name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                                                                {bid.bidder_name}
                                                            </p>
                                                            <p className="text-xs text-[#b0b0ab] dark:text-[#5E5E5A]">
                                                                {formatTime(bid.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-sm font-semibold
                                                        ${isTopBid ? 'text-green-600 dark:text-green-400' : 'text-[#1b1b18] dark:text-[#EDEDEC]'}`}
                                                    >
                                                        {formatPrice(bid.amount)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
