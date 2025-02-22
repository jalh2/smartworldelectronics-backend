const mongoose = require('mongoose');

const quantityHistorySchema = new mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['addition', 'subtraction', 'sale', 'initial', 'update'],
        required: true
    },
    usdPrice: {
        type: Number,
        default: 0
    },
    lrdPrice: {
        type: Number,
        default: 0
    }
});

const priceHistorySchema = new mongoose.Schema({
    usdPrice: {
        type: Number,
        required: true
    },
    lrdPrice: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    currentQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    store: {
        type: String,
        enum: ['store1', 'store2'],
        required: true
    },
    currentUsdPrice: {
        type: Number,
        required: false,
        default: 0
    },
    currentLrdPrice: {
        type: Number,
        required: false,
        default: 0
    },
    images: [{
        filename: String,
        path: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    quantityHistory: [quantityHistorySchema],
    priceHistory: [priceHistorySchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
