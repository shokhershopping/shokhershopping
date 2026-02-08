import { Image } from '@prisma/client';
import prisma from '../../prismaClient';
import { CustomError } from '../../utils/CustomError';

export const createImage = async (
    image: Omit<Image, 'createdAt' | 'updatedAt' | 'productId' | 'variantId'>
): Promise<Image> => {
    try {
        const createdImage = await prisma.image.create({
            data: {
                filename: image.filename,
                size: image.size,
                mimetype: image.mimetype,
                fieldname: image.fieldname,
                originalname: image.originalname,
                encoding: image.encoding,
                destination: image.destination,
                path: image.path,
            },
        });

        return createdImage;
    } catch (error) {
        throw new CustomError('Error occurred while creating image', 500);
    }
};

export const createImages = async (
    images: Omit<Image, 'createdAt' | 'updatedAt' | 'productId' | 'variantId'>[]
): Promise<Image[]> => {
    try {
        const createdImages = await prisma.image.createManyAndReturn({
            data: images.map((image) => ({
                filename: image.filename,
                size: image.size,
                mimetype: image.mimetype,
                fieldname: image.fieldname,
                originalname: image.originalname,
                encoding: image.encoding,
                destination: image.destination,
                path: image.path,
            })),
            skipDuplicates: true,
        });

        return createdImages;
    } catch (error) {
        throw new CustomError('Error occurred while creating images', 500);
    }
};
