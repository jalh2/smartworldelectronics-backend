const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'manager'],
        required: true
    },
    store: {
        type: String,
        enum: ['store1', 'store2'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date
    }
});

// Hash password
userSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.password = crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('hex');
};

// Verify password
userSchema.methods.verifyPassword = function(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('hex');
    return this.password === hash;
};

const User = mongoose.model('User', userSchema);

// Drop all indexes and recreate only the compound index
User.collection.dropIndexes().then(() => {
    User.collection.createIndex(
        { username: 1, store: 1 },
        { unique: true }
    );
});

module.exports = User;
