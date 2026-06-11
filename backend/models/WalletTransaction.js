import mongoose from 'mongoose'

const walletTransactionSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:        { type: String, enum: ['credit', 'debit'], required: true },
  amount:      { type: Number, required: true, min: 0 },
  description: { type: String, required: true },
  bookingId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
  balanceAfter:{ type: Number, required: true },  // snapshot for audit trail
}, { timestamps: true })

walletTransactionSchema.index({ user: 1, createdAt: -1 })

export default mongoose.model('WalletTransaction', walletTransactionSchema)
