import { ZodSchema, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate =
    (schema: ZodSchema) =>
    (req: Request, res: Response, next: NextFunction): void => {
        try {
            // Validate request data
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next(); // Proceed if validation passes
        } catch (error) {
            if (error instanceof ZodError) {
                // Format Zod errors
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                res.status(400).json({
                    success: false,
                    errors,
                });
                return;
            }
            next(error); // Handle non-validation errors
        }
    };
