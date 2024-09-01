const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const User = require('../models/User')
const Question = require('../models/Question');
const { body, validationResult } = require('express-validator');

// Create a new quiz
router.post('/create', [
    // body('creatorId').notEmpty().withMessage('Creator ID is required'),
    // body('quizName').notEmpty().withMessage('Quiz name is required'),
    // body('quizType').isIn(['Q&A', 'Poll']).withMessage('Quiz type must be Q&A or Poll'),
    // body('questions').isArray().withMessage('Questions must be an array')
], async (req, res) => {
    // console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // const { creatorId, quizName, quizType, questions } = req.body;
    // console.log(req.body);
    const {quizData} = req.body;

    try {
        const newQuiz = new Quiz({
            creatorId : quizData.creatorId,
            quizName : quizData.quizName,
            quizType : quizData.quizType,
            // questions,
            impressions: 0
        });

        await newQuiz.save();
        await User.findByIdAndUpdate(
            quizData.creatorId,
            { $push: { quizzes: newQuiz._id } }, // Add quiz ID to the user's quizzes array
            { new: true }
        );


        const questions = quizData.questions;
        
        for (const questionData of questions) {
            const question = new Question({
                quizId : newQuiz.id,
                text : questionData.text,
                options : questionData.options,
                timer : questionData.timer,
                answer : questionData.answer
            });

            await question.save();
            // console.log(question);

            const updatedQuiz = await Quiz.findByIdAndUpdate(
                newQuiz.id,
                { $addToSet: { questions: question.id } }, // $addToSet ensures no duplicate entries
                { new: true, useFindAndModify: false } // Return the updated document
            );
            // console.log(updatedQuiz);
        }

        res.status(201).json(newQuiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Share a quiz
router.post('/:id/share', async (req, res) => {
    const quizId = req.params.id;

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        // Here you would generate a shareable link or send an email
        res.status(200).json({ message: 'Quiz shared successfully', quiz });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Take a quiz
router.post('/:id/take', async (req, res) => {
    const quizId = req.params.id;
    const { answers } = req.body; // Answers submitted by the user

    try {
        // await Quiz.findById(quizId);

        const quiz = await Quiz.findById(quizId).populate('questions');
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        let score = 0;
        if (quiz.quizType == 'Q&A') {
            quiz.questions.forEach(async (question, index) => {
                if (question.answer == answers[index]) {
                    score += 1;
                    await Question.findByIdAndUpdate(question.id, { $inc: { correct : 1 } });
                }else{
                    await Question.findByIdAndUpdate(question.id, { $inc: { incorrect: 1 } });
                }
                await Question.findByIdAndUpdate(question.id, { $inc: { attempted: 1 } });
            });
            res.status(200).json({ score });
        } else {
            quiz.questions.forEach(async (question, index) =>{
                if (answers[index] >= 0 && answers[index] <= 3) {
                    // Increment the optionCount for the chosen option
                    question.options[answers[index]].optionCount += 1;

                    // Save the updated question to the database
                    await question.save();
                }
            })
            res.status(200).json({ message: 'Poll completed' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//get all quizzes
router.get('/all', async (req, res) => {
    try {
        // Use .find() to retrieve all quizzes
        const quizzes = await Quiz.find({ impressions: { $gte: 10 } });

        // If quizzes is empty, return 404
        if (quizzes.length === 0) {
            return res.status(404).json({ message: 'No quizzes found' });
        }

        // Return the quizzes with a 200 status
        res.status(200).json(quizzes);
    } catch (error) {
        // Handle any errors that occur
        res.status(500).json({ message: error.message });
    }
});

// Get a quiz by ID
router.get('/:id', async (req, res) => {
    const quizId = req.params.id;

    try {
        await Quiz.findByIdAndUpdate(quizId, { $inc: { impressions: 1 } });
        const quiz = await Quiz.findById(quizId).populate('questions');
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        // console.log(quiz);
        res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Update a quiz
router.put('/:id', [
    body('name').optional().notEmpty().withMessage('Quiz name is required'),
    body('type').optional().isIn(['Q&A', 'Poll']).withMessage('Quiz type must be Q&A or Poll'),
    body('questions').optional().isArray().withMessage('Questions must be an array')
], async (req, res) => {
    const quizId = req.params.id;
    const { name, type, questions } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const updatedQuiz = await Quiz.findByIdAndUpdate(
            quizId,
            { name, type, questions },
            { new: true }
        );

        if (!updatedQuiz) return res.status(404).json({ message: 'Quiz not found' });

        res.status(200).json(updatedQuiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a quiz
router.delete('/:id', async (req, res) => {
    const quizId = req.params.id;

    try {
        const deletedQuiz = await Quiz.findByIdAndDelete(quizId);
        if (!deletedQuiz) return res.status(404).json({ message: 'Quiz not found' });

        res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
