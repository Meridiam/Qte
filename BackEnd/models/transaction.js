var mongoose = require('mongoose');

module.exports = mongoose.model('Transaction', {
    date: { type: Date, required: true, default: Date.now()},
    sender: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    recipient: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    amount: Number
});