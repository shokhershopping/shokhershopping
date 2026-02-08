# CLAUDE.md - SV-Ecom API Backend

This file provides guidance for working with the SV-Ecom Express.js API backend application.

## Overview

SV-Ecom is the REST API backend for Shokher Shopping e-commerce platform. Built with Express.js, TypeScript, Prisma ORM, and PostgreSQL, it provides a complete backend solution for managing products, orders, users, categories, coupons, reviews, and more.

## Commands

```bash
# Development
pnpm dev                    # Start dev server with nodemon (http://localhost:4000)
pnpm build                  # Compile TypeScript to dist/
pnpm start                  # Start production server (node dist/server.js)
pnpm lint                   # Run ESLint and Prettier

# Prisma Commands
npx prisma generate         # Generate Prisma client
npx prisma migrate dev      # Run migrations in development
npx prisma migrate dev --name <name>  # Create and apply named migration
npx prisma studio           # Open Prisma Studio GUI
npx prisma db push          # Push schema changes without migrations
npx prisma db seed          # Run seed script (if configured)

# Docker Commands
pnpm dev:dc                 # Docker Compose dev: down, up, generate, migrate, studio
pnpm build:dc               # Docker Compose build
```

## Architecture

### Project Structure

```
src/
├── app.ts                  # Express app configuration
├── server.ts               # Server entry point
├── prismaClient.ts         # Prisma client singleton
├── storage.ts              # Multer file upload configuration
├── middlewares/            # Express middlewares
│   ├── globalErrorHandler.ts  # Global error handler
│   ├── validate.ts         # Zod validation middleware
│   └── fileMiddleware.ts   # File upload middleware
├── modules/                # Feature modules
│   ├── products/
│   │   ├── product.controller.ts
│   │   ├── product.service.ts
│   │   ├── product.routes.ts
│   │   └── req.types.ts    # Request/response types & Zod schemas
│   ├── categories/
│   ├── orders/
│   ├── coupons/
│   ├── reviews/
│   ├── wishlists/
│   ├── users/
│   ├── notifications/
│   ├── uploads/
│   └── clerk-webhook/      # Clerk webhook integration
├── types/                  # Shared TypeScript types
└── utils/                  # Utility functions
    ├── CustomError.ts      # Custom error class
    ├── permissions.ts      # Permission utilities
    └── queryBuilder.ts     # Query builder utilities

prisma/
├── schema.prisma           # Prisma database schema
└── migrations/             # Database migration files

uploads/                    # Uploaded files (YYYY/MM structure)
```

### Key Features & Patterns

**Modular Architecture**
Each feature follows a consistent module pattern:
1. **Routes** (`*.routes.ts`) - Express router, defines endpoints
2. **Controller** (`*.controller.ts`) - Request/response handlers
3. **Service** (`*.service.ts`) - Business logic and database operations
4. **Types** (`req.types.ts`) - TypeScript types and Zod validation schemas

Example module structure:
```
modules/products/
├── product.routes.ts      # GET /products, POST /products, etc.
├── product.controller.ts  # getAllProducts, createProductController, etc.
├── product.service.ts     # Business logic, Prisma queries
└── req.types.ts          # Zod schemas and TypeScript types
```

**Authentication**
- Clerk authentication via `@clerk/express`
- Middleware: `clerkMiddleware()` applied globally in `app.ts`
- Protected routes use `requireAuth()` middleware
- Webhook endpoint `/clerk-webhook` syncs users to database
- User events: `user.created`, `user.updated`, `user.deleted`

**Database (Prisma)**
- PostgreSQL database
- ORM: Prisma Client
- Schema: `prisma/schema.prisma`
- Client singleton: `src/prismaClient.ts`
- Migrations in `prisma/migrations/`

**Validation**
- Zod schemas for all request validation
- Validation middleware in `src/middlewares/validate.ts`
- Schemas defined in each module's `req.types.ts`
- Validates: `req.body`, `req.query`, `req.params`

Example usage:
```typescript
router.post('/', validate(productCreateZodSchema), createProductController);
```

**Error Handling**
- Custom error class: `CustomError` in `src/utils/CustomError.ts`
- Global error middleware: `src/middlewares/globalErrorHandler.ts`
- Handles:
  - `CustomError` - Application errors with status codes
  - `Prisma.PrismaClientKnownRequestError` - Database errors
  - Generic errors - 500 Internal Server Error

**File Uploads**
- Multer for file uploads
- Storage configuration: `src/storage.ts`
- Upload directory: `uploads/YYYY/MM/` (organized by year/month)
- Unique filenames: `timestamp-randomhex.ext`
- Static file serving: `app.use('/uploads', express.static('uploads'))`
- Upload routes: `/uploads` endpoint

**CORS**
- Enabled for all origins (`origin: '*'`)
- Allowed methods: GET, POST, PUT, DELETE
- Allowed headers: Content-Type, Authorization

