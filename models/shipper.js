const mongoose = require('mongoose');

const shipperSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address:{
        type: String,
        default: null
    },
    passwordHash: {
        type: String,
        required: true,
    },
    description:{
        type: String,
        default: null
    },
    image:{
        type: String,
        default: null
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
});

shipperSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

shipperSchema.set('toJSON', {
    virtuals: true,
});

exports.Shipper = mongoose.model('Shipper', shipperSchema);
exports.shipperSchema = shipperSchema;
