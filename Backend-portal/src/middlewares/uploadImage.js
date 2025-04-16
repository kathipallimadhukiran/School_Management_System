// middlewares/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `profileImage-${Date.now()}-${Math.floor(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

module.exports = upload; // ✅ Now works with require()
