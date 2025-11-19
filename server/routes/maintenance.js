const express = require('express');
const router = express.Router();
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

router.get('/', (req, res) => {
  const db = readDB();
  const userMaintenance = db.maintenance.filter(m => m.userId === req.userId);
  res.json(userMaintenance);
});

router.post('/', (req, res) => {
  const db = readDB();
  const ticket = {
    id: nanoid(),
    userId: req.userId,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  db.maintenance.push(ticket);
  writeDB(db);
  res.json(ticket);
});

router.put('/:id', (req, res) => {
  const db = readDB();
  const idx = db.maintenance.findIndex(x => x.id === req.params.id && x.userId === req.userId);
  if (idx === -1) return res.status(404).json({ message: 'Maintenance ticket not found' });
  
  db.maintenance[idx] = { ...db.maintenance[idx], ...req.body };
  writeDB(db);
  res.json(db.maintenance[idx]);
});

router.delete('/:id', (req, res) => {
  const db = readDB();
  const idx = db.maintenance.findIndex(x => x.id === req.params.id && x.userId === req.userId);
  if (idx === -1) return res.status(404).json({ message: 'Maintenance ticket not found' });
  
  db.maintenance.splice(idx, 1);
  writeDB(db);
  res.json({ success: true });
});

module.exports = router;
