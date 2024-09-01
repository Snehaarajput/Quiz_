const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const authenticateToken = require('../middleware/auth'); // Authentication middleware

// Create a new question
router.post('/questions', authenticateToken, async (req, res) => {
    const { quizId, questionText, options, timer } = req.body;

    try {
        const newQuestion = new Question({
            quizId,
            questionText,
            options,
            timer
        });

        const savedQuestion = await newQuestion.save();
        res.status(201).json(savedQuestion);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all questions for a specific quiz
router.get('/questions/:quizId', async (req, res) => {
    const { quizId } = req.params;

    try {
        const questions = await Question.find({ quizId });
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific question by ID
router.get('/questions/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a question
router.put('/questions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { questionText, options, timer } = req.body;

    try {
        const updatedQuestion = await Question.findByIdAndUpdate(
            id,
            { questionText, options, timer },
            { new: true, runValidators: true }
        );

        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json(updatedQuestion);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a question
router.delete('/questions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const deletedQuestion = await Question.findByIdAndDelete(id);

        if (!deletedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update question counters
router.post('/questions/:id/answer', async (req, res) => {
    const { id } = req.params;
    const { isCorrect } = req.body; // isCorrect should be true or false

    try {
        const question = await Question.findById(id);
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        question.totalAttendees += 1;
        if (isCorrect) {
            question.correctAnswers += 1;
        } else {
            question.incorrectAnswers += 1;
        }

        const updatedQuestion = await question.save();
        res.status(200).json(updatedQuestion);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
