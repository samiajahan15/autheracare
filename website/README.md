# AutheraCare website development

## Supabase connection

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` (see `.env.example`). Browser and server clients live in `src/lib/supabase/client.ts` and `server.ts`. `src/proxy.ts` refreshes cookie-based Auth sessions using verified claims and excludes static media. Protected routes must check identity and permissions themselves; the proxy does not restrict access.

The storefront now reads published products from Supabase, with an explicitly labeled local preview when the database is unavailable. `/admin` provides email/password login and product editing; `/api/admin/products` verifies admin membership before access. Apply the schema and catalog import using [the backend setup guide](supabase/README.md) before these features can use the live database. Checkout is not implemented. The existing `pg` helper separately requires `DATABASE_URL` for direct SQL access. Never use a secret/service-role key in public environment variables.

Stack: Next.js App Router, React, TypeScript, Tailwind CSS, PostgreSQL driver, Zod validation, and Lucide icons.

## Commands

Run these from this website directory:

- `npm run dev`: local development at http://localhost:3000
- `npm run build`: production build and TypeScript checks
- `npm start`: serve the production build
- `npm run lint`: ESLint checks

## Environment

`.env.local` holds local settings and is ignored by Git. `.env.example` documents required variables.

Set `DATABASE_URL` to a real PostgreSQL connection string when database development begins. No database server or payment provider has been provisioned yet. Do not commit secrets.

The logo is in `public/brand/authera-logo.png`. The temporary branded landing page will be replaced by the homepage design. `/api/health` checks that the web server responds; it does not test database connectivity.

## Homepage preview

The first homepage includes responsive navigation, campaign imagery, a sample product collection, product search, saved favorites, a preview bag with quantity controls, daily ritual content, and a brand story. Preview state resets on reload. Products, names, and imagery are illustrative; no checkout or real prices are offered.

Original campaign and catalog images were created with the built-in image tool. Prompts: a sunlit Authéra serum and cream still life with burgundy fabric and ivory stone; individual serum, moisturizer, and cleanser catalog photos on pale ivory backdrops. Assets are in `public/images/`.

## Current storefront design

The homepage follows the supplied white cosmetics-store reference with dark navigation, pink wavy active tabs, and a four-column desktop product grid (two columns on mobile). It preserves all 14 brands and 9 product entries.

Category tabs, search, brand filtering, saved favorites, preview bag quantity controls, and product preview dialogs work locally. Products lacking confirmed images use a clearly labeled pending-photo state. Prices, sizes, discounts, inventory, and checkout still need setup. No sale countdowns or discounts are fabricated.

Official product photo sources are documented in `public/products/SOURCES.md`. The earlier generated Authéra concept images remain in `public/images/` but are no longer used on the homepage.

CeraVe catalog images now use eight separate transparent product cutouts, prepared with the built-in image tool from owner-supplied posters. Poster graphics are not rendered in catalog cards. The additional shampoo and conditioner listings include supplied BDT prices and sizes; the Vitamin C serum includes its supplied 30 mL size. Hair care is a separate shopping category. Original promotional assets remain preserved.

The Ordinary collection now includes 12 distinct products across 14 product/size listings. New images use manufacturer packshots, not supplied posters. Size variants are separate listings with separate preview-bag quantities. Accessories and Sets are available in shopping tabs. Source discrepancies are documented in public/products/SOURCES.md. Prices and stock remain pending.

Added five Garnier products with owner-supplied sizes. Ombrelle and Fructis share the Garnier brand selection. Individual product cutouts use the built-in image tool; prices and stock remain pending. The catalog now contains 31 product/size entries.
