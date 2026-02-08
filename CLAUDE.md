# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**📖 App-Specific Documentation**: Each app has its own detailed CLAUDE.md file:

- [Isomorphic Admin Dashboard](./apps/isomorphic/CLAUDE.md) - Complete admin dashboard documentation
- [Shokhershop Storefront](./apps/shokhershop/CLAUDE.md) - Customer-facing app documentation
- [SV-Ecom API Backend](./apps/sv-ecom/CLAUDE.md) - Backend API documentation

Refer to the app-specific CLAUDE.md files for detailed information about each application's architecture, patterns, and development guidelines.

## Project Overview

Shokher Shopping is a Turborepo monorepo containing three main applications for an e-commerce platform:

1. **isomorphic** (`apps/isomorphic`) - Admin dashboard built with Next.js 15, React 19, TypeScript, and Clerk authentication
2. **shokhershop** (`apps/shokhershop`) - Customer-facing e-commerce storefront built with Next.js 15, React 19, and Clerk authentication
3. **sv-ecom** (`apps/sv-ecom`) - Express.js REST API backend with Prisma ORM and PostgreSQL

## Commands

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
cd apps/isomorphic && pnpm dev
cd apps/shokhershop && pnpm dev
cd apps/sv-ecom && pnpm dev
```

### Build & Test

```bash
# Build all apps
pnpm build

# Run tests (all apps)
pnpm test

# Lint all apps
pnpm lint

# Type check (isomorphic only)
cd apps/isomorphic && pnpm type:check

# Format code
pnpm format
```

### Backend (sv-ecom) Specific

```bash
# Start development server
cd apps/sv-ecom && pnpm dev

# Run Prisma migrations
cd apps/sv-ecom && npx prisma migrate dev --name <migration_name>

# Generate Prisma client
cd apps/sv-ecom && npx prisma generate

# Open Prisma Studio
cd apps/sv-ecom && npx prisma studio

# Build TypeScript
cd apps/sv-ecom && pnpm build

# Start production server
cd apps/sv-ecom && pnpm start
```

### Clean

```bash
# Clean all node_modules and build artifacts
pnpm clean

