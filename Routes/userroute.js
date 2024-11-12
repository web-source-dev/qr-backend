const express = require('express');
const multer = require('multer');
const path = require('path');
const Data = require('../models/data');  // Assuming this model is for QR code data
const router = express.Router();

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Make sure this directory exists on the server
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Use timestamp as filename
  }
});

const upload = multer({ storage: storage });

// POST route for storing QR data and image upload
router.post('/qrdata', upload.single('profileImage'), async (req, res) => {
  const { name, email, work_email, organization, phone, address, youtube_url, facebook_url, linkden_url, twitter_url } = req.body;
  const profileImage = req.file ? req.file.path : null;  // Save file path to DB

  try {
    const qrdata = new Data({
      name,
      email,
      work_email,
      organization,
      phone,
      address,
      youtube_url,
      facebook_url,
      linkden_url,
      twitter_url,
      profileImage,  // Save the uploaded image path
    });

    await qrdata.save();

    res.status(201).json({
      message: 'Submitted successfully',
      qrdata: qrdata,
      userId: qrdata._id,
    });
  } catch (error) {
    console.error('Error while submitting:', error);
    res.status(500).json({ message: 'Error while submitting', error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await Data.find(); // Fetch all users from the database
    res.status(200).json(users); // Send the users as a JSON response
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Update isAllowed field in user
router.put('/users/:id', async (req, res) => {
  try {
    const { isAllowed } = req.body;
    const user = await Data.findByIdAndUpdate(
      req.params.id,
      { isAllowed },
      { new: true }
    );
    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

router.get('/users/:userId', async (req, res) => {
  try {
    const user = await Data.findById(req.params.userId);  // Find user by ID
    if (!user) return res.status(404).send('User not found');

    // Check if the user is allowed
    if (!user.isAllowed) {
      return res.status(403).json({ message: 'User is blocked' });  // Send 'blocked' message
    }

    // If the user is allowed, send user details
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('Server error');
  }
});


module.exports = router;
