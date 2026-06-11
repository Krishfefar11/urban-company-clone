import mongoose from 'mongoose'

const pricingTierSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
})

const serviceSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  slug:        { type: String, required: true, unique: true },
  category:    { type: String, required: true },
  description: { type: String, required: true },
  icon:        { type: String, default: '🔧' },
  image:       { type: String, default: '' },
  duration:    { type: String, required: true },
  includes:    [{ type: String }],
  excludes:    [{ type: String }],
  pricing:     [pricingTierSchema],
  rating:          { type: Number, default: 0 },
  totalReviews:    { type: Number, default: 0 },
  isActive:        { type: Boolean, default: true },
  tag:             { type: String, default: null },         // Bestseller / Trending / Popular
  availableCities: [{ type: String, lowercase: true }],    // city-based availability filter
}, { timestamps: true })

// Text index for full-text search on title, description, category
serviceSchema.index({ title: 'text', description: 'text', category: 'text' })

export default mongoose.model('Service', serviceSchema)
