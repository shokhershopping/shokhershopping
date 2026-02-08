import { Router } from 'express';
import {
    addToWishlistController,
    removeFromWishlistController,
    findAllByUserIdController,
} from './wishlist.controller';

import {
    addToWishlistSchema,
    removeFromWishlistSchema,
    findAllByUserIdSchema,
} from './req.types';
import { validate } from '../../middlewares/validate';

const router = Router();
router.get(
    '/:userId',
    validate(findAllByUserIdSchema),
    findAllByUserIdController
);
router.post('/', validate(addToWishlistSchema), addToWishlistController);
router.post(
    '/remove',
    validate(removeFromWishlistSchema),
    removeFromWishlistController
);
export default router;
