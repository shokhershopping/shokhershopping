# CLAUDE.md - Isomorphic Admin Dashboard

This file provides guidance for working with the Isomorphic admin dashboard application.

## Overview

Isomorphic is a comprehensive admin dashboard for the Shokher Shopping e-commerce platform. Built with Next.js 15, React 19, and TypeScript, it provides a full-featured admin interface for managing products, orders, categories, coupons, reviews, and more.

**Workspace Packages**: This app uses shared workspace packages from `/packages`:
- `core` (isomorphic-core) - Shared components, hooks, utilities, and UI elements
- `tailwind-config` - Shared Tailwind CSS configuration
- `typescript-config` - Shared TypeScript configuration

The `core` package contains most of the dependencies and shared code, reducing duplication across apps.

## Commands

```bash
# Development
pnpm dev                    # Start dev server (http://localhost:3000)
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run ESLint
pnpm type:check             # TypeScript type checking
pnpm format                 # Format code with Prettier
pnpm cache:clean            # Clear Next.js cache
pnpm clean                  # Clean all build artifacts and node_modules
```

## Architecture

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (hydrogen)/        # Hydrogen layout route group
│   ├── (other-pages)/     # Other pages layout group
│   ├── api/               # API routes (uploadthing)
│   ├── products/          # Product management pages
│   ├── orders/            # Order management pages
│   ├── categories/        # Category management pages
│   ├── coupons/           # Coupon management pages
│   ├── reviews/           # Review management pages
│   ├── notifications/     # Notification pages
│   ├── transactions/      # Transaction pages
│   ├── cart/              # Shopping cart pages
│   ├── checkout/          # Checkout pages
│   ├── shop/              # Shop frontend pages
│   ├── profile-settings/  # User profile pages
│   ├── auth/              # Authentication pages
│   ├── sign-in/           # Sign-in page
│   ├── multi-step/        # Multi-step form examples
│   └── shared/            # Shared components used across pages
├── components/            # Reusable components
├── config/                # Configuration files
│   ├── routes.ts          # Route definitions
│   ├── api.ts             # API endpoint definitions
│   ├── site.config.tsx    # Site configuration
│   ├── enums.ts           # Enum definitions
│   ├── constants.ts       # Constants
│   └── messages.ts        # Message templates
├── data/                  # Mock/static data
├── email-templates/       # React Email templates
├── layouts/               # Layout components
│   ├── hydrogen/          # Hydrogen layout (default)
│   ├── helium/            # Helium layout
│   ├── lithium/           # Lithium layout
│   ├── beryllium/         # Beryllium layout
│   ├── boron/             # Boron layout
│   └── carbon/            # Carbon layout
├── server/                # Server-side code
│   ├── actions/           # Server actions
│   ├── uploadthing.ts     # UploadThing configuration
│   └── delete-file.ts     # File deletion utilities
├── store/                 # State management (Jotai)
│   ├── checkout.ts        # Checkout state
│   └── quick-cart/        # Quick cart state
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── validators/            # Zod validation schemas
│   ├── create-product.schema.ts
│   ├── create-invoice.schema.ts
│   ├── login.schema.ts
│   ├── profile-settings.schema.ts
│   └── ... (many more)
└── env.mjs                # Environment variable validation
```

### Key Features & Patterns

**Layout System**
- Six different layout presets: Hydrogen (default), Helium, Lithium, Beryllium, Boron, Carbon
- Default layout set in `src/config/site.config.tsx` via `LAYOUT_OPTIONS.HYDROGEN`
- Each layout has its own sidebar, header, and navigation configuration
- Layout switcher available in settings for testing different layouts

**Route Management**
- Centralized route definitions in `src/config/routes.ts`
- Use route helper functions for dynamic paths:
  ```typescript
  routes.eCommerce.productDetails(slug)
  routes.eCommerce.editCategory(id)
  routes.eCommerce.orderDetails(id)
  ```
- API endpoints defined in `src/config/api.ts`

**Authentication**
- Clerk authentication (`@clerk/nextjs`)
- Middleware in `src/middleware.ts` handles auth protection
- User session available via `useAuth()` and `useUser()` hooks
- Sign-in page at `/sign-in`

**State Management**
- Jotai for global state (lightweight atomic state management)
- Checkout state in `src/store/checkout.ts`
- Quick cart state in `src/store/quick-cart/`
- Server actions in `src/server/actions/` for data mutations

**Form Validation**
- Zod schemas in `src/validators/`
- React Hook Form with Zod resolver (`@hookform/resolvers/zod`)
- Common validation rules in `src/validators/common-rules.ts`
- Example usage:
  ```typescript
  import { createProductSchema } from '@/validators/create-product.schema';
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(createProductSchema)
  });
  ```

**File Uploads**
- UploadThing integration for file uploads
- Configuration in `src/server/uploadthing.ts`
- API routes at `/api/uploadthing`
- Delete file utility in `src/server/delete-file.ts`

**Shared Components**
- Extensive shared component library in `src/app/shared/`
- Domain-specific components:
  - `ecommerce/` - E-commerce widgets
  - `analytics-dashboard/` - Analytics charts
  - `invoice/` - Invoice components
  - `tables/` - Reusable table components
  - `chart-widgets/` - Chart components
  - `file-upload.tsx` - File upload component
  - `page-header.tsx` - Page header component
  - `modal-button.tsx`, `export-button.tsx`, etc.

**UI Component Library**
- Built on `rizzui` design system
- Additional UI utilities:
  - `@headlessui/react` - Unstyled UI components
  - `@floating-ui/react` - Tooltips, popovers
  - `@dnd-kit/*` - Drag and drop
  - `motion` (Framer Motion) - Animations

**Data Tables**
- `@tanstack/react-table` for complex tables
- `rc-table` for simpler tables
- Table components in `src/app/shared/tables/`

**Charts & Visualizations**
- `recharts` for charts and graphs
- Chart widgets in `src/app/shared/chart-widgets/`
- Analytics dashboard components in `src/app/shared/analytics-dashboard/`

**Email Templates**
- React Email components in `src/email-templates/`
- Preview and send emails using React components
- SMTP configuration via environment variables

### Environment Variables

Required environment variables (see `.env.local.example`):

```bash
# Google Maps (optional)
NEXT_PUBLIC_GOOGLE_MAP_API_KEY=""

# NextAuth (if using)
NEXTAUTH_SECRET=""
NEXTAUTH_URL=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# SMTP (for email functionality)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM_EMAIL=""

# App Name
NEXT_PUBLIC_APP_NAME="Isomorphic"

# Clerk (for authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
```

Validated using `@t3-oss/env-nextjs` in `src/env.mjs`

### Image Domains

Allowed image domains (configured in `next.config.mjs`):
- `randomuser.me` - User avatars
- `cloudflare-ipfs.com` - IPFS content
- `avatars.githubusercontent.com` - GitHub avatars
- `picsum.photos` - Placeholder images
- `flagcdn.com` - Country flags
- `utfs.io` - UploadThing
- `images.unsplash.com` - Unsplash images
- `s3.amazonaws.com` - AWS S3
- `img.clerk.com` - Clerk images
- `placehold.co` - Placeholder service
- `api.shokhershopping.com` - Backend API images
- `localhost` - Local development

### Page Structure Pattern

Most admin pages follow this structure:
1. Page component in `app/{feature}/page.tsx`
2. Shared components in `app/shared/{feature}/`
3. Validation schemas in `validators/{feature}.schema.ts`
4. API endpoint definitions in `config/api.ts`
5. Route definitions in `config/routes.ts`

Example: Product Management
- List page: `app/products/page.tsx`
- Create page: `app/products/create/page.tsx`
- Edit page: `app/products/[slug]/edit/page.tsx`
- Details page: `app/products/[slug]/page.tsx`
- Shared components: `app/shared/ecommerce/product/`
- Schema: `validators/create-product.schema.ts`
- Routes: `routes.eCommerce.products`, `routes.eCommerce.createProduct()`

### Data Management

**Backend Integration**
- API base URL should be configured to point to `sv-ecom` backend
- Uses standard REST API calls with fetch/axios
- API endpoint patterns defined in `src/config/api.ts`

**Mock Data**
- Static/demo data in `src/data/` directory
- Used for development and demos when backend is unavailable

### Styling

- Tailwind CSS with custom configuration in `tailwind.config.ts`
- Custom design tokens and presets
- Container queries via `@tailwindcss/container-queries`
- `tailwind-merge` and `clsx` for dynamic class composition
- Prettier plugin for class sorting: `prettier-plugin-tailwindcss`

### Development Tips

1. **Route Groups**: Use route groups `(hydrogen)`, `(other-pages)` to apply different layouts without affecting URL structure

2. **Type Safety**: Leverage TypeScript strictly - types defined in `src/types/`

3. **Validation**: Always use Zod schemas from `src/validators/` for form validation

4. **Images**: Use Next.js `<Image>` component with appropriate remote patterns configured

5. **Server Actions**: Place server actions in `src/server/actions/` and mark with `'use server'`

6. **State**: Prefer Jotai atoms for global state, React state for local component state

7. **Icons**: Use `react-icons` library - extensive icon sets available

8. **Forms**: Use `react-hook-form` with `@hookform/resolvers/zod` for all forms

9. **Tables**: Use `@tanstack/react-table` for complex data tables with sorting, filtering, pagination

10. **File Uploads**: Use UploadThing integration - already configured in `src/server/uploadthing.ts`

### Common Tasks

**Adding a New Page**
1. Create page in `src/app/{feature}/page.tsx`
2. Add route to `src/config/routes.ts`
3. Create validation schema in `src/validators/{feature}.schema.ts`
4. Add shared components in `src/app/shared/{feature}/`
5. Update navigation in layout if needed

**Adding a New Form**
1. Create Zod schema in `src/validators/`
2. Use `useForm` with `zodResolver`
3. Create form UI with form components from `rizzui` or `@headlessui/react`
4. Handle submission with server action or API call

**Adding API Integration**
1. Define endpoint in `src/config/api.ts`
2. Create fetch/axios call (consider using SWR or React Query)
3. Handle loading, error, and success states
4. Update types in `src/types/`
