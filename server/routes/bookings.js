const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../db');
const { nanoid } = require('nanoid');

router.get('/', (req, res) => {
  const db = readDB();
  res.json(db.bookings);
});

router.post('/', (req, res) => {
  const db = readDB();
  const b = { id: nanoid(), createdAt: new Date().toISOString(), ...req.body };
  db.bookings.push(b);
  writeDB(db);
  res.json(b);
});

module.exports = router;
