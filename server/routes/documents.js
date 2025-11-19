const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { readDB, writeDB } = require('../db');
const { nanoid } = require('nanoid');
const { authenticateToken } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authenticateToken);

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
    userId: req.user.id,
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
  const userDocuments = filterDataByUser(db.documents, req.user.id);
  res.json(userDocuments.filter(d => d.tenantId === req.params.tenantId));
});

router.get('/', (req, res) => {
  const db = readDB();
  const userDocuments = filterDataByUser(db.documents, req.user.id);
  res.json(userDocuments);
});

router.delete('/:id', (req, res) => {
  const db = readDB();
  const idx = db.documents.findIndex(x => x.id === req.params.id && x.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'Document not found' });
  
  db.documents.splice(idx, 1);
  writeDB(db);
  res.json({ message: 'Document deleted' });
});

module.exports = router;
