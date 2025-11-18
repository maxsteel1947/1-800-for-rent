const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { readDB, writeDB } = require('../db');
const { nanoid } = require('nanoid');

const uploadDir = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res) => {
  const db = readDB();
  const doc = { id: nanoid(), filename: req.file.filename, original: req.file.originalname, tenantId: req.body.tenantId || null, propertyId: req.body.propertyId || null, uploadedAt: new Date().toISOString() };
  db.documents.push(doc);
  writeDB(db);
  res.json(doc);
});

router.get('/tenant/:tenantId', (req, res) => {
  const db = readDB();
  res.json(db.documents.filter(d => d.tenantId === req.params.tenantId));
});

router.get('/', (req, res) => {
  const db = readDB();
  res.json(db.documents);
});

module.exports = router;
