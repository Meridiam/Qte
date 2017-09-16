var mongoose = require('mongoose');

module.exports = mongoose.model('User', {
    email: String,
    password: String,
    bankID: String,
    recentTransactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
});