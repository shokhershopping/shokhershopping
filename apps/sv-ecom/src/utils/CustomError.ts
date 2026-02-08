// utils/CustomError.ts
export class CustomError extends Error {
    public statusCode: number;
    public code?: string;

    constructor(message: string, statusCode: number, code?: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'CustomError'; // Assign the custom error class name
    }
}
