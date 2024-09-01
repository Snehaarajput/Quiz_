require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./routes/User');
const quizRoutes = require('./routes/Quiz');

const app = express();
const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI || "mongodb+srv://rajputsnehaa8:9BCwXYLmy6KIXphD@cluster0.vocys.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// // Database Connection
// mongoose.connect(mongoURI)
//     .then(() => console.log('Connected to MongoDB'))
//     .catch(err => console.error('Could not connect to MongoDB', err));

const client = new MongoClient(mongoURI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


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
