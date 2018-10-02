const mongoose = require('mongoose');
const questionBankSchema = mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        question: String
    }
);

module.exports= mongoose.model('QuestionBank', questionBankSchema);