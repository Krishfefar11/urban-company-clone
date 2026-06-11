import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User',         required: true },
  professional:{ type: mongoose.Schema.Types.ObjectId, ref: 'Professional', default: null  },
  service:     { type: mongoose.Schema.Types.ObjectId, ref: 'Service',      required: true },
  pricingTier: { name: String, price: Number },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'on_the_way', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  scheduledAt: { type: Date, required: true },
  address: {
    line1:   { type: String, required: true },
    line2:   { type: String, default: '' },
    city:    { type: String, required: true },
    pincode: { type: String, default: '' },
    lat:     { type: Number },
    lng:     { type: Number },
  },
  payment: {
    method:  { type: String, enum: ['online', 'cash'], default: 'online' },
    status:  { type: String, enum: ['pending', 'paid', 'refunded'],       default: 'pending' },
    razorpayOrderId:   { type: String },
    razorpayPaymentId: { type: String },
    amount:  { type: Number },
    refundId:    { type: String, default: null },   // Razorpay refund ID
    refundError: { type: String, default: null },   // Manual review flag if refund failed
  },
  notes:       { type: String, default: '' },
  cancelReason:{ type: String, default: '' },
  completedAt: { type: Date },
}, { timestamps: true })

export default mongoose.model('Booking', bookingSchema)
