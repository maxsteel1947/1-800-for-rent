const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { readDB, writeDB } = require('../db');
const { nanoid } = require('nanoid');
const { authenticateToken, userDataAccess } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authenticateToken);
router.use(userDataAccess);

// Multer error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Too many files uploaded.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field.' });
    }
    return res.status(400).json({ error: 'File upload error: ' + error.message });
  }
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

function filterDataByUser(data, userId) {
  if (!userId) return data;
  return data.filter(item => item.userId === userId);
}

const uploadDir = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs and documents are allowed.'));
    }
  }
});

router.post('/upload', upload.single('file'), (req, res) => {
  try {
    console.log('Document upload request:', {
      file: req.file ? {
        originalname: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null,
      body: req.body,
      userId: req.userId
    });
    
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const db = readDB();
    const doc = { 
      id: nanoid(), 
      userId: req.userId,
      filename: req.file.filename, 
      original: req.file.originalname, 
      tenantId: req.body.tenantId || null, 
      propertyId: req.body.propertyId || null,
      documentType: req.body.documentType || '',
      description: req.body.description || '',
      uploadedAt: new Date().toISOString() 
    };
    
    console.log('Saving document:', doc);
    db.documents.push(doc);
    writeDB(db);
    
    console.log('Document saved successfully');
    res.json(doc);
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Failed to upload document: ' + error.message });
  }
});

router.get('/tenant/:tenantId', (req, res) => {
  const db = readDB();
  const userDocuments = db.documents.filter(d => d.tenantId === req.params.tenantId && d.userId === req.userId);
  res.json(userDocuments);
});

router.get('/', (req, res) => {
  const db = readDB();
  const userDocuments = db.documents.filter(d => d.userId === req.userId);
  res.json(userDocuments);
});

router.delete('/:id', (req, res) => {
  const db = readDB();
  const idx = db.documents.findIndex(d => d.id === req.params.id && d.userId === req.userId);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const doc = db.documents[idx];
  
  // Delete file from filesystem
  const filePath = path.join(uploadDir, doc.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  db.documents.splice(idx, 1);
  writeDB(db);
  res.json({ success: true });
});

module.exports = router;
