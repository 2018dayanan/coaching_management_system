const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OtpSchema = new Schema({
  identifier: { type: String, required: true }, 
  type: { 
    type: String, 
    enum: ['email_verification', 'phone_verification', 'password_reset', 'login_otp'], 
    required: true 
  },
  otp: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' }, 
  tempUserId: { type: Schema.Types.ObjectId, ref: 'TempUser' }, 
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 5 },
  isVerified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now }
});

OtpSchema.index({ identifier: 1, type: 1, isVerified: 1 });
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ otp: 1, identifier: 1 });

module.exports = mongoose.model('Otp', OtpSchema);
