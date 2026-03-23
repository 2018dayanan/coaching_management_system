const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },

  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
  },

  mobile: { type: String },

  password_hash: { type: String, required: true },

  role: {
    type: String,
    enum: ['teacher', 'student'],
    default: 'student',
  },

  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive',
  },

  profile_picture: {
    type: String,
    default: 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg'
  },

  address: String,
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'male',
  },
  date_of_birth: Date,

  last_login: Date,

  is_deleted: { type: Boolean, default: false },
  unique_id: {
    type: String,
    unique: true,
    sparse: true
  }
}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);