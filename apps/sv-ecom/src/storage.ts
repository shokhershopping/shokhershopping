import multer, { StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Get the upload folder from the environment variable or default to 'uploads'
const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || 'uploads';

// Ensure the upload folder exists
if (!fs.existsSync(UPLOAD_FOLDER)) {
    fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
}

// Helper function to create a directory if it doesn't exist
const createDirectoryIfNotExists = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Set up Multer storage with unique filenames and dynamic folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Get the current year and month
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0'); // Ensure 2-digit month format

        // Set the destination path for the upload
        const uploadDir = path.join('uploads', year.toString(), month);

        // Create the directory if it doesn't exist
        createDirectoryIfNotExists(uploadDir);

        // Set the destination
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate a unique filename using a timestamp and random string
        const uniqueSuffix =
            Date.now() + '-' + crypto.randomBytes(6).toString('hex');
        const fileExtension = path.extname(file.originalname).toLowerCase(); // Preserve file extension
        cb(null, uniqueSuffix + fileExtension); // Concatenate unique suffix with file extension
    },
});

// Initialize multer with the storage configuration
export const upload = multer({ storage });
