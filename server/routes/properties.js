const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../db');
const { nanoid } = require('nanoid');
const { authenticateToken, userDataAccess } = require('../middleware/auth');

// Apply authentication middleware to all property routes
router.use(authenticateToken);
router.use(userDataAccess);

router.get('/', (req, res) => {
  const db = readDB();
  res.json(db.properties);
});

router.post('/', (req, res) => {
  const db = readDB();
  const property = { id: nanoid(), userId: req.userId, ...req.body };
  db.properties.push(property);
  writeDB(db);
  res.json(property);
});

router.get('/:id', (req, res) => {
  const db = readDB();
  const p = db.properties.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

router.put('/:id', (req, res) => {
  const db = readDB();
  const idx = db.properties.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.properties[idx] = { ...db.properties[idx], ...req.body };
  writeDB(db);
  res.json(db.properties[idx]);
});

router.delete('/:id', (req, res) => {
  const db = readDB();
  db.properties = db.properties.filter(x => x.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

module.exports = router;
