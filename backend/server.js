import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import connectDB from './config/db.js'
import logger from './utils/logger.js'
import swaggerSpec from './config/swagger.js'

// Routes
import authRoutes         from './routes/auth.js'
import userRoutes         from './routes/users.js'
import serviceRoutes      from './routes/services.js'
import bookingRoutes      from './routes/bookings.js'
import professionalRoutes from './routes/professionals.js'
import reviewRoutes       from './routes/reviews.js'
import paymentRoutes      from './routes/payments.js'
import walletRoutes       from './routes/wallet.js'
import adminRoutes        from './routes/admin.js'
import uploadRoutes       from './routes/upload.js'
import messageRoutes      from './routes/messages.js'

dotenv.config()

const app        = express()
const httpServer = createServer(app)

// ── Security: helmet must be first ──────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", 'checkout.razorpay.com'],
      connectSrc:  ["'self'", '*.firebaseapp.com', '*.googleapis.com', 'api.razorpay.com'],
      imgSrc:      ["'self'", 'data:', 'res.cloudinary.com', '*.picsum.photos'],
      frameSrc:    ['checkout.razorpay.com', 'api.razorpay.com'],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

// ── Rate limiting ────────────────────────────────────────────────────────────
// Global: 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
})

// Strict: 10 requests per 15 minutes on auth + payment routes
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests on this endpoint. Please wait.' },
})

app.use(globalLimiter)
app.use('/api/auth',     strictLimiter)
app.use('/api/payments', strictLimiter)

// ── Allowed origins (dev: 5173 + 5174, prod: FRONTEND_URL) ──────────────────
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean)

const corsOriginFn = (origin, cb) => {
  // Allow requests with no origin (curl, Postman, server-to-server)
  if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true)
  cb(new Error(`CORS: origin ${origin} not allowed`))
}

// ── Socket.io ────────────────────────────────────────────────────────────────
export const io = new Server(httpServer, {
  cors: { origin: corsOriginFn, methods: ['GET', 'POST'], credentials: true }
})

io.on('connection', socket => {
  socket.on('join_booking',   bookingId => {
    socket.join(`booking_${bookingId}`)
    logger.debug(`Socket joined booking_${bookingId}`)
  })
  socket.on('join_pro_room',  proId => {
    socket.join(`pro_${proId}`)
    logger.debug(`Socket joined pro_${proId}`)
  })
  socket.on('update_booking_status', ({ bookingId, status }) =>
    io.to(`booking_${bookingId}`).emit('booking_status_changed', { bookingId, status }))
  // In-booking chat
  socket.on('send_message', ({ bookingId, message }) =>
    io.to(`booking_${bookingId}`).emit('receive_message', message))
  socket.on('disconnect', () => {})
})

// ── Core middleware ──────────────────────────────────────────────────────────
app.use(cors({ origin: corsOriginFn, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Morgan HTTP request logging (stream to winston)
app.use(morgan('combined', {
  stream: { write: msg => logger.http(msg.trim()) },
  skip: (req) => req.url === '/api/health',  // don't log health-checks
}))

// ── Swagger UI ───────────────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'UrbanClone API Docs',
  swaggerOptions: { persistAuthorization: true },
}))
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec))

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', timestamp: new Date().toISOString() }))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes)
app.use('/api/users',         userRoutes)
app.use('/api/services',      serviceRoutes)
app.use('/api/bookings',      bookingRoutes)
app.use('/api/professionals', professionalRoutes)
app.use('/api/reviews',       reviewRoutes)
app.use('/api/payments',      paymentRoutes)
app.use('/api/wallet',        walletRoutes)
app.use('/api/admin',         adminRoutes)
app.use('/api/upload',        uploadRoutes)
app.use('/api/messages',      messageRoutes)

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.path} — ${err.message}`, err)
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' })
})

// ── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000

const startServer = () => {
  httpServer.listen(PORT, () =>
    logger.info(`🚀 Backend running → http://localhost:${PORT}`))
}

connectDB()
  .then(startServer)
  .catch(err => {
    logger.warn(`MongoDB unavailable — starting without DB: ${err.message}`)
    startServer()
  })
