# Real-Time Bidding System (Live Auction App)

A highly responsive, real-time single-product bidding application built with **Laravel 13**, **Inertia.js v3 (React)**, and **Tailwind CSS v4**, using **Laravel Reverb** (WebSockets) for real-time price updates and queue-based job scheduling for secure auction ending.

---

## 🚀 Features

- **Responsive Grid Homepage**: Displays all available items (Live, Upcoming, and Ended) in a beautiful, responsive layout adapting from desktop to ultra-narrow mobile screens (320px).
- **Interactive Bidding Flow**: 
  - **Before State**: Static 01:00 timer, displays "Please Bid to Start".
  - **During State**: Placing a bid transitions the auction to active and starts a 1-minute countdown. Displays real-time bid values and bidder labels (e.g. "Current Bid by You" / "Current Bid by Bob").
  - **Ended State**: Once the timer expires, the page transitions to the ended state, removes the bidding form, and displays the winner ("You are the winner!" or "Won by Alice").
- **Real-Time Synchronizations**: Multi-session bids update automatically via WebSocket-triggered Inertia page reloads.
- **Throttled Reload & Anti-Flashing**: Client-side countdown reloads are throttled via session storage to prevent infinite reload loops caused by client-server clock drift.
- **Form Validations**: Complete client-side and server-side validation alerts (e.g., preventing empty names, negative amounts, or bids lower than the current highest bid).
- **Service Layer Abstraction**: `AuctionService` encapsulates bidding logic (bid placement, auction start/end, optimistic locking) for separation of concerns.
- **Precise Decimal Arithmetic**: Uses `bcmath` for all amount comparisons to avoid floating-point precision issues.
- **Rate Limiting**: Throttled bid endpoints (60 requests/minute) to prevent abuse.
- **Component-Based Frontend**: `show.tsx` decomposed into focused components (`AuctionPending`, `AuctionActive`, `AuctionEnded`, `BidForm`, `BidHistory`, `ProductCard`, `Toast`) with shared hooks (`useCountdown`, `useAuctionSocket`).

---

## 🛠️ Technology Stack

- **Backend**: PHP 8.4+ / Laravel 13
- **Frontend**: React 19 / Inertia.js v3 (SPA) / TypeScript
- **Styling**: Tailwind CSS v4
- **Real-Time Communication**: Laravel Reverb (WebSockets) / Laravel Echo
- **Job Queueing**: Redis / Database Queue driver
- **Testing**: Pest PHP (Backend) & Vitest + React Testing Library (Frontend)
- **Containerization**: Laravel Sail (Docker)

---

## 📦 Quick Start

### 🐳 Docker (recommended)

Prerequisites: Docker + [Composer](https://getcomposer.org/) (local PHP optional)

```bash
# 1. Install dependencies
composer install

# 2. Build & start everything (app, MySQL, Redis, Reverb, queue worker)
./vendor/bin/sail up -d

# 3. One-time setup
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate:fresh --seed
./vendor/bin/sail npm install && ./vendor/bin/sail npm run build
```

Done — open `http://localhost:8080`. Reverb and the queue worker start automatically inside the container.

> 💡 No local Composer? Bootstrap via Docker one-liner:
> ```bash
> docker run --rm -v "$(pwd):/var/www/html" -w /var/www/html laravelsail/php8.5-composer:latest composer install --ignore-platform-reqs
> ```

---

### 💻 Local (no Docker)

Prerequisites: PHP 8.4+, Composer, Node.js 22+, SQLite or MySQL

```bash
# 1. Install dependencies
composer install
npm install

# 2. Configure
cp .env.example .env
php artisan key:generate

# 3. Switch to SQLite (zero config)
sed -i '' 's/DB_CONNECTION=mysql/DB_CONNECTION=sqlite/' .env
touch database/database.sqlite

# 4. Migrate & seed
php artisan migrate:fresh --seed
npm run build

# 5. Start all services
php artisan serve --port=8080 &      # Web server
php artisan queue:work &             # Background jobs
php artisan reverb:start &           # WebSocket server
wait
```

Open `http://localhost:8080`.

---

## 📁 Project Structure

```
app/
├── Events/              # BidPlaced, AuctionStarted, AuctionEnded (broadcast)
├── Http/
│   ├── Controllers/     # ProductController, BidController
│   └── Requests/        # StoreBidRequest (validation)
├── Jobs/                # EndAuction (delayed queue job)
├── Models/              # Product, Bid, User
└── Services/            # AuctionService (business logic)
resources/js/
├── hooks/               # useCountdown, useAuctionSocket
├── lib/                 # types.ts, format.ts (shared utilities)
└── pages/product/
    ├── show.tsx         # Main page (state orchestration)
    └── components/      # AuctionPending/Active/Ended, BidForm, BidHistory, ProductCard, Toast
```

---

## 🧪 Testing

```bash
# Full CI check (lint + format + types + tests)
./vendor/bin/sail composer ci:check

# Individual checks
./vendor/bin/sail artisan test              # Backend (Pest, 31 tests)
./vendor/bin/sail npm run test:js           # Frontend (Vitest, 21 tests)
./vendor/bin/sail composer types:check      # PHPStan
./vendor/bin/sail npm run types:check       # TypeScript (tsc)
./vendor/bin/sail npm run lint:check        # ESLint
./vendor/bin/sail npm run format:check      # Prettier
```

### Pre-Push Hook

A git pre-push hook automatically runs all CI checks before allowing a push. If any check fails, the push is aborted.

```bash
# Bypass the hook (not recommended)
git push --no-verify
```

---

## 🏗️ Architecture

See **[ARCHITECTURAL_DECISIONS.md](ARCHITECTURAL_DECISIONS.md)** for full rationale on technology choices, design patterns, and future improvements.
