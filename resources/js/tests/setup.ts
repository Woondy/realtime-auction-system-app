import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Mock Echo module to avoid real WebSocket connections in tests
vi.mock('@/echo', () => {
    const mockChannel = {
        listen: vi.fn(() => mockChannel),
        stopListening: vi.fn(() => mockChannel),
    };

    return {
        echo: {
            channel: vi.fn(() => mockChannel),
        },
        default: { channel: vi.fn(() => mockChannel) },
    };
});

// Mock Inertia.js React bindings
vi.mock('@inertiajs/react', () => {
    return {
        Head: ({ children }: { children: React.ReactNode }) =>
            React.createElement('div', null, children),
        Link: ({ href, children, ...props }: any) =>
            React.createElement('a', { href, ...props }, children),
        router: {
            reload: vi.fn(),
            visit: vi.fn(),
            optimistic: vi.fn(() => ({ post: vi.fn() })),
        },
        useForm: (initialValues = {}) => {
            const [data, setDataState] = React.useState(initialValues);
            const setData = (keyOrData: any, value?: any) => {
                if (typeof keyOrData === 'string') {
                    setDataState((prev) => ({ ...prev, [keyOrData]: value }));
                } else if (typeof keyOrData === 'function') {
                    setDataState((prev) => keyOrData(prev));
                } else {
                    setDataState(keyOrData);
                }
            };
            const post = vi.fn();
            const reset = vi.fn();

            return {
                data,
                setData,
                post,
                processing: false,
                reset,
                errors: {},
            };
        },
        usePage: () => ({
            props: {
                errors: {},
                flash: {},
            },
        }),
    };
});

// Mock window.location.reload
Object.defineProperty(window, 'location', {
    value: {
        reload: vi.fn(),
    },
    writable: true,
});
