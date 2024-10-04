import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'upload');

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new formidable.IncomingForm(); // Initialize formidable form

  // Ensure the upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Parse the incoming request
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Error parsing the files:', err);
      return res.status(500).json({ error: 'Something went wrong during file upload.' });
    }

    // Check if the file was uploaded
    const file = Array.isArray(files.file) ? files.file[0] : files.file; // Get the first file
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Move the file to the desired location
    const newPath = path.join(uploadDir, file.originalFilename || 'uploaded_image.jpg');
    fs.rename(file.filepath, newPath, (renameErr) => {
      if (renameErr) {
        console.error('Error moving the file:', renameErr);
        return res.status(500).json({ error: 'Failed to save the uploaded file.' });
      }

      return res.status(200).json({ message: 'File uploaded successfully' });
    });
  });
}
