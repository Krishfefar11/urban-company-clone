import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { authenticate } from '../middleware/auth.js'
import logger from '../utils/logger.js'

const router = express.Router()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },          // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed'))
  },
})

// POST /api/upload  — requires auth
router.post('/', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' })
    }

    const folder = req.body.folder || 'urbanclone'
    const b64     = req.file.buffer.toString('base64')
    const dataUri = `data:${req.file.mimetype};base64,${b64}`

    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      transformation: [
        { width: 1200, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    })

    logger.info(`Image uploaded to Cloudinary: ${result.public_id}`)
    res.json({ success: true, url: result.secure_url, publicId: result.public_id })
  } catch (err) {
    logger.error(`Cloudinary upload error: ${err.message}`)
    res.status(500).json({ success: false, message: err.message || 'Upload failed' })
  }
})

// Multer error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5 MB)' : err.message })
  }
  if (err) return res.status(400).json({ success: false, message: err.message })
  next()
})

export default router
