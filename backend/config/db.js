import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,   // fail fast in dev
      socketTimeoutMS:          10000,
    })
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(`❌ MongoDB connection failed: ${err.message}`)
    throw err
  }
}

export default connectDB
