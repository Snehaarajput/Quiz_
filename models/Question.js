const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz', // Reference to the Quiz model
        required: true
    },
    text: {
        type: String,
        required: true
    },
    options: [
        {
            optionText: {
                type: String
            },
            optionUrl:{
                type: String
            },
            isCorrect: {
                type: Boolean,
                required: true
            },
            optionCount: {
                type: Number,
                default: 0
            }
        }
    ],
    timer: {
        type: Number, // Timer in seconds
        default: 0
    },
    attempted:{
        type: Number,
        default: 0
    },
    correct: {
        type: Number,
        default: 0
    },
    incorrect: {
        type: Number,
        default: 0
    },
    answer:{
        type: Number,
        required: true
    }
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
