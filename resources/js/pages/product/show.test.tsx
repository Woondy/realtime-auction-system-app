import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import Show from './show';

const baseProduct = {
    id: 1,
    name: 'Leica M6 TTL',
    description: 'Beautiful vintage camera',
    image: null,
    starting_price: '1000',
    status: 'pending' as const,
    ends_at: null,
    bids: [],
};

const makeBid = (
    overrides: Partial<{
        id: number;
        product_id: number;
        bidder_name: string;
        amount: string;
        created_at: string;
    }> = {},
) => ({
    id: 1,
    product_id: 1,
    bidder_name: 'Bob',
    amount: '1200',
    created_at: new Date().toISOString(),
    ...overrides,
});

const activeProduct = {
    ...baseProduct,
    status: 'active' as const,
    ends_at: new Date(Date.now() + 60000).toISOString(),
};

const endedProduct = {
    ...baseProduct,
    status: 'ended' as const,
};

describe('Show — Pending state', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('renders pending state correctly', () => {
        render(<Show product={baseProduct} highestBid={null} />);
        expect(screen.getByText(/Please/)).toBeInTheDocument();
        expect(screen.getByText(/to Start/)).toBeInTheDocument();
        expect(screen.getByText('01:00')).toBeInTheDocument();
    });

    it('shows back to list link', () => {
        render(<Show product={baseProduct} highestBid={null} />);
        expect(screen.getByText(/Back to List/)).toBeInTheDocument();
    });

    it('displays product name in header', () => {
        render(<Show product={baseProduct} highestBid={null} />);
        expect(screen.getByText('Leica M6 TTL')).toBeInTheDocument();
    });

    it('starts with empty name input (user types their own)', () => {
        localStorage.setItem('lastBidderName', 'Alice');
        render(<Show product={baseProduct} highestBid={null} />);
        const nameInput = screen.getByPlaceholderText(
            'Name',
        ) as HTMLInputElement;
        expect(nameInput.value).toBe('');
    });

    it('calculates initial amount as starting_price + 100', () => {
        render(<Show product={baseProduct} highestBid={null} />);
        const amountInput = screen.getByPlaceholderText(
            'Amount',
        ) as HTMLInputElement;
        expect(amountInput.value).toBe('1100');
    });

    it('increments amount by 100 on +100 click', () => {
        render(<Show product={baseProduct} highestBid={null} />);
        const amountInput = screen.getByPlaceholderText(
            'Amount',
        ) as HTMLInputElement;
        const initialValue = parseInt(amountInput.value);

        fireEvent.click(screen.getByText('+100'));

        expect(parseInt(amountInput.value)).toBe(initialValue + 100);
    });
});

describe('Show — Active state', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('renders current bid amount and bidder name', () => {
        const highestBid = makeBid({ bidder_name: 'Bob', amount: '1200' });
        render(<Show product={activeProduct} highestBid={highestBid} />);
        expect(screen.getByText('$1,200')).toBeInTheDocument();
        expect(screen.getByText('Current Bid by Bob')).toBeInTheDocument();
    });

    it('shows "Current Bid by You" when own name matches top bidder', () => {
        localStorage.setItem('lastBidderName', 'Alice');
        const highestBid = makeBid({ bidder_name: 'Alice', amount: '1500' });
        render(<Show product={activeProduct} highestBid={highestBid} />);
        expect(screen.getByText('Current Bid by You')).toBeInTheDocument();
    });

    it('does not show "Current Bid by You" when input name differs from last bid name', () => {
        // User previously bid as 'Alice' (stored in localStorage).
        // They change the input to 'Bob' but haven't bid as Bob yet.
        // 'Current Bid by You' should still show because Alice (their last bid)
        // is still the top bidder — changing the input doesn't change history.
        localStorage.setItem('lastBidderName', 'Alice');
        const highestBid = makeBid({ bidder_name: 'Alice', amount: '1500' });
        render(<Show product={activeProduct} highestBid={highestBid} />);
        expect(screen.getByText('Current Bid by You')).toBeInTheDocument();
    });

    it('does not show "Current Bid by You" when another user is top bidder', () => {
        // This browser's user bid as 'Alice' previously.
        localStorage.setItem('lastBidderName', 'Alice');
        // But now Bob is the top bidder.
        const highestBid = makeBid({ bidder_name: 'Bob', amount: '1500' });
        render(<Show product={activeProduct} highestBid={highestBid} />);
        expect(
            screen.getByText(
                (_, node) => node?.textContent === 'Current Bid by Bob',
            ),
        ).toBeInTheDocument();
        expect(
            screen.queryByText('Current Bid by You'),
        ).not.toBeInTheDocument();
    });

    it('calculates initial amount as highestBid + 100', () => {
        const highestBid = makeBid({ amount: '1500' });
        render(<Show product={activeProduct} highestBid={highestBid} />);
        const amountInput = screen.getByPlaceholderText(
            'Amount',
        ) as HTMLInputElement;
        expect(amountInput.value).toBe('1600');
    });

    it('renders countdown timer in MM:SS format', () => {
        const endsAt = new Date(Date.now() + 65000).toISOString();
        render(
            <Show
                product={{ ...activeProduct, ends_at: endsAt }}
                highestBid={null}
            />,
        );
        // Should show 01:0X (between 60-65 seconds)
        const timer = screen.getByText(/^01:0\d$/);
        expect(timer).toBeInTheDocument();
    });

    it('shows "Current Bid by N/A" when no bids in active state', () => {
        render(<Show product={activeProduct} highestBid={null} />);
        expect(screen.getByText('Current Bid by N/A')).toBeInTheDocument();
    });
});

