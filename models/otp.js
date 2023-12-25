const mongoose = require('mongoose');

const otpSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresIn: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
