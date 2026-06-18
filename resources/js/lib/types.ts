export interface Bid {
    id: number;
    product_id: number;
    bidder_name: string;
    amount: string;
    created_at: string;
}

export interface Product {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    starting_price: string;
    status: 'pending' | 'active' | 'ended';
    ends_at: string | null;
    bids: Bid[];
}

export interface ShowProps {
    product: Product;
    highestBid: Bid | null;
}
