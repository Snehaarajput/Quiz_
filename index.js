require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/User');
const quizRoutes = require('./routes/Quiz');

const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/quizee';

// Database Connection
mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());


//routes
app.use('/user', userRoutes);
app.use('/quiz', quizRoutes);

// Middleware for 404 Not Found
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong' });
});

//Testing
app.delete('/', (req, res)=>{
    // console.log(req);
    res.send("I'm rott");
})


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