### Database Schema

**Key Models** (see `prisma/schema.prisma` for complete schema):

*User*
- Synced with Clerk via webhook
- Fields: id, email, name, image, role (USER/ADMIN)
- Relations: reviews, addresses, carts, orders, wishlist, notifications, etc.

*Product*
- Base product with variants (VariableProduct)
- Fields: name, description, price, salePrice, stock, status, kind, images, specifications
- Supports: simple products and variable products
- Relations: categories (many-to-many), variants, reviews, cart items, order items

*VariableProduct*
- Product variations (size, color, etc.)
- Own pricing, stock, SKU, images, specifications
- Relations: parent product, reviews, cart items, order items

*Category*
- Hierarchical structure (parent/child)
- Fields: name, description, image, sliderImage, isFeatured, isSlide, isMenu
- Relations: parent, children, products (many-to-many)

*Order*
- Full order tracking with status workflow
- Fields: status, deliveryCharge, deliveryOption, total, discounts, netTotal
- Relations: user, items, transaction, coupon, shippingAddress, affiliates

*Coupon*
- Discount coupons with usage tracking
- Types: PERCENTAGE, FIXED
- Fields: code, amount, type, minimum, maximum, limit, used, expiry, status
- Relations: creator, eligible users, orders

*Review*
- Product reviews with approval workflow
- Status: PENDING → APPROVED/REJECTED
- Fields: rating, comment, status
- Relations: user, product or variant

*Cart/CartItem*
- Shopping cart management
- Each user has one cart with multiple items
- Cart items reference product or variant

*Wishlist/WishlistItem*
- User wishlists
- Each user has one wishlist with multiple items
- Items reference product or variant

*Notification*
- Notification system with recipients
- Fields: title, message, actionLink
- Recipient tracking: isRead, readAt

*Image*
- File metadata for uploaded images
- Fields: filename, mimetype, size, path, destination
- Relations: products, variants, categories, size guides

**Enums**
- Role: USER, ADMIN
- PaymentMethod: COD, BKASH, SSLCOMMERZ
- OrderStatus: PENDING, PROCESSING, DISPATCHED, DELIVERED, CANCELLED
- ProductType: PHYSICAL, DIGITAL
- ProductStatus: DRAFT, PUBLISHED, ARCHIVED
- CouponType: PERCENTAGE, FIXED
- ReviewStatus: PENDING, APPROVED, REJECTED
- And more...

### API Endpoints

**Products** (`/products`)
- GET `/` - List all products (with filters)
- GET `/top-selling` - Top selling products
- GET `/latest` - Latest products
- GET `/featured` - Featured products
- GET `/slider` - Slider products
- GET `/:id` - Get product by ID
- POST `/` - Create product
- POST `/:id` - Update product
- DELETE `/:id` - Delete product

**Categories** (`/categories`)
- GET `/` - List all categories
- POST `/` - Create category
- PUT `/:id` - Update category
- DELETE `/:id` - Delete category

**Orders** (`/orders`)
- GET `/` - List all orders
- POST `/` - Create order
- PUT `/:id` - Update order
- DELETE `/:id` - Delete order

**Coupons** (`/coupons`)
- GET `/` - List all coupons
- POST `/` - Create coupon
- PUT `/:id` - Update coupon
- DELETE `/:id` - Delete coupon

**Reviews** (`/reviews`)
- GET `/` - List all reviews
- POST `/` - Create review
- PUT `/:id` - Update review (approve/reject)
- DELETE `/:id` - Delete review

**Wishlists** (`/wishlists`)
- GET `/` - Get user wishlist
- POST `/` - Add item to wishlist
- DELETE `/:id` - Remove item from wishlist

**Users** (`/users`)
- GET `/` - List all users
- GET `/:id` - Get user by ID
- PUT `/:id` - Update user
- DELETE `/:id` - Delete user

**Notifications** (`/notifications`)
- GET `/` - Get user notifications
- POST `/` - Create notification
- PUT `/:id/read` - Mark as read

**Uploads** (`/uploads`)
- POST `/` - Upload file(s)
- Static file serving at `/uploads/*`

**Clerk Webhook** (`/clerk-webhook`)
- POST `/` - Clerk webhook for user sync
- Handles: user.created, user.updated, user.deleted

### Environment Variables

Required environment variables (create `.env` file):

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Server
PORT=4000
NODE_ENV=development

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
CLERK_WEBHOOK_SIGNING_SECRET=""

# File Uploads (optional)
UPLOAD_FOLDER="uploads"
```

### Development Workflow

**Database Migrations**
1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <migration_name>`
3. Prisma generates migration files and applies them
4. Run `npx prisma generate` to update Prisma Client

**Adding a New Module**
1. Create folder in `src/modules/<feature>/`
2. Create files:
   - `<feature>.routes.ts` - Express router
   - `<feature>.controller.ts` - Request handlers
   - `<feature>.service.ts` - Business logic
   - `req.types.ts` - Zod schemas and types
