# ShopNest

A hosted-store platform demo (Shopify-style): a complete storefront plus a CMS/admin that controls it.

**Live demo:** _LIVE_URL_

> Demo data is generated in the browser and saved to `localStorage`, so every visitor gets their own sandbox. Create, edit and delete freely — use **Reset demo data** to start over.

## Features

- Storefront: home page, collections with filters, product pages with variants, cart drawer, checkout, order confirmation, search, blog and CMS pages
- Discount codes at checkout (try WELCOME10, FREESHIP, SAVE20); free-shipping progress bar
- Admin: sales dashboard, orders (fulfil, refund, timeline), products editor (media, pricing, inventory, variants, SEO preview), collections, customers, discounts
- CMS: pages and blog posts editor — published straight to the storefront
- Visual theme editor with live preview (colours, presets, corner style, announcement bar, hero, homepage sections) on desktop & mobile
- Store settings: name, shipping rates, free-shipping threshold, tax
- Orders placed on the storefront appear in the admin instantly; inventory decrements automatically

## Tech stack

- React 18 + Vite
- Tailwind CSS v4
- React Router
- Recharts (charts) & Lucide (icons)
- Deployed on Vercel

## Run locally

```bash
npm install
npm run dev
```

Build for production with `npm run build` (outputs to `dist/`).

## Making it production-ready

This demo runs entirely in the browser. For a client project, the same UI connects to a real backend (e.g. Supabase / PostgreSQL + REST or tRPC API), with authentication, role-based permissions and server-side validation.