# Clean cache only (isomorphic)
cd apps/isomorphic && pnpm cache:clean
```

## Architecture

### Workspace Packages

The monorepo includes shared packages in `/packages`:

**isomorphic-core** (`core`)

- Shared UI components, hooks, and utilities for the isomorphic dashboard
- Contains most common dependencies to reduce duplication
- Exports components from `@core/*` path alias
- Located at: `packages/isomorphic-core`

**config-tailwind** (`tailwind-config`)

- Shared Tailwind CSS configuration
- Custom design tokens and themes
- Used by apps via `tailwind.config.ts` presets

**config-typescript** (`typescript-config`)

- Shared TypeScript configuration base files
- Provides `base.json`, `nextjs.json`, `react-library.json` configurations

### Apps Structure

**isomorphic** - Admin Dashboard

- Next.js 15 App Router with React 19
- Authentication: Clerk (`@clerk/nextjs`)
- UI Components: Custom component library (rizzui) + workspace `core` package
- State Management: Jotai
- Styling: Tailwind CSS with custom design system from `tailwind-config`
- Layout system: Multiple layouts (Hydrogen, Helium, Lithium, etc.) in `src/layouts/`
- Route configuration: Centralized in `src/config/routes.ts`
- Feature modules organized by domain in `src/app/` (products, orders, categories, coupons, etc.)
- Shared components in `src/app/shared/` and from `@core/*`

**shokhershop** - Customer Storefront

- Next.js 15 with React 19
- Authentication: Clerk with route protection middleware
- Public routes: `/`, `/sign-in`, `/product-detail/*`, `/shop/*`, `/checkout`
- Protected routes: All others require authentication
- Component structure: Organized by feature in `components/` (homes, shop, shopDetails, blogs, etc.)
- Route groups in `app/`: (homes), (shop), (shop-details), (otherPages), (dashboard), (blogs)

**sv-ecom** - Express API Backend

- Express.js with TypeScript
- Database: PostgreSQL with Prisma ORM
- Authentication: Clerk Express SDK (`@clerk/express`)
- Architecture: Modular structure with controllers, services, and routes per feature
- Module structure in `src/modules/`:
  - products - Product management with variants, images, specifications
  - categories - Category hierarchy with images
  - orders - Order processing with status tracking
  - coupons - Discount coupon system
  - reviews - Product review system with approval workflow
  - wishlists - User wishlist functionality
  - users - User management synced with Clerk
  - notifications - Notification system with recipients
  - clerk-webhook - Clerk webhook handler for user sync
  - uploads - File upload handling (multer)
- Global error handling middleware
- CORS enabled for all origins
- Static file serving from `/uploads`

### Database Schema (Prisma)

Key models:

- **User** - Links to Clerk auth, has role (USER/ADMIN)
- **Product** - Base products with variants (VariableProduct), categories, images, reviews
- **VariableProduct** - Product variations with own pricing, stock, SKU
- **Category** - Hierarchical with parent/child relationships, featured/slider support
- **Order** - Full order processing with items, shipping, coupons, affiliates
- **Cart/CartItem** - Shopping cart system
- **Coupon** - Discount coupons with usage limits, expiry, min/max amounts
- **Review** - Product reviews with approval workflow
- **Wishlist/WishlistItem** - User wishlist
- **Notification** - Notification system with read/unread tracking
- **Affiliate** - Affiliate program with clicks, purchases, withdrawals

Enums: Role, PaymentMethod, OrderStatus, ProductType, ProductStatus, DiscountType, CouponType, CouponStatus, ReviewStatus, AffiliateStatus, etc.

### Technology Stack

**Frontend (isomorphic & shokhershop)**

- Next.js 15 with App Router
- React 19
- TypeScript
- Clerk for authentication
- Tailwind CSS
- Form handling: react-hook-form with zod validation
- Charts: recharts
- Tables: @tanstack/react-table
- File uploads: uploadthing
- Email templates: react-email

**Backend (sv-ecom)**

- Express.js with TypeScript
- Prisma ORM with PostgreSQL
- Clerk for authentication
- File uploads: multer
- Validation: zod
- Environment: dotenv

**Monorepo Toolss**

- pnpm workspaces
- Turborepo for build orchestration
- Shared package manager: pnpm@9.15.0
- Node.js >=18 required

## Development Workflow

1. **Authentication Flow**: Both frontend apps use Clerk. Backend syncs users via webhook at `/clerk-webhook`. User creation/update in Clerk triggers webhook to create/update user in database.

2. **API Integration**: Frontend apps consume REST API from sv-ecom. API routes in `src/modules/*/routes.ts` follow RESTful patterns.

3. **Environment Variables**:

   - isomorphic: See `.env.local.example` for Google Maps API, NextAuth config
   - shokhershop: Requires Clerk keys in `.env.local`
   - sv-ecom: Requires `DATABASE_URL` and Clerk keys in `.env`

4. **Database Migrations**: Always run `npx prisma generate` after schema changes. Use `npx prisma migrate dev` for development migrations.

5. **Module Pattern (sv-ecom)**: Each feature has `*.controller.ts` (route handlers), `*.service.ts` (business logic), `*.routes.ts` (Express router), `req.types.ts` (request/response types).

## Important Notes

- Admin dashboard (isomorphic) supports multiple layout presets - default is HYDROGEN (configured in `src/config/site.config.tsx`)
- Products can be simple or have variants (VariableProduct) - handle both cases when building product features
- Image uploads are handled by sv-ecom and stored in `/uploads` directory, served as static files
- Clerk is the single source of truth for authentication - webhook ensures database stays in sync
- Review system requires admin approval (ReviewStatus: PENDING → APPROVED/REJECTED)
- Affiliate system tracks clicks and purchases for commission calculation
- Coupon system supports percentage and fixed discounts with min/max amounts and usage limits
