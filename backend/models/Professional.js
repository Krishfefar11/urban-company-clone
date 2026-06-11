import mongoose from 'mongoose'

const professionalSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  services:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  bio:         { type: String, default: '' },
  experience:  { type: Number, default: 0 },           // years
  city:        { type: String, required: true },
  areas:       [{ type: String }],                      // serviceable areas
  rating:      { type: Number, default: 0 },
  totalReviews:{ type: Number, default: 0 },
  totalEarnings:{ type: Number, default: 0 },
  status:      { type: String, enum: ['pending', 'approved', 'rejected', 'suspended'], default: 'pending' },
  documents: {
    idProof:        { type: String },                   // Cloudinary URL
    addressProof:   { type: String },
    certificate:    { type: String },
  },
  availability: {
    mon: { type: Boolean, default: true },
    tue: { type: Boolean, default: true },
    wed: { type: Boolean, default: true },
    thu: { type: Boolean, default: true },
    fri: { type: Boolean, default: true },
    sat: { type: Boolean, default: true },
    sun: { type: Boolean, default: false },
    startTime: { type: String, default: '08:00' },
    endTime:   { type: String, default: '20:00' },
  },
  isOnline:   { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('Professional', professionalSchema)
