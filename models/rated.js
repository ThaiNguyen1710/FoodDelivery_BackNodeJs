const mongoose = require('mongoose');

const ratedSchema = mongoose.Schema({
    quantity: {
        type: Number,
        default:0
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

exports.Rated = mongoose.model('Rated', ratedSchema);

