import express, { Application } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import globalErrorMiddleware from './middlewares/globalErrorHandler';

// Import routes
import userRoutes from './modules/users/user.routes';
import productRoutes from './modules/products/product.routes';
import uploadRoutes from './modules/uploads/upload.routes';
import categoryRoutes from './modules/categories/category.routes';
import clerkWebhookRoutes from './modules/clerk-webhook/clerk-webhook.routes';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import couponRoutes from './modules/coupons/coupon.routes';
import orderRoutes from './modules/orders/order.routes';
import reviewsRoutes from './modules/reviews/review.routes';
import wishListRoutes from './modules/wishlists/wishlist.routes';
import invoiceRoutes from './modules/invoices/invoice.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

// Load environment variables
config();

const app: Application = express();

// Middleware
app.use(
    cors({
        origin: '*', // Allow all origins
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allow GET, POST, PUT, DELETE, PATCH methods
        allowedHeaders: ['Content-Type', 'Authorization'], // Allow only Content-Type and Authorization headers
    })
);
app.use(clerkMiddleware());
app.use('/clerk-webhook', clerkWebhookRoutes);
app.use(express.json());
app.use('/uploads', express.static('uploads'));
// Routes
app.use(
    '/users',
    // requireAuth({ signInUrl: '/unauthenticated' }),
    userRoutes
);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/uploads', uploadRoutes);
app.use('/coupons', couponRoutes);
app.use('/orders', orderRoutes);
app.use('/reviews', reviewsRoutes);
app.use('/wishlists', wishListRoutes);
app.use('/invoices', invoiceRoutes);
app.use('/dashboard', dashboardRoutes);

app.use('/unauthenticated', (req, res) => {
    res.status(403).json({ message: 'You are not authenticated' });
});

app.use('/unauthorized', (req, res) => {
    res.status(401).json({
        message: 'You are not authorized to take this action',
    });
});
// Error handling middleware
app.use(globalErrorMiddleware);
export default app;
