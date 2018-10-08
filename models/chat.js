const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Message = new Schema(
    {
        name: String,
        date: Date,
        message: String
    },
    {
        _id: false,
        collection: null,
        versionKey: false,
    }
);

const chatsSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        uid1: String,
        uid2: String,
        messages: { type: [Message], default: [] }
    }
);

module.exports = mongoose.model('Chats', chatsSchema);