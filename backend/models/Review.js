import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  booking:     { type: mongoose.Schema.Types.ObjectId, ref: 'Booking',      required: true },
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User',         required: true },
  professional:{ type: mongoose.Schema.Types.ObjectId, ref: 'Professional', required: true },
  service:     { type: mongoose.Schema.Types.ObjectId, ref: 'Service',      required: true },
  rating:      { type: Number, required: true, min: 1, max: 5 },
  comment:     { type: String, default: '' },
  isVerified:  { type: Boolean, default: true },   // came from a real booking
}, { timestamps: true })

export default mongoose.model('Review', reviewSchema)
