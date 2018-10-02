const mongoose = require('mongoose');
const configSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        one: String,
        two: String
    }
);

module.exports= mongoose.model('Config', configSchema);