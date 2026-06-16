import { Head, Link } from '@inertiajs/react';

interface Product {
    id: number;
    name: string;
    description: string | null;
    starting_price: string;
    status: 'pending' | 'active' | 'ended';
    ends_at: string | null;
    bids_count: number;
}

interface Props {
    products: Product[];
}

export default function Index({ products }: Props) {
    const formatPrice = (value: string | number) =>
        '$' + Number(value).toLocaleString('en-US');

    return (
        <>
            <Head title="Auctions" />

            <div className="min-h-screen bg-gray-50">
                {/* Hero */}
                <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 px-4 py-16 text-center text-white sm:py-20">
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
                        Live Auctions
                    </h1>
                    <p className="mt-3 text-lg text-white/80 sm:mt-4">
                        Bid on rare collectibles, luxury watches & vintage
                        treasures
                    </p>
                </div>

                {/* Product Grid */}
                <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/products/${product.id}`}
                                className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-lg hover:ring-gray-300"
                            >
                                {/* Color bar based on status */}
                                <div
                                    className={`h-1.5 ${
                                        product.status === 'active'
                                            ? 'bg-green-500'
                                            : product.status === 'ended'
                                              ? 'bg-gray-400'
                                              : 'bg-rose-500'
                                    }`}
                                />

                                <div className="p-5">
                                    <div className="mb-3 flex items-center gap-2">
                                        <span
                                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                product.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : product.status === 'ended'
                                                      ? 'bg-gray-100 text-gray-500'
                                                      : 'bg-rose-100 text-rose-600'
                                            }`}
                                        >
                                            {product.status === 'active'
                                                ? 'Live'
                                                : product.status === 'ended'
                                                  ? 'Ended'
                                                  : 'Upcoming'}
                                        </span>
                                        {product.bids_count > 0 && (
                                            <span className="text-xs text-gray-400">
                                                {product.bids_count} bid
                                                {product.bids_count !== 1
                                                    ? 's'
                                                    : ''}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="mb-1 text-base font-semibold text-gray-900 transition-colors group-hover:text-rose-600">
                                        {product.name}
                                    </h3>

                                    {product.description && (
                                        <p className="mb-3 line-clamp-2 text-sm text-gray-500">
                                            {product.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                                        <span className="text-xs text-gray-400">
                                            Starting at
                                        </span>
                                        <span className="text-lg font-bold text-gray-900">
                                            {formatPrice(
                                                product.starting_price,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