3. Import routes in `src/app.ts`
4. Add to Prisma schema if needed
5. Run migration

**Request Validation Pattern**
```typescript
// In req.types.ts
export const createProductZodSchema = z.object({
  body: z.object({
    name: z.string(),
    price: z.number().positive(),
    // ... more fields
  }),
  query: z.object({}),
  params: z.object({})
});

// In routes.ts
import { validate } from '../../middlewares/validate';
import { createProductZodSchema } from './req.types';

router.post('/', validate(createProductZodSchema), createProductController);
```

**Error Handling Pattern**
```typescript
// In service.ts
import { CustomError } from '../../utils/CustomError';

if (!product) {
  throw new CustomError('Product not found', 404);
}
```

**Clerk Webhook Setup**
1. Configure webhook URL in Clerk dashboard: `https://your-api.com/clerk-webhook`
2. Copy webhook signing secret to `CLERK_WEBHOOK_SIGNING_SECRET`
3. Webhook automatically syncs users to database
4. No manual user creation needed

**File Upload Pattern**
```typescript
import { upload } from '../../storage';

// Single file
router.post('/upload', upload.single('file'), uploadController);

// Multiple files
router.post('/upload', upload.array('files', 10), uploadController);

// Access file in controller
const file = req.file; // or req.files
```

### Prisma Client Usage

**Get Client**
```typescript
import prisma from '../../prismaClient';
```

**Common Operations**
```typescript
// Find many with filters
const products = await prisma.product.findMany({
  where: { status: 'PUBLISHED' },
  include: { categories: true, images: true },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0
});

// Create
const product = await prisma.product.create({
  data: {
    name: 'Product',
    price: 100,
    // ...
  }
});

// Update
const updated = await prisma.product.update({
  where: { id: productId },
  data: { price: 150 }
});

// Delete
const deleted = await prisma.product.delete({
  where: { id: productId }
});

// Upsert
const user = await prisma.user.upsert({
  where: { id: userId },
  update: { name: 'New Name' },
  create: { id: userId, email: 'email@example.com' }
});
```

### Development Tips

1. **Prisma Studio**: Use `npx prisma studio` to browse/edit database via GUI

2. **Type Safety**: Prisma Client is fully typed - leverage TypeScript autocomplete

3. **Transactions**: Use Prisma transactions for multi-step operations:
   ```typescript
   await prisma.$transaction(async (tx) => {
     // Multiple operations
   });
   ```

4. **Seeding**: Create `prisma/seed.ts` to seed database with initial data

5. **Relations**: Use Prisma's `include` and `select` to fetch related data

6. **Pagination**: Use `take` and `skip` for pagination

7. **Filtering**: Build dynamic `where` clauses for complex filters

8. **Testing**: Use separate test database, reset between tests

9. **Logging**: Enable Prisma query logging in development:
   ```typescript
   const prisma = new PrismaClient({ log: ['query'] });
   ```

10. **Performance**: Use Prisma's query optimization features, add database indexes

### Common Tasks

**Adding a New Endpoint**
1. Define route in `<feature>.routes.ts`
2. Create controller function in `<feature>.controller.ts`
3. Implement business logic in `<feature>.service.ts`
4. Add Zod schema to `req.types.ts`
5. Apply validation middleware to route

**Modifying Database Schema**
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <description>`
3. Update affected services/controllers
4. Regenerate types: `npx prisma generate`

**Adding File Upload to Endpoint**
1. Import `upload` from `src/storage.ts`
2. Add middleware: `upload.single('fieldname')` or `upload.array('fieldname')`
3. Access file via `req.file` or `req.files`
4. Save file metadata to database (Image model)

**Clerk User Sync**
- Automatic via webhook
- Manual sync: Create/update user in database when webhook fires
- User ID matches Clerk user ID

**Adding Permissions**
1. Check user role in controller: `req.auth.userId`
2. Fetch user from database to check role
3. Throw `CustomError` if unauthorized
4. Use `requireAuth()` middleware for protected routes

### Important Notes

- **Clerk Integration**: Backend relies on Clerk webhook to sync users - ensure webhook is configured
- **File Uploads**: Files stored in `uploads/YYYY/MM/` structure - ensure directory is writable
- **CORS**: Currently allows all origins (`*`) - restrict for production
- **Error Handling**: Always use `CustomError` for predictable error responses
- **Validation**: All inputs validated with Zod - never skip validation
- **Database**: PostgreSQL required - connection string in `DATABASE_URL`
- **Migrations**: Always use migrations in production - never use `db push`
- **Static Files**: Uploaded files served at `/uploads/*` - ensure correct path in frontend
- **Product Variants**: Products can have variants (VariableProduct) - handle both cases
- **Review Workflow**: Reviews start as PENDING - admin must approve
- **Order Status**: Orders follow status workflow - validate state transitions
