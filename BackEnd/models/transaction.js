var mongoose = require('mongoose');

module.exports = mongoose.model('Transaction', {
    date: { type: Date, required: true, default: Date.now()},
    payer: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    payee: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    amount: Number
});