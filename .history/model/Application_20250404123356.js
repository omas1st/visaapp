const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  destination: String,
  visaType: String,
  citizenship: String,
  email: String,
  phone: String,
  firstName: String,
  lastName: String,
  paymentMethod: String,
  receiptPath: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);