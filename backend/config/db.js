import mongoose from 'mongoose'

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,   // fail fast in dev
    socketTimeoutMS:          10000,
  })
  console.log(`✅ MongoDB connected: ${conn.connection.host}`)
}

export default connectDB
