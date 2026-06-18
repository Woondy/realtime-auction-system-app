import { useEffect, useState } from 'react';
import { calcRemaining } from '@/lib/format';

/**
 * Countdown hook that ticks every `intervalMs` (default 200ms).
 * Returns `null` if `endsAt` is null/undefined.
 * Triggers `onEnd` callback once when reaching zero (caller-owned reload throttle).
 *
 * @param endsAt - ISO timestamp string or null
 * @param options.intervalMs - polling interval (default 200ms)
 * @param options.onEnd - invoked once when countdown hits zero
 */
export function useCountdown(
    endsAt: string | null | undefined,
    options?: { intervalMs?: number; onEnd?: () => void },
): number | null {
    const intervalMs = options?.intervalMs ?? 200;

    // Compute initial value during render
    const [timeLeft, setTimeLeft] = useState<number | null>(() => {
        if (!endsAt) {
            return null;
        }

        return calcRemaining(endsAt);
    });

    useEffect(() => {
        if (!endsAt) {
            // Schedule clear on next frame to avoid synchronous setState
            const raf = requestAnimationFrame(() => setTimeLeft(null));

            return () => cancelAnimationFrame(raf);
        }

        // Schedule reset on next frame
        const raf = requestAnimationFrame(() => {
            setTimeLeft(calcRemaining(endsAt!));
        });

        let fired = false;
        const interval = setInterval(() => {
            const remaining = calcRemaining(endsAt);
            setTimeLeft(remaining);

            if (remaining <= 0 && !fired) {
                fired = true;
                clearInterval(interval);
                options?.onEnd?.();
            }
        }, intervalMs);

        return () => {
            cancelAnimationFrame(raf);
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endsAt, intervalMs]);

    return timeLeft;
}
