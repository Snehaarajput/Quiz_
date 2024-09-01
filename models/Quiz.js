const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const QuizSchema = new Schema({
    creatorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quizName: {
        type: String,
        required: true,
        trim: true
    },
    quizType: {
        type: String,
        enum: ['Q&A', 'Poll'],
        required: true
    },
    impressions: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    questions: [{
        type: Schema.Types.ObjectId,
        ref: 'Question'
    }]
});

module.exports = mongoose.model('Quiz', QuizSchema);
