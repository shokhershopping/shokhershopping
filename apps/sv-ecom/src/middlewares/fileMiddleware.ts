import { NextFunction, Request, Response } from 'express';
import { fileUploadSchema } from '../modules/uploads/req.types';
import { ZodError } from 'zod';
import fs from 'fs';
// Custom middleware to validate the file metadata before Multer handles the file
export const validateFileMetadata = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate the file metadata using Zod
    try {
        fileUploadSchema.parse({
            mimetype: req.file?.mimetype,
            size: req.file?.size,
        });

        // Proceed to the next middleware (Multer's upload)
        next();
    } catch (error) {
        // If validation fails, send an error response
        if (error instanceof ZodError) {
            // remove the uploaded file
            if (req.file) {
                const filePath = req.file.path;
                fs.unlinkSync(filePath);
            }

            res.status(400).json({
                success: false,
                errors: error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }
    }
};

export const validateMultipleFileMetadata = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.files) {
        res.status(400).json({ message: 'No files uploaded' });
    }

    // Validate the file metadata using Zod
    try {
        (req.files as Express.Multer.File[]).forEach((file) => {
            fileUploadSchema.parse({
                mimetype: file.mimetype,
                size: file.size,
            });
        });

        // Proceed to the next middleware (Multer's upload)
        next();
    } catch (error) {
        // If validation fails, send an error response
        if (error instanceof ZodError) {
            // remove the uploaded files
            (req.files as Express.Multer.File[]).forEach((file) => {
                const filePath = file.path;
                fs.unlinkSync(filePath);
            });

            res.status(400).json({
                success: false,
                errors: error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }
    }
};
