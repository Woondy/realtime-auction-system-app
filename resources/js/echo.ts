import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Echo: Echo<'reverb'>;
        Pusher: typeof Pusher;
    }
}

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST ?? 'localhost',
    wsPort: import.meta.env.VITE_REVERB_PORT
        ? Number(import.meta.env.VITE_REVERB_PORT)
        : 8081,
    wssPort: import.meta.env.VITE_REVERB_PORT
        ? Number(import.meta.env.VITE_REVERB_PORT)
        : 8081,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
});

// Keep window.Echo for backward compatibility with any legacy code
window.Echo = echo;

export { echo };
export default echo;
