import { Router } from 'express';
import {
    createOrderSchema,
    deleteOrderSchema,
    findAllByPaymentMethodSchema,
    findAllByProductIdSchema,
    findAllOrdersSchema,
    findByIdSchema,
    updateOrderSchema,
    updateOrderStatusSchema,
} from './req.types';
import {
    createOrderController,
    deleteOrderController,
    findAllByPaymentMethodController,
    findAllByProductIdController,
    getAllController,
    getByIdController,
    getByUserIdController,
    updateOrderController,
    updateOrderStatusController,
} from './order.controller';
import { validate } from '../../middlewares/validate';

const router = Router();

router.get('/', validate(findAllOrdersSchema), getAllController);
router.get('/:id', validate(findByIdSchema), getByIdController);
router.get(
    '/user/:userId',
    validate(findAllOrdersSchema),
    getByUserIdController
);
router.get(
    '/payment/:paymentMethod',
    validate(findAllByPaymentMethodSchema),
    findAllByPaymentMethodController
);
router.get(
    '/product/:productId',
    validate(findAllByProductIdSchema),
    findAllByProductIdController
);
router.post('/', validate(createOrderSchema), createOrderController);
router.put('/:id', validate(updateOrderSchema), updateOrderController);
router.delete('/:id', validate(deleteOrderSchema), deleteOrderController);
router.patch(
    '/:id/status',
    validate(updateOrderStatusSchema),
    updateOrderStatusController
);

export default router;
