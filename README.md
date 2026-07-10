# banh-na-nha-trang

Bánh Tráng Nhà Na — ecommerce monorepo (Express API, Next.js storefront, Vite admin panel). See `CLAUDE.md` for architecture details.

## Prerequisites

- Node.js >= 20
- pnpm >= 9 (`corepack enable` or `npm i -g pnpm`)
- A running MongoDB instance (local `mongod`, Docker, or Atlas)

## 1. Install dependencies

From the repo root:

```bash
pnpm install
```

## 2. Configure environment variables

Copy the example env file into each app that needs it, then fill in the values:

```bash
cp .env.example apps/api/.env
cp .env.example apps/storefront/.env.local
cp .env.example apps/admin/.env
```

Each app only reads the variables relevant to it (see `.env.example` for the full list, grouped by app):

| App | File | Key vars |
|---|---|---|
| `apps/api` | `.env` | `PORT` (5000), `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_ORIGIN`, `ADMIN_ORIGIN`, Cloudinary keys (optional in dev) |
| `apps/storefront` | `.env.local` | `NEXT_PUBLIC_SITE_URL`, `API_ORIGIN` |
| `apps/admin` | `.env` | `VITE_API_URL` |

`JWT_SECRET`/`JWT_REFRESH_SECRET` must be at least 16 characters. Cloudinary vars can be left blank in dev — image uploads fall back to a `picsum.photos` stub.

## 3. Run the backend (API)

Make sure MongoDB is reachable at `MONGODB_URI`, then:

```bash
pnpm --filter api dev
```

Starts the Express API on `http://localhost:5000` (`tsx watch`, auto-reloads on changes).

Optional: seed the database with sample data (run once, in order):

```bash
pnpm seed:admin     # creates an admin user
pnpm seed:catalog   # seeds products/categories
pnpm seed:blog      # seeds blog posts
# or all at once:
pnpm seed:all
```

## 4. Run the frontend

In separate terminals (both need the API running):

```bash
pnpm --filter storefront dev   # http://localhost:3000 — public storefront (Next.js)
pnpm --filter admin dev        # http://localhost:5173 — admin back-office (Vite)
```

## Run everything at once

Alternatively, from the repo root, start all three apps in parallel via Turborepo:

```bash
pnpm dev
```

## Other useful commands

```bash
pnpm build       # build all apps
pnpm lint        # lint all apps
pnpm test        # run all tests
pnpm typecheck   # typecheck all apps
```

Run any of the above for a single app with `pnpm --filter <api|admin|storefront> <script>`.
