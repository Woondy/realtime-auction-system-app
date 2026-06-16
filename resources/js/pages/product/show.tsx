import { Head } from '@inertiajs/react';

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
    const currentPrice = highestBid
        ? Number(highestBid.amount)
        : Number(product.starting_price);

    return (
        <>
            <Head title={product.name} />

            <div className="min-h-screen bg-[#FDFDFC] dark:bg-[#0a0a0a]">
                {/* Hero Section */}
                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
                    {/* Product Image Placeholder */}
                    <div className="mb-8 overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg dark:from-gray-800 dark:to-gray-700">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="h-64 w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-64 w-full items-center justify-center text-gray-400 dark:text-gray-500">
                                <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <span className="inline-block rounded-full px-3 py-1 text-xs font-medium capitalize
                                ${product.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : ''}
                                ${product.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : ''}
                                ${product.status === 'ended' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' : ''}
                            ">
                                {product.status}
                            </span>
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
                                    ¥{currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
