# Label Dvisha

A full-stack luxury Indian fashion e-commerce website with a customer-facing storefront, admin panel, and user gallery uploads.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000, proxied at `/api`)
- `pnpm --filter @workspace/label-dvisha run dev` — run the frontend (proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — for JWT signing

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, wouter (routing), TanStack Query
- API: Express 5, Pino logger
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec) → `lib/api-client-react`
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/label-dvisha/` — React + Vite frontend
- `artifacts/api-server/` — Express 5 API server
- `lib/api-client-react/src/generated/api.ts` — generated hooks (4674 lines, source of truth for mutation arg shapes)
- `lib/api-client-react/src/generated/api.schemas.ts` — all TypeScript schema types
- `lib/db/src/schema/index.ts` — Drizzle DB schema exports
- `artifacts/api-server/src/routes/index.ts` — all API routes registered

## Architecture decisions

- Contract-first OpenAPI: schema defined in `lib/api-spec`, generates React Query hooks and Zod validators via Orval. Never hand-write fetch calls.
- JWT auth stored in localStorage key `ld_token`; `setAuthTokenGetter` wires the token into all API requests globally.
- `setBaseUrl` is NOT called — generated API URLs already include `/api` prefix, the proxy handles routing.
- Admin guard redirects unauthenticated users to `/login`, non-admin authenticated users to `/`.
- `deliveryDays` is a `string` field in the schema (e.g. "7-10 days"), not a number.
- `ProductColorInput` only accepts `{ name, hexCode, sortOrder? }` — no `isAvailable`.
- `ProductSizeInput` only accepts `{ sizeId, stockQuantity }` — no `isAvailable`.
- `OrderStatusUpdate` only accepts `{ status }` — no `trackingNumber`.
- `ShippingAddress` uses `fullName` (not `name`) and `street` (not `address1`).

## Product

- **Storefront**: Home (hero + categories + featured), Products listing with category/search filters, Product detail with image gallery/colour/size/custom measurements, Cart, Checkout (Razorpay), Orders, Gallery (user photo uploads)
- **Admin panel** (`/admin`): Dashboard stats, Products CRUD (with images/colours/sizes), Categories, Orders (status update), Users (activate/deactivate), Gallery moderation, Banners, Settings, Sizes

## Seed credentials

- Admin: `admin@labeldvisha.com` / `Admin@1234`

## User preferences

- Mobile-first responsive design
- Luxury Indian fashion brand aesthetic: warm ivory background, primary hsl(25 30% 30%), Playfair Display (serif) + Plus Jakarta Sans (sans)
- No emojis in UI

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing the OpenAPI spec before using new hooks.
- Mutation arg shapes come from `lib/api-client-react/src/generated/api.ts` — check there before writing mutation calls.
- `useClearCart` takes `void` — call `clearCart.mutate()` with no args.
- `useGetMe` and `useGetCart` require explicit `queryKey` in their query options.
- The proxy routes `/api/*` to the API server and `/` to the frontend. Do NOT use `setBaseUrl`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
