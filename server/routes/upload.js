// routes/upload.js
const express = require('express');
const multer  = require('multer');
const path    = require('path');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`);
  }
});

const upload = multer({ storage });
const router = express.Router();

// POST /upload
// field name: 'file'
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
