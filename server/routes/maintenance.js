const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../db');
const { nanoid } = require('nanoid');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

function filterDataByUser(data, userId) {
  if (!userId) return data;
  return data.filter(item => item.userId === userId);
}

router.get('/', (req, res) => {
  const db = readDB();
  const userMaintenance = filterDataByUser(db.maintenance, req.user.id);
  res.json(userMaintenance);
});

router.post('/', (req, res) => {
  const db = readDB();
  const ticket = {
    id: nanoid(),
    userId: req.user.id,
    ...req.body,
    createdAt: new Date().toISOString()
  };
  db.maintenance.push(ticket);
  writeDB(db);
  res.json(ticket);
});

router.put('/:id', (req, res) => {
  const db = readDB();
  const idx = db.maintenance.findIndex(x => x.id === req.params.id && x.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'Maintenance ticket not found' });
  
  db.maintenance[idx] = { ...db.maintenance[idx], ...req.body };
  writeDB(db);
  res.json(db.maintenance[idx]);
});

router.delete('/:id', (req, res) => {
  const db = readDB();
  const idx = db.maintenance.findIndex(x => x.id === req.params.id && x.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ message: 'Maintenance ticket not found' });
  
  db.maintenance.splice(idx, 1);
  writeDB(db);
  res.json({ message: 'Maintenance ticket deleted' });
});

module.exports = router;
