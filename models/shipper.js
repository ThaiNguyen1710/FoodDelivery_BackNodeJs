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
    },
    passwordHash: {
        type: String,
        required: true,
    },
    description:{
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    image:{
        type: String,
    }
});

shipperSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

shipperSchema.set('toJSON', {
    virtuals: true,
});

exports.Shipper = mongoose.model('Shipper', shipperSchema);
exports.shipperSchema = shipperSchema;
