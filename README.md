# AutheraCare

Authéra skincare storefront built with Next.js, React, and TypeScript.

## Run locally

Install Node.js, then open a terminal in this repository:

```bash
cd website
npm install
```

Copy `website/.env.example` to `website/.env.local` and update the values for your environment. From `website/`, start the development server:

```bash
npm run dev
```

Open http://localhost:3000. Keep the terminal running; press Ctrl+C to stop.

## Checks and production

Run from `website/`:

```bash
npm run typecheck
npm run lint
npm run build
npm start
```

## Project structure

- `website/src/`: application source and styles
- `website/public/`: product images, branding, and video reels
- `website/.env.example`: environment variable template
- `assets/`: original branding assets
- Root preview images: saved storefront previews

The storefront includes product search, category and brand filters, favorites, a preview bag, product dialogs, and an animated video carousel that automatically plays reels in sequence.

Checkout, payments, customer authentication, inventory, and database-backed orders still require implementation. The PostgreSQL driver and environment template are included; a database is not provisioned by cloning this repository.

Local secrets, installed dependencies, and generated build files are excluded from Git.