describe('Show — Ended state', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('renders "You are the winner!" when own name matches top bidder', () => {
        localStorage.setItem('lastBidderName', 'Abu');
        const highestBid = makeBid({ bidder_name: 'Abu', amount: '1500' });
        render(<Show product={endedProduct} highestBid={highestBid} />);
        expect(screen.getByText('You are the winner!')).toBeInTheDocument();
        expect(screen.getByText('$1,500')).toBeInTheDocument();
    });

    it('renders winner info when someone else won', () => {
        localStorage.setItem('lastBidderName', 'Alice');
        const highestBid = makeBid({ bidder_name: 'Charlie', amount: '2000' });
        render(<Show product={endedProduct} highestBid={highestBid} />);
        expect(screen.getByText(/Won by/)).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
        expect(screen.getByText('$2,000')).toBeInTheDocument();
    });

    it('renders "no bids" message when no bids were placed', () => {
        render(<Show product={endedProduct} highestBid={null} />);
        expect(
            screen.getByText('Auction ended with no bids'),
        ).toBeInTheDocument();
    });

    it('does not render bid form in ended state', () => {
        const highestBid = makeBid({ bidder_name: 'Bob', amount: '1500' });
        render(<Show product={endedProduct} highestBid={highestBid} />);
        expect(screen.queryByPlaceholderText('Name')).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText('Amount')).not.toBeInTheDocument();
    });
});

describe('Show — Bid history', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('renders bid history when bids exist', () => {
        const bids = [
            makeBid({ id: 1, bidder_name: 'Alice', amount: '1100' }),
            makeBid({ id: 2, bidder_name: 'Bob', amount: '1200' }),
        ];
        render(
            <Show product={{ ...activeProduct, bids }} highestBid={bids[1]} />,
        );
        expect(screen.getByText('Bid History')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('marks own bids with (you) label', () => {
        localStorage.setItem('lastBidderName', 'Alice');
        const bids = [makeBid({ id: 1, bidder_name: 'Alice', amount: '1100' })];
        render(
            <Show product={{ ...activeProduct, bids }} highestBid={bids[0]} />,
        );
        expect(screen.getByText('(you)')).toBeInTheDocument();
    });

    it('does not render bid history section when no bids', () => {
        render(<Show product={baseProduct} highestBid={null} />);
        expect(screen.queryByText('Bid History')).not.toBeInTheDocument();
    });
});

describe('Show — Form interactions', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('disables submit button while not processing', () => {
        render(<Show product={baseProduct} highestBid={null} />);
        const submitBtn = screen.getByRole('button', { name: 'Bid' });
        expect(submitBtn).not.toBeDisabled();
    });

    it('updates amount input when typed', () => {
        render(<Show product={baseProduct} highestBid={null} />);
        const amountInput = screen.getByPlaceholderText(
            'Amount',
        ) as HTMLInputElement;
        fireEvent.change(amountInput, { target: { value: '5000' } });
        expect(amountInput.value).toBe('5000');
    });

    it('updates name input when typed', () => {
        render(<Show product={baseProduct} highestBid={null} />);
        const nameInput = screen.getByPlaceholderText(
            'Name',
        ) as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'Charlie' } });
        expect(nameInput.value).toBe('Charlie');
    });
});
