/**
 * Format a numeric value as a USD currency string.
 *
 * @example formatPrice(1234.5) // "$1,234.50"
 */
export function formatPrice(value: number | string): string {
    return '$' + Number(value).toLocaleString('en-US');
}

/**
 * Format seconds remaining as MM:SS.
 *
 * @example formatCountdown(65) // "01:05"
 */
export function formatCountdown(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Calculate seconds remaining until the given ISO timestamp.
 * Returns 0 if the timestamp is in the past.
 */
export function calcRemaining(endsAt: string): number {
    return Math.max(
        0,
        Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000),
    );
}
