import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  phone:       { type: String, default: '' },
  role:        { type: String, enum: ['user', 'professional', 'admin'], default: 'user' },
  avatar:      { type: String, default: '' },
  city:        { type: String, default: '' },
  addresses: [{
    type:      { type: String, enum: ['home', 'work', 'other'], default: 'home' },
    label:     { type: String, default: '' },
    line1:     { type: String, default: '' },
    line2:     { type: String, default: '' },
    city:      { type: String, default: '' },
    pincode:   { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
  }],
  walletBalance:  { type: Number, default: 0 },
  phoneVerified:  { type: Boolean, default: false },
  fcmTokens:      [{ type: String }],               // Firebase Cloud Messaging device tokens
  isActive:    { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now },
}, { timestamps: true })

export default mongoose.model('User', userSchema)
