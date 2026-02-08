import { Router } from 'express';
import {
    createCouponController,
    deleteCouponController,
    getByCodeController,
    getByIdController,
    updateCouponController,
} from './coupon.controller';
import {
    createCouponSchema,
    deleteCouponSchema,
    getByCodeSchema,
    getByIdSchema,
    updateCouponSchema,
} from './req.types';
import { validate } from '../../middlewares/validate';

const router = Router();

router.get('/:id', validate(getByIdSchema), getByIdController);
router.get('/code/:code', validate(getByCodeSchema), getByCodeController);
router.post('/', validate(createCouponSchema), createCouponController);
router.put('/:id', validate(updateCouponSchema), updateCouponController);
router.delete('/:id', validate(deleteCouponSchema), deleteCouponController);

export default router;
