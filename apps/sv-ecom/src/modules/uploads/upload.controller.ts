import e, { NextFunction, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createImage, createImages } from './upload.service';
const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || 'uploads';

export const uploadController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.file) {
            res.status(400).send('No file uploaded.');
        }
        const image = req.file;

        if (!image) {
            res.status(400).json({
                success: false,
                errors: [
                    {
                        field: 'file',
                        message: 'No file uploaded.',
                    },
                ],
            });
            return;
        }

        const createdImage = await createImage({
            filename: image.filename,
            size: image.size,
            mimetype: image.mimetype,
            fieldname: image.fieldname,
            originalname: image.originalname,
            encoding: image.encoding,
            destination: image.destination,
            path: image.path,
        });
        res.status(200).json({
            message: 'File uploaded successfully!',
            file: createdImage,
        });
    } catch (error) {
        return next(error);
    }
};

export const uploadMultipleController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.files) {
            res.status(400).send('No files uploaded.');
        }

        const images = req.files as Express.Multer.File[];
        if (!images || images.length === 0) {
            res.status(400).json({
                success: false,
                errors: [
                    {
                        field: 'files',
                        message: 'No files uploaded.',
                    },
                ],
            });
            return;
        }
        const createdImages = await createImages(
            images.map((image) => ({
                filename: image.filename,
                size: image.size,
                mimetype: image.mimetype,
                fieldname: image.fieldname,
                originalname: image.originalname,
                encoding: image.encoding,
                destination: image.destination,
                path: image.path,
            }))
        );

        res.status(200).json({
            message: 'Files uploaded successfully!',
            files: createdImages,
        });
    } catch (error) {
        return next(error);
    }
};

export const getFileController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const filePath = path.join(
            __dirname,
            '../../../' + UPLOAD_FOLDER,
            req.params.filename
        );
        console.log(filePath);
        // Check if the file exists
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath); // Serve the image to the client
        } else {
            res.status(404).json({
                success: false,
                errors: [
                    {
                        field: 'file',
                        message: 'File not found.',
                    },
                ],
            });
        }
    } catch (error) {
        return next(error);
    }
};

export const deleteFileController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const filePath = req.params.filePath + req.params[0];
        // Check if the file exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Delete the file
            res.status(200).json({
                success: true,
                message: 'File deleted successfully!',
            });
        } else {
            res.status(404).json({
                success: false,
                errors: [
                    {
                        field: 'file',
                        message: 'File not found.',
                    },
                ],
            });
        }
    } catch (error) {
        return next(error);
    }
};
