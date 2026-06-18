import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { echo } from '@/echo';

/**
 * Subscribes to the auction WebSocket channel for a product and
 * triggers Inertia reloads on BidPlaced / AuctionStarted / AuctionEnded.
 *
 * Cleans up listeners on unmount.
 */
export function useAuctionSocket(productId: number): void {
    useEffect(() => {
        const channel = echo.channel(`auction.${productId}`);

        channel.listen('.BidPlaced', () => {
            router.reload({
                only: ['product', 'highestBid'],
                preserveUrl: true,
            });
        });
        channel.listen('.AuctionStarted', () => {
            router.reload({ preserveUrl: true });
        });
        channel.listen('.AuctionEnded', () => {
            router.reload({ preserveUrl: true });
        });

        return () => {
            channel.stopListening('.BidPlaced');
            channel.stopListening('.AuctionStarted');
            channel.stopListening('.AuctionEnded');
        };
    }, [productId]);
}
