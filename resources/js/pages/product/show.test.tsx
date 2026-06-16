import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import Show from './show';

const mockProduct = (status: 'pending' | 'active' | 'ended') => ({
    id: 1,
    name: 'Leica M6 TTL',
    description: 'Beautiful vintage camera',
    image: null,
    starting_price: '1000',
    status,
    ends_at:
        status === 'active' ? new Date(Date.now() + 60000).toISOString() : null,
    bids: [],
});

describe('Product Show Component', () => {
    it('renders pending state correctly', () => {
        const product = mockProduct('pending');
        render(<Show product={product} highestBid={null} />);

        expect(screen.getByText(/Please/)).toBeInTheDocument();
        expect(screen.getByText(/to Start/)).toBeInTheDocument();
        expect(screen.getByText('01:00')).toBeInTheDocument();
    });

    it('renders active state correctly', () => {
        const product = mockProduct('active');
        const highestBid = {
            id: 1,
            product_id: 1,
            bidder_name: 'Bob',
            amount: '1200',
            created_at: new Date().toISOString(),
        };

        render(<Show product={product} highestBid={highestBid} />);

        expect(screen.getByText('$1,200')).toBeInTheDocument();
        expect(screen.getByText('Current Bid by Bob')).toBeInTheDocument();
    });

    it('renders ended state correctly with winner', () => {
        const product = mockProduct('ended');
        const highestBid = {
            id: 1,
            product_id: 1,
            bidder_name: 'Abu',
            amount: '1500',
            created_at: new Date().toISOString(),
        };

        // Stub ownBidderName in localStorage to match Abu so they are the winner
        localStorage.setItem('lastBidderName', 'Abu');

        render(<Show product={product} highestBid={highestBid} />);

        expect(screen.getByText('You are the winner!')).toBeInTheDocument();
        expect(screen.getByText('$1,500')).toBeInTheDocument();

        localStorage.removeItem('lastBidderName');
    });

    it('allows incrementing the bid amount by 100', () => {
        const product = mockProduct('pending');
        render(<Show product={product} highestBid={null} />);

        const amountInput = screen.getByPlaceholderText(
            'Amount',
        ) as HTMLInputElement;
        const initialValue = parseInt(amountInput.value);

        const plus100Button = screen.getByText('+100');
        fireEvent.click(plus100Button);

        expect(parseInt(amountInput.value)).toBe(initialValue + 100);
    });
});
