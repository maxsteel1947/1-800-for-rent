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

function filterDataByUser(data, userId) {
  if (!userId) return data;
  return data.filter(item => item.userId === userId);
}

const uploadDir = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res) => {
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
  db.documents.push(doc);
  writeDB(db);
  res.json(doc);
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
