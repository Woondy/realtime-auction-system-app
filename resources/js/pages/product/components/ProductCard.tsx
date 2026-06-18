import type { Product } from '@/lib/types';

interface ProductCardProps {
    product: Product;
    children: React.ReactNode;
}

/**
 * Product card shell: image header with gradient, product name overlay,
 * wraps the state-specific content (Pending/Active/Ended) and bid history.
 */
export function ProductCard({ product, children }: ProductCardProps) {
    return (
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="relative h-56 bg-gradient-to-br from-orange-100 via-pink-100 to-rose-200">
                {product.image ? (
                    <img
                        src={product.image}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full items-end justify-end p-6">
                        <svg
                            className="h-40 w-40 text-rose-300/60"
                            viewBox="0 0 100 100"
                            fill="currentColor"
                        >
                            <circle
                                cx="50"
                                cy="50"
                                r="35"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="28"
                                fill="white"
                                fillOpacity="0.6"
                            />
                            <line
                                x1="50"
                                y1="22"
                                x2="50"
                                y2="28"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                            <line
                                x1="50"
                                y1="72"
                                x2="50"
                                y2="78"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                )}
                <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/40 to-transparent p-4 pt-8">
                    <h2 className="text-lg font-bold text-white drop-shadow-sm">
                        {product.name}
                    </h2>
                </div>
            </div>
            {children}
        </div>
    );
}
