# CLAUDE.md - Shokhershop Customer Storefront

This file provides guidance for working with the Shokhershop customer-facing e-commerce storefront application.

## Overview

Shokhershop is the customer-facing e-commerce storefront for Shokher Shopping. Built with Next.js 15 and React 19, it provides a modern shopping experience with multiple home page styles, product browsing, cart management, and checkout functionality.

## Commands

```bash
# Development
pnpm dev                    # Start dev server (http://localhost:3000)
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run ESLint
```

## Architecture

### Project Structure

```
app/
├── (homes)/               # Home page variants (route group)
├── (shop)/                # Shop pages (route group)
│   ├── [...categorySlugs]/  # Dynamic category pages
│   ├── layout.jsx
│   └── page.jsx
├── (shop-details)/        # Product detail variants (route group)
├── (otherPages)/          # Other pages (route group)
├── (dashboard)/           # User dashboard (route group)
├── (blogs)/               # Blog pages (route group)
├── contact/               # Contact page
├── login/                 # Login page
├── sign-in/               # Clerk sign-in page
├── shop/                  # Shop page
├── store-locations/       # Store locations page
├── layout.js              # Root layout
├── page.jsx               # Home page
└── not-found.jsx          # 404 page

components/
├── blogs/                 # Blog components
├── common/                # Common/shared components
├── footers/               # Footer variants
├── headers/               # Header variants
├── homes/                 # Home page section components
│   ├── home-giftcard/
│   ├── home-fashion/
│   └── ... (multiple home styles)
├── modals/                # Modal components
│   ├── ShopCart.jsx
│   ├── QuickView.jsx
│   ├── SearchModal.jsx
│   ├── MobileMenu.jsx
│   └── ... (many modal types)
├── othersPages/           # Other page components
├── shop/                  # Shop listing components
├── shopCards/             # Product card variants
└── shopDetails/           # Product detail components

context/
└── Context.jsx            # Global context provider (cart, wishlist, etc.)

data/
├── products.js            # Product data/mock data
├── categories.js          # Category data
├── brands.js              # Brand data
├── menu.js                # Menu navigation data
└── ... (other static data)

lib/
└── apiClient.js           # API client for backend communication

utlis/                     # Utility functions
├── openCartModal.js
├── getPageTextFromCollections.js
└── wow.js

public/
├── css/                   # CSS files
├── fonts/                 # Font files
├── images/                # Static images
└── scss/                  # SCSS source files
    └── main.scss          # Main SCSS entry
```

### Key Features & Patterns

**Route Groups**
- `(homes)` - Multiple home page style variants (fashion, gift card, etc.)
- `(shop)` - Shop and category browsing pages
- `(shop-details)` - Product detail page variants
- `(otherPages)` - Additional pages (about, FAQ, etc.)
- `(dashboard)` - User dashboard and account pages
- `(blogs)` - Blog listing and detail pages

Route groups allow different layouts without affecting URLs.

**Authentication**
- Clerk authentication (`@clerk/nextjs`)
- Middleware in `middleware.ts` handles route protection
- Public routes: `/`, `/sign-in`, `/product-detail/*`, `/shop/*`, `/checkout`
- All other routes require authentication
- Clerk components: `SignedIn`, `SignedOut`, `UserButton` used throughout

**Global State Management**
- Context API in `context/Context.jsx`
- Manages:
  - Cart products (`cartProducts`)
  - Wishlist (`wishList`)
  - Compare items (`compareItem`)
  - Quick view item (`quickViewItem`)
  - Total price calculation (`totalPrice`)
  - Demo user data (`user`)
- Context accessed via `useContextElement()` hook

**Cart Management**
Key functions in Context:
```javascript
addProductToCart(product, qty)      // Add product to cart
isAddedToCartProducts(id)           // Check if product in cart
updateQuantity(id, qty)             // Update product quantity
// Similar functions for wishlist and compare
```

**Modal System**
Comprehensive modal system in `components/modals/`:
- `ShopCart.jsx` - Shopping cart modal
- `QuickView.jsx` - Quick view product modal
- `QuickAdd.jsx` - Quick add to cart modal
- `SearchModal.jsx` - Search modal
- `MobileMenu.jsx` - Mobile navigation menu
- `Compare.jsx` - Product comparison modal
- `Login.jsx` / `Register.jsx` - Auth modals
- `ProductSidebar.jsx` - Product filter sidebar
- `FindSize.jsx` - Size guide modal
- `DeliveryReturn.jsx` - Delivery/return info modal
- `AskQuestion.jsx` - Product question modal
- `NewsletterModal.jsx` - Newsletter signup

All modals are included in root layout and controlled via state/utils.

**API Integration**
- API client in `lib/apiClient.js`
- Features:
  - Optional caching (5-minute cache duration)
  - Category tree building
  - Fetches from `process.env.NEXT_PUBLIC_APP_URL`
- Example:
  ```javascript
  import { apiClient } from '@/lib/apiClient';
  const categories = await apiClient.fetchCategories();
  ```

**Component Patterns**

*Product Cards*
Multiple product card styles in `components/shopCards/`:
- Different layouts for different page contexts
- Variants for grid, list, featured products
- Include quick view, add to cart, wishlist actions

*Shop Components*
Shop listing components in `components/shop/`:
- `ShopFullwidth.jsx` - Full width shop layout
- `ShopSidebarRight.jsx` - Sidebar right layout
- `FilterSidebar.jsx` - Filter sidebar
- `Sidebar.jsx` - Category/brand sidebar
- `ShopFilter.jsx` - Filter controls
- `ShopLoadmoreOnScroll.jsx` - Infinite scroll

