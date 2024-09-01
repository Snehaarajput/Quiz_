const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Register a new user
router.post('/signup', [
    body('name').notEmpty().withMessage('name is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
        const saltRounds = 10; // Number of salt rounds
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({
            name,
            email,
            passwordHash: hashedPassword
        });

        // await User.register(newUser);
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        // res.status(500).json({ message: error.message });
        res.status(500).json({ message: "name or email already registered" });
    }
});

// Login user
router.post('/login', [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    // console.log(req.headers.authorization);
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).populate('quizzes');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const quizzes = user.quizzes;
        let totalQuizzes = quizzes.length;

        let totalQuestions = 0;
        let totalImpressions = 0;

        // Iterate over the quizzes array
        quizzes.forEach(quiz => {
            totalQuestions += quiz.questions.length; // Sum up the number of questions
            totalImpressions += quiz.impressions; // Sum up the impressions
        });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({
            message: 'Login successful',
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                totalQuestions,
                totalImpressions,
                totalQuizzes
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/:id/analytics', async(req, res)=>{
    const userId = req.params.id;

    try {
        const quizes = await User.findById(userId).populate('quizzes');
        if (!quizes) return res.status(404).json({ message: 'No quizes created yet' });

        res.status(200).json(quizes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user profile (requires authentication)
router.get('/profile', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).populate('quizzes');
        if (!user) return res.status(404).json({ message: 'User not found' });
        const quizzes = user.quizzes;
        
        let totalQuestions = 0;
        let totalImpressions = 0;

        // Iterate over the quizzes array
        quizzes.forEach(quiz => {
            totalQuestions += quiz.questions.length; // Sum up the number of questions
            totalImpressions += quiz.impressions; // Sum up the impressions
        });

        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            totalQuizzes: quizzes.length,
            totalQuestions,
            totalImpressions
        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Update user profile (requires authentication)
router.put('/profile', [
    body('name').optional().notEmpty().withMessage('Name is required'),
    body('email').optional().isEmail().withMessage('Invalid email address')
], async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const updatedUser = await User.findByIdAndUpdate(
            decoded.userId,
            { name, email },
            { new: true }
        );
        console.log(updatedUser);
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({
            name: updatedUser.name,
            email: updatedUser.email,

        });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;
