const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// simple OTP stub endpoint (for tenants)
router.post('/otp/request', (req, res) => {
  const { phone } = req.body;
  // In production: send SMS via provider and store OTP temporarily
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // Return OTP in response for demo only
  res.json({ phone, otp, message: 'OTP generated (demo). Implement SMS provider to send.' });
});

router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;
  const db = readDB();
  if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email exists' });
  const user = { id: nanoid(), name, email, role: role || 'manager', password: bcrypt.hashSync(password || 'changeme', 8) };
  db.users.push(user);
  writeDB(db);
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

module.exports = router;
