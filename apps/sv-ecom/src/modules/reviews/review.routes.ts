import { Router } from 'express';

const router = Router();

import {
    createReviewController,
    deleteAllByProductIdController,
    deleteReviewController,
    findAllByProductIdController,
    findAllByUserIdController,
    findByIdController,
    updateReviewController,
} from './review.controller';

import {
    createReviewSchema,
    deleteAllByProductIdSchema,
    deleteReviewSchema,
    findAllByProductIdSchema,
    findAllByUserIdSchema,
    findByIdSchema,
    updateReviewSchema,
} from './req.types';

import { validate } from '../../middlewares/validate';

router.get(
    '/user/:userId',
    validate(findAllByUserIdSchema),
    findAllByUserIdController
);

router.get(
    '/product/:productId',
    validate(findAllByProductIdSchema),
    findAllByProductIdController
);

router.get('/:id', validate(findByIdSchema), findByIdController);
router.post('/', validate(createReviewSchema), createReviewController);
router.put('/:id', validate(updateReviewSchema), updateReviewController);
router.delete('/:id', validate(deleteReviewSchema), deleteReviewController);
router.delete(
    '/product/:productId',
    validate(deleteAllByProductIdSchema),
    deleteAllByProductIdController
);
export default router;
