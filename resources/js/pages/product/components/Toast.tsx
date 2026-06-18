import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface Flash {
    success?: string;
}

/**
 * Toast that auto-dismisses after 3 seconds.
 *
 * Parent passes a new `toastKey` each time a bid succeeds. The key remounts
 * this component, re-triggering the animation and timer. When the timer
 * fires, `visible` state flips to false and the toast is removed from the DOM.
 */
export function Toast({
    message,
    toastKey,
}: {
    message?: string;
    toastKey: number | string;
}) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 3000);

        return () => clearTimeout(timer);
    }, []);

    if (!visible) {
        return null;
    }

    return (
        <div
            key={toastKey}
            className="fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-[slideDown_0.3s_ease-out]"
        >
            <div className="flex items-center gap-2 rounded-full bg-green-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg">
                <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                    />
                </svg>
                {message ?? 'Bid Placed!'}
            </div>
        </div>
    );
}

/**
 * Convenience hook that reads flash.success from Inertia page props.
 */
export function useFlash(): Flash | undefined {
    return (usePage().props as Record<string, unknown>).flash as
        | Flash
        | undefined;
}
