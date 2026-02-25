# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**App-Specific Documentation**: Each app has its own detailed CLAUDE.md file:

- [Isomorphic Admin Dashboard](./apps/isomorphic/CLAUDE.md) - Complete admin dashboard documentation
- [Shokhershop Storefront](./apps/shokhershop/CLAUDE.md) - Customer-facing app documentation

## Project Overview

Shokher Shopping is a Turborepo monorepo containing two main applications and a shared Firebase backend package:

1. **isomorphic** (`apps/isomorphic`) - Admin dashboard built with Next.js 15, React 19, TypeScript, and Firebase Auth
2. **shokhershop** (`apps/shokhershop`) - Customer-facing e-commerce storefront built with Next.js 15, React 19, and Firebase Auth
3. **firebase-config** (`packages/firebase-config`) - Shared Firebase backend package with Firestore services, auth helpers, storage utilities, and types

## Commands

### Development

```bash
# Run all apps in development mode
pnpm dev

# Run specific app
cd apps/isomorphic && pnpm dev
cd apps/shokhershop && pnpm dev
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

**firebase-config** (`firebase-config`)

- Firebase Admin SDK & Client SDK initialization
- Firestore service layer (11 services: user, category, product, order, invoice, review, wishlist, coupon, notification, dashboard, cart)
- Auth helpers (session cookies, token verification, user management)
- Storage helpers (file upload/download/delete to Firebase Storage)
- TypeScript types for all Firestore collections
- Collection name constants
- Response helpers (`successResponse`, `errorResponse`, `IResponse<T>`)
- Pagination helpers (`paginateQuery`, `parsePaginationParams`)
- Query builder (`buildQuery`, `generateSearchTokens`)
- Located at: `packages/firebase-config`

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
- Authentication: Firebase Auth (email/password + Google sign-in) via `FirebaseAuthProvider`
- Session management: Firebase session cookies (`__session`)
- API: Next.js API Routes (`src/app/api/`) calling firebase-config services
- UI Components: Custom component library (rizzui) + workspace `core` package
- State Management: Jotai
- Styling: Tailwind CSS with custom design system from `tailwind-config`
- Layout system: Multiple layouts (Hydrogen, Helium, Lithium, etc.) in `src/layouts/`
- Route configuration: Centralized in `src/config/routes.ts`
- Feature modules organized by domain in `src/app/` (products, orders, categories, coupons, etc.)
- Shared components in `src/app/shared/` and from `@core/*`

**shokhershop** - Customer Storefront

- Next.js 15 with React 19
- Authentication: Firebase Auth via `FirebaseAuthProvider` with session cookie middleware
- Public routes: `/`, `/login`, `/register`, `/product-detail/*`, `/shop/*`, `/checkout`
- Protected routes: All others require authentication
- API: Next.js API Routes (`app/api/`) calling firebase-config services
- Component structure: Organized by feature in `components/` (homes, shop, shopDetails, blogs, etc.)
- Route groups in `app/`: (homes), (shop), (shop-details), (otherPages), (dashboard), (blogs)

### Backend (Firebase)

**Database: Cloud Firestore**

Key collections:

- **users** - Links to Firebase Auth, has role (USER/ADMIN)
- **products** - Base products with variants (subcollection), categories, images, reviews
- **categories** - Hierarchical with parent/child relationships, featured/slider support
- **orders** - Full order processing with items, shipping, coupons
- **carts** - Shopping cart with items array
- **coupons** - Discount coupons with usage limits, expiry, min/max amounts
- **reviews** - Product reviews with approval workflow
- **wishlists** - User wishlist with items array
- **notifications** - Notification system with read/unread tracking
- **invoices** - Invoice records linked to orders

**Authentication: Firebase Auth**

- Email/password and Google sign-in
- Session cookies for server-side auth (`__session` cookie)
- Middleware checks cookie existence; API routes verify with Firebase Admin SDK

**Storage: Firebase Storage**

- File uploads via Next.js API routes
- Public URLs for uploaded files
- `resolveImageUrl()` helper for legacy path compatibility

### Service Layer Pattern

All Firestore services follow this pattern (in `packages/firebase-config/src/services/`):

```typescript
import { adminDb } from '../admin';
import { Collections } from '../collections/index';
import { successResponse, errorResponse } from '../helpers/response';
import { paginateQuery } from '../helpers/pagination';

const collection = adminDb.collection(Collections.COLLECTION_NAME);

export async function getItems(limit = 10, page = 1) {
  const query = collection.orderBy('createdAt', 'desc');
  const result = await paginateQuery(query, { limit, page });
  return successResponse(result.data, 'Retrieved successfully', {
    total: result.total, page: result.page, limit: result.limit
  });
}
```

### API Route Pattern

All Next.js API routes follow this pattern:

```typescript
import { NextResponse } from 'next/server';
import { getItems } from 'firebase-config/services/item.service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const result = await getItems(limit, page);
  return NextResponse.json(result, {
    status: result.status === 'success' ? 200 : (result.code || 500)
  });
}
```

### Technology Stack

**Frontend (isomorphic & shokhershop)**

- Next.js 15 with App Router
- React 19
- TypeScript (isomorphic) / JavaScript (shokhershop)
- Firebase Auth for authentication
- Tailwind CSS
- Form handling: react-hook-form with zod validation
- Charts: recharts
- Tables: @tanstack/react-table
- File uploads: Firebase Storage via API routes
- Email templates: react-email

**Backend (firebase-config package)**

- Firebase Admin SDK (server-side Firestore, Auth, Storage)
- Firebase Client SDK (client-side Auth)
- Next.js API Routes as the API layer
- TypeScript

**Monorepo Tools**

- pnpm workspaces
- Turborepo for build orchestration
- Shared package manager: pnpm@9.15.0
- Node.js >=18 required

## Development Workflow

1. **Authentication Flow**: Both frontend apps use Firebase Auth. On sign-in, a session cookie (`__session`) is created via `/api/auth/session`. Middleware checks cookie presence. API routes verify tokens with Firebase Admin SDK. User records are synced to Firestore `users` collection.

2. **API Integration**: Both apps use Next.js API Routes that call firebase-config service functions. No separate backend server needed.

3. **Environment Variables**:

   - isomorphic: See `.env.local.example` for Firebase config
   - shokhershop: See `.env.local.example` for Firebase config
   - Both apps need Firebase Client SDK keys (NEXT_PUBLIC_FIREBASE_*) and Admin SDK credentials (FIREBASE_*)

4. **Adding New Features**: Create a service in `packages/firebase-config/src/services/`, export it from `packages/firebase-config/src/index.ts`, then create API routes in the app's `app/api/` directory.

## Important Notes

- Admin dashboard (isomorphic) supports multiple layout presets - default is HYDROGEN (configured in `src/config/site.config.tsx`)
- Products can be simple or have variants - handle both cases when building product features
- Image uploads go to Firebase Storage; legacy images may use relative paths resolved by `getImageUrl()` helper
- Firebase Auth is the single source of truth for authentication
- Review system requires admin approval (ReviewStatus: PENDING → APPROVED/REJECTED)
- Coupon system supports percentage and fixed discounts with min/max amounts and usage limits
- Response format: `{ status: 'success'|'error', message: string, data: T | null, total?, page?, limit? }`
