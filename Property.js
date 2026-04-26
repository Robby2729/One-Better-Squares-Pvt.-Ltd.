const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: String, required: true }, // E.g. "1.5 Cr", "50 L"
    loc: { type: String, required: true },
    desc: { type: String, required: true },
    tag: { type: String, default: 'New Launch' },
    bhk: { type: String, required: true }, // "1", "2", "3", "4+"
    listingType: { type: String, enum: ['buy', 'rent'], default: 'buy' },
    images: [{ type: String }], // Array of image URLs/base64
    features: [{ type: String }], // Array of features
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['active', 'sold'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Property', PropertySchema);
