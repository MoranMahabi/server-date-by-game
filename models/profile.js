const mongoose = require('mongoose');
const profilesSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        uid: String,
        displayName: String,
        gender: String,
        seeking: String,
        age: Number,
        city: String,
        isOnline: Boolean,
        imageMain: String,
        imageList: { type: [String], default: [] }
    }
);

module.exports = mongoose.model('Profiles', profilesSchema);