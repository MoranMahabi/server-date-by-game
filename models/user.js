const mongoose = require('mongoose');
const usersSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        surename: String
    }
);

module.exports= mongoose.model('Users', usersSchema);