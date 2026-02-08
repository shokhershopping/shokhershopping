import { Router } from 'express';
import {
    uploadController,
    uploadMultipleController,
    getFileController,
    deleteFileController,
} from './upload.controller';
import { upload } from '../../storage';
import { validate } from '../../middlewares/validate';
import { getOrDeleteFileSchema } from './req.types';
import {
    validateFileMetadata,
    validateMultipleFileMetadata,
} from '../../middlewares/fileMiddleware';

const router = Router();

router.post(
    '/',
    upload.single('image'),
    validateFileMetadata,
    uploadController
);

router.post(
    '/multiple',
    upload.array('images', 5),
    validateMultipleFileMetadata,
    uploadMultipleController
);

router.get('/:filePath', validate(getOrDeleteFileSchema), getFileController);
router.delete(
    '/:filePath*',
    validate(getOrDeleteFileSchema),
    deleteFileController
);

export default router;
