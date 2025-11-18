const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../db');
const { nanoid } = require('nanoid');

router.get('/', (req, res) => {
  const db = readDB();
  res.json(db.maintenance);
});

router.post('/', (req, res) => {
  const db = readDB();
  const ticket = { id: nanoid(), status: 'open', createdAt: new Date().toISOString(), ...req.body };
  db.maintenance.push(ticket);
  writeDB(db);
  res.json(ticket);
});

router.put('/:id', (req, res) => {
  const db = readDB();
  const idx = db.maintenance.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.maintenance[idx] = { ...db.maintenance[idx], ...req.body };
  writeDB(db);
  res.json(db.maintenance[idx]);
});

module.exports = router;
