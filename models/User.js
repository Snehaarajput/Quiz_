const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
        // unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    quizzes: [{
        type: Schema.Types.ObjectId,
        ref: 'Quiz'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
