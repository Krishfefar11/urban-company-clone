import mongoose from 'mongoose'

const promoCodeSchema = new mongoose.Schema({
  code:         { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discountValue:{ type: Number, required: true },         // % or fixed INR amount
  maxDiscount:  { type: Number, default: null },           // cap for percentage discounts
  minOrderAmount:{ type: Number, default: 0 },             // minimum booking amount
  usageLimit:   { type: Number, default: 1 },              // max total uses
  usedCount:    { type: Number, default: 0 },
  perUserLimit: { type: Number, default: 1 },              // uses per user
  expiresAt:    { type: Date,   required: true },
  isActive:     { type: Boolean, default: true },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

// Track per-user usage
const promoUsageSchema = new mongoose.Schema({
  promoCode: { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode', required: true },
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },
  usedAt:    { type: Date, default: Date.now },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
})

export const PromoUsage = mongoose.model('PromoUsage', promoUsageSchema)
export default mongoose.model('PromoCode', promoCodeSchema)
