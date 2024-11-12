const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Initialize app
const app = express();

// Configure CORS options
const allowedOrigins = ['https://qr-frontend-beta.vercel.app'];

// Enable CORS with the specific origin allowed
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests from your frontend domain or from no origin (null)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'], // Add other methods if needed
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify any headers if needed
}));


// Middleware for parsing JSON requests
app.use(express.json());
app.use(bodyParser.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('Serving static files from:', path.join(__dirname, 'uploads'));

// MongoDB Connection using Mongoose
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
    });
    console.log('MongoDB connected with Mongoose...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Import and use routes
const userRoutes = require('./Routes/userroute');
app.use('/api', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the QR Code API!');
});

// Set up server port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
