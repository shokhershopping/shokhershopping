import { z } from 'zod';

// Schema to validate the incoming file data
export const fileUploadSchema = z.object({
    mimetype: z
        .string()
        .refine(
            (mimetype) => mimetype.startsWith('image/'),
            'File must be an image (jpg, png, etc.)'
        ),
    size: z.number().refine(
        (size) => size <= 5 * 1024 * 1024, // Max size 5MB
        'File size must be less than or equal to 5MB'
    ),
});

// Schema for the Update operation
export const getOrDeleteFileSchema = z.object({
    params: z.object({
        filePath: z.string().min(1, { message: 'Filename is required' }),
    }),
});