*Home Components*
Multiple home page styles in `components/homes/`:
- Each home variant has its own folder (e.g., `home-giftcard/`, `home-fashion/`)
- Sections: Hero, Categories, Products, Features, Testimonials, Blog, etc.
- Mix and match components for different home page styles

**Styling**
- Bootstrap 5 for grid and utilities
- Custom SCSS in `public/scss/main.scss`
- Compiled CSS served from `public/css/`
- Responsive design with Bootstrap breakpoints
- RTL support available via `RtlToggle` component

**Data Management**

*Static Data*
Data files in `data/` directory:
- `products.js` - Product catalog (exported as `allProducts`)
- `categories.js` - Category hierarchy
- `brands.js` - Brand list
- `menu.js` - Navigation menu structure
- `heroslides.js` - Homepage slider data
- `testimonials.js` - Customer testimonials
- `faqs.js` - FAQ content

*Dynamic Data*
- Fetched from backend API via `apiClient`
- Backend URL: `process.env.NEXT_PUBLIC_APP_URL`
- User data fetched and stored in context

### Environment Variables

Required environment variables:

```bash
# Backend API URL
NEXT_PUBLIC_APP_URL="http://localhost:4000"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
```

### Page Types

**Shop Pages**
- Dynamic routing: `/shop/[...categorySlugs]`
- Supports nested categories
- Filter by: category, price, brand, size, color, rating
- Sort by: featured, best selling, alphabetical, price, date
- Grid/list view toggle
- Pagination or infinite scroll

**Product Detail Pages**
- Multiple layout variants in `(shop-details)` route group
- Features:
  - Image gallery with zoom (PhotoSwipe, drift-zoom)
  - Product information tabs
  - Size/color selection
  - Quantity selector
  - Add to cart/wishlist/compare
  - Related products
  - Customer reviews
  - Q&A section
  - Size guide modal
  - Delivery/return info

**Home Pages**
- Multiple pre-built home page styles
- Sections typically include:
  - Hero slider
  - Category showcase
  - Featured products
  - Best sellers
  - Testimonials
  - Blog posts
  - Instagram feed
  - Newsletter signup

**Dashboard Pages**
- User account management
- Order history
- Wishlist
- Address book
- Account settings

### Third-Party Integrations

**UI Libraries**
- Bootstrap 5 - Grid system and utilities
- PhotoSwipe - Image gallery and lightbox
- rc-slider - Range sliders for filters
- Swiper - Carousels and sliders (if used)

**Image Handling**
- Next.js Image component with `unoptimized: true` (see `next.config.mjs`)
- PhotoSwipe for product galleries
- drift-zoom for product image zoom
- react-image-zoom alternative zoom

**Authentication**
- Clerk for user authentication
- Route protection via middleware
- User profile via `UserButton` component

**Styling & Animation**
- SCSS compilation
- Bootstrap for layout
- Custom animations and transitions
- WOW.js for scroll animations (in `utlis/wow.js`)

### Development Tips

1. **Route Groups**: Utilize route groups `(homes)`, `(shop)`, etc. to create variant pages without URL nesting

2. **Context Usage**: Access cart/wishlist via `useContextElement()`:
   ```javascript
   const { addProductToCart, cartProducts, totalPrice } = useContextElement();
   ```

3. **Modals**: All modals are globally available - trigger via state or utility functions (e.g., `openCartModal()`)

4. **Data Sources**:
   - Use static data from `data/` for development/fallback
   - Fetch dynamic data from backend via `apiClient`
   - Check `NEXT_PUBLIC_APP_URL` is set correctly

5. **Product Structure**: Products should have:
   - id, name, description, price, images
   - Optional: salePrice, brand, category, stock, variants

6. **Image Optimization**: Images are unoptimized by default - consider enabling optimization for production

7. **Styling**: Edit SCSS in `public/scss/`, compile to CSS, or use CSS directly

8. **Mobile Menu**: Mobile navigation via `MobileMenu.jsx` modal - trigger with hamburger button

9. **Bootstrap**: Bootstrap JS is dynamically imported in root layout - available for dropdowns, modals, etc.

10. **Error Handling**: Custom 404 page in `not-found.jsx`

### Common Tasks

**Adding a New Product**
1. Add to `data/products.js` or fetch from API
2. Use appropriate product card component from `components/shopCards/`
3. Ensure product has all required fields

**Creating a New Home Page Variant**
1. Create new folder in `components/homes/home-{variant}/`
2. Create section components (Hero, Products, etc.)
3. Create page in `app/(homes)/home-{variant}/page.jsx`
4. Import and compose section components

**Adding a Filter to Shop**
1. Update `ShopFilter.jsx` or `FilterSidebar.jsx`
2. Add filter state and logic
3. Apply filter to product list
4. Update URL params to persist filter state

**Customizing a Modal**
1. Find modal in `components/modals/`
2. Edit modal component
3. Modal is globally available via root layout

**Integrating with Backend**
1. Add method to `lib/apiClient.js`
2. Call from components/pages
3. Handle loading and error states
4. Update context if needed (for cart, wishlist, etc.)

**Styling Changes**
1. Edit SCSS in `public/scss/`
2. Compile SCSS to CSS or use existing CSS
3. Override Bootstrap variables if needed
4. Add custom classes to components

### Important Notes

- **Dynamic Categories**: Shop supports nested category routing via `[...categorySlugs]`
- **Context Performance**: Cart/wishlist state in context - consider optimization for large catalogs
- **Image Optimization**: Currently disabled (`unoptimized: true`) - enable for better performance
- **Bootstrap Dependency**: Bootstrap JS imported dynamically - ensure components work with dynamic imports
- **Clerk Integration**: Middleware protects routes - test both authenticated and public access
- **Demo Data**: Demo user fetched from API on mount - handle API failures gracefully
- **Modal Management**: All modals in root layout - optimize modal loading if performance issues
