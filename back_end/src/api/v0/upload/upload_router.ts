import express from 'express';
import multer from 'multer';
import { uploadToS3 } from '../../../utils/s3';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/v0/upload
router.post('/', upload.single('file'), async (req, res) => {
    const url = await uploadToS3(req.file.buffer, req.file.originalname);
    res.json({ success: true, url });
});

export default router;