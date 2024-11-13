const express = require('express');
const multer = require('multer');
const path = require('path');
const Data = require('../models/data');
const helmet = require('helmet');
const router = express.Router();

// Use helmet for security
router.use(helmet());

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Only allow image file types
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});

// POST route to store QR data and image upload
router.post('/qrdata', upload.single('profileImage'), async (req, res) => {
  try {
    const { name, email, work_email, organization, phone, address, youtube_url, facebook_url, linkden_url, twitter_url } = req.body;
    const profileImage = req.file ? req.file.path : null;

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
      profileImage,
    });

    await qrdata.save();

    res.status(201).json({
      message: 'Submitted successfully',
      qrdata,
      userId: qrdata._id,
    });
  } catch (error) {
    console.error('Error while submitting:', error);
    res.status(500).json({ message: 'Error while submitting', error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await Data.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

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
    const user = await Data.findById(req.params.userId);
    if (!user) return res.status(404).send('User not found');

    if (!user.isAllowed) {
      return res.status(403).json({ message: 'User is blocked' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;
