import express from 'express'
const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'UrbanClone API',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  })
})

export default router
