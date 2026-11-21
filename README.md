# Authéra · AutheraCare

A skincare, beauty and everyday-care storefront for Authéra, serving customers in Bangladesh.

**[Visit autheracare.com](https://www.autheracare.com/)**

## Features

- Browse products by category, brand, season and skin type.
- Search the catalog with suggestions and individual product detail pages.
- Explore visual category cards, seasonal product animations and a looping Hot Selling Products strip.
- Save favourites, manage cart quantities and follow product enquiry links.
- View video reels, animated feedback cards and a scrolling monochrome brand strip.
- Sign in, manage an account and view order history.
- Manage products, brands, customers, orders and revenue through protected admin pages.
- Use Cash on Delivery checkout when ordering is enabled.
- Share website links with the branded social preview image.

Hot Selling Products is a curated selection. Feedback content and illustrative ratings are currently maintained in the frontend component.

## Technology

Next.js App Router, React, TypeScript, Tailwind CSS, CSS Modules, Supabase Authentication and PostgreSQL, Zod and Lucide icons.

## Run locally

Use Node.js **20.9 or newer** and npm. The application lives in the website directory.

~~~bash
git clone https://github.com/samiajahan15/autheracare.git
cd autheracare/website
npm ci
~~~

Copy .env.example to .env.local inside website, then fill in the settings for your environment.

~~~bash
npm run dev
~~~

Open [localhost:3000](http://localhost:3000/).

To use the development address used during storefront design work, run the following command.

~~~bash
npm run dev -- --hostname 127.0.0.1 --port 3037
~~~

Open [127.0.0.1:3037](http://127.0.0.1:3037/). Keep the development process running while browsing.

## Environment variables

| Variable | Purpose |
| --- | --- |
| NEXT_PUBLIC_SITE_URL | Public site address, or local development address. |
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL. |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Public Supabase publishable key. |
| DATABASE_URL | Server-only PostgreSQL connection string. |
| COD_ENABLED | Set to true to enable configured Cash on Delivery checkout. |
| NEXT_PUBLIC_WHATSAPP_NUMBER | Business WhatsApp number with country code, digits only. |

Keep local settings in .env.local. Store deployment credentials in the hosting environment. Database credentials and secret/service-role keys belong only on the server.

## Database and administration

The storefront reads active products from Supabase. If the connection fails, it can display the bundled preview catalog with a notice.

- [Catalog, administrator and storage setup](website/supabase/README.md)
- [Orders and payments](website/supabase/PAYMENTS.md)
- [Google sign-in setup](website/supabase/GOOGLE-AUTH.md)

The admin area starts at /admin. Product editing, customer management and order management require an authenticated administrator. Cash on Delivery ordering requires a configured database and COD_ENABLED=true.

## Useful routes

| Route | Page |
| --- | --- |
| / | Homepage |
| /shop/collection | All products |
| /shop/lip-makeup | Lip care and makeup |
| /shop/season/winter | Winter collection |
| /products/[id] | Product details |
| /search?q=... | Product search |
| /blog | Journal |
| /account | Customer account |
| /account/orders | Order history |
| /checkout | Cash on Delivery checkout |
| /admin | Administration |

## Development checks

Run these commands from website.

~~~bash
npm run typecheck
npm run lint
npm run build
~~~

Start the production build locally with npm start. Feature-specific checks are available in website/scripts. Database and authenticated workflows also need their configured services and appropriate test accounts.

## Deployment

The production site is hosted on Vercel.

1. Connect this repository and use website as the project root.
2. Configure environment variables for the target environment.
3. Follow the backend guides when provisioning a new database installation.
4. Build with npm run build.
5. Verify catalog access, product links, sign-in, ordering configuration and social previews after deployment.

The current sharing image is website/public/social/authera-montreal-approved-v3.jpg. Metadata references are in website/src/app/layout.tsx. When replacing the banner, use a new image filename and update its metadata references so sharing services can fetch it.

## Repository layout

~~~text
website/
  src/app/          Pages, API routes and shared styles
  src/components/   Storefront, account and admin interfaces
  src/lib/          Catalog, authentication and order logic
  public/           Product photos, branding and videos
  scripts/          Catalog maintenance and feature checks
  supabase/         Database setup and backend guides
assets/             Original branding assets
~~~

Brand wordmark sources are recorded in website/src/lib/catalog/brand-wordmarks.json. Product image notes are maintained in website/public/products/SOURCES.md.

Authéra branding, product photography and third-party brand marks retain their respective ownership.
