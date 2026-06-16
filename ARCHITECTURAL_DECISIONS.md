# Architectural Decisions & Future Improvements

This document explains the key architectural decisions made during the development of this bidding application, followed by what we would do differently/improve in a production-scale system.

---

## 🏗️ Architectural Decisions Made

### 1. Monolithic SPA with Laravel + Inertia.js v3 (React)
- **Decision**: Choose Inertia.js rather than scaffolding a decoupled Frontend (Next.js/Vite) and Backend (REST API).
- **Rationale**: Inertia.js v3 allows us to build a single-page application using modern React components without the complexity of client-side routing, JWT authentication boilerplate, or duplicate route definitions. It leverages Laravel's controllers for data loading and routing while delivering a fluid SPA user experience.

### 2. Laravel Reverb for Native WebSocket Broadcasting
- **Decision**: Choose Laravel Reverb as the WebSocket broadcaster.
- **Rationale**: Laravel Reverb is a first-party, high-performance WebSocket server natively integrated into Laravel 11+. It eliminates the dependency on third-party paid subscriptions (like Pusher) or maintaining complex custom Socket.io server integrations, while maintaining full compatibility with the Laravel Echo client contracts.

### 3. Server-Secured Queue-Driven Auction Ending
- **Decision**: Manage the auction countdown ending via a server-side delayed queue job (`EndAuction`) rather than client-driven events.
- **Rationale**: Relying on the client to notify the server when an auction ends is a severe security vulnerability (users can freeze or edit their local clocks to cheat).
  - When the first bid is placed, the product transitions to `active` and the backend dispatches the `EndAuction` job with a **60-second delay**.
  - The server worker runs the job at exactly 60 seconds, updates the product state to `ended`, and broadcasts the `.AuctionEnded` WebSocket event, ensuring the system remains completely secure and cheat-proof.

### 4. Database Pessimistic Locking for Bid Race Conditions
- **Decision**: Use `lockForUpdate()` inside a `DB::transaction()` when querying the current highest bid and inserting a new bid.
- **Rationale**: In high-concurrency scenarios, if two users click "Bid" at the exact same millisecond, they might both read the same "current highest bid" from the database and insert overlapping bids. Pessimistic locking serializes bid processing per product, ensuring strict price integrity with zero duplicate wins.

### 5. Responsive Bidding Bar & Session-Throttled Reload
- **Decision**: Use Tailwind `order-*` classes and CSS media queries for mobile layout wrapping, and add a `sessionStorage` throttle to client reloads.
- **Rationale**: 
  - To support narrow screens (down to 320px) without duplicating HTML components, we used CSS media queries to stack the Name input while keeping elements inline on desktop in the correct sequence.
  - Due to client-server clock drift, the client timer might hit `00:00` before the server queue job has run. By throttling `window.location.reload()` to once every 5 seconds, we prevented infinite page-flashing loops.

---

## 🔮 What We Would Do Differently Next Time (Production Scale)

If we were to scale this application for a production environment, we would implement the following architectural enhancements:

### 1. Inertia v3 Optimistic Updates
- **The Issue**: When a user clicks "Bid", they experience a slight delay (network roundtrip) while the POST request completes before seeing their bid in the history.
- **Next Time**: We would leverage Inertia v3's **Optimistic Updates** to immediately append the new bid to the history list in the local state:
  ```react
  router.optimistic((props) => ({
      product: {
          ...props.product,
          bids: [...props.product.bids, { id: Date.now(), bidder_name: data.bidder_name, amount: data.amount }]
      }
  })).post(`/products/${product.id}/bids`)
  ```
  If the server validation fails, Inertia automatically rolls back the UI state, providing a sub-10ms perceived reaction speed.

### 2. Fully Decoupled JSON API & WebSocket Bid Submission
- **The Issue**: Inertia works by reloading page props via HTTP requests. For a high-traffic system receiving thousands of bids per second, launching a full HTTP bootstrap lifecycle for every single bid places unnecessary overhead on server resources.
- **Next Time**: 
  - Decouple the frontend (e.g. Next.js / React with Zustand state management).
  - Submit bids directly over a WebSocket channel (e.g., via a Socket.io or Laravel Reverb client-to-server broadcast message).
  - This eliminates HTTP headers and request overhead, lowering latency to single-digit milliseconds and dramatically increasing total concurrent capacity.
