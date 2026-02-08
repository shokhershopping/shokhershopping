import { Router } from 'express';
import {
    getAllUsers,
    getUserByIdController,
    updateUserMetadataController,
    ensureUserExistsController,
} from './user.controller';

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUserByIdController);
router.patch('/:id/metadata', updateUserMetadataController);
router.post('/ensure', ensureUserExistsController);

export default router;
