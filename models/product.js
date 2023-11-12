const mongoose = require('mongoose');
function convertBase64 (buffer) {

        return Buffer.from(buffer, 'base64')
    
}
const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    image: {
        data: Buffer,
        contentType: String,
    },
    images: [{
        data: Buffer,
        contentType: String
    }],
    brand: {
        type: String,
        default: ''
    },
    price : {
        type: Number,
        default:0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    },
    rating: {
        type: Number,
        default: 0,
    },
    numRated: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: true,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
})

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true,
});


exports.Product = mongoose.model('Product', productSchema);
