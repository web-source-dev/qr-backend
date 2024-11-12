const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize app
const app = express();



app.use(cors({
  origin: 'https://qr-frontend-beta.vercel.app', // Specify the allowed origin
  methods: ['GET', 'POST'],                      // Specify allowed methods if necessary
  credentials: true                              // If using cookies, enable credentials
}));

// Middleware for parsing JSON requests
app.use(express.json());

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
