const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    pricePerUnit: {
        usd: {
            type: Number,
            required: true,
            min: 0
        },
        lrd: {
            type: Number,
            required: true,
            min: 0
        }
    },
    totalAmount: {
        usd: {
            type: Number,
            required: true,
            min: 0
        },
        lrd: {
            type: Number,
            required: true,
            min: 0
        }
    }
});

const saleSchema = new mongoose.Schema({
    items: [saleItemSchema],
    store: {
        type: String,
        enum: ['store1', 'store2'],
        required: true
    },
    totalAmount: {
        usd: {
            type: Number,
            required: true,
            min: 0
        },
        lrd: {
            type: Number,
            required: true,
            min: 0
        }
    },
    paymentMethod: {
        type: String,
        enum: ['usd', 'lrd'],
        required: true
    },
    amountPaid: {
        type: Number,
        required: true,
        min: 0
    },
    soldBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    saleDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Sale', saleSchema);
