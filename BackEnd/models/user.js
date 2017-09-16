var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
    username: String,
    password: String,
    email: String,
    firstname: String,
    lastname: String,
    bankID: String,
    recentTransactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
    isVendor: { type: Boolean, required: true, default: false }
});