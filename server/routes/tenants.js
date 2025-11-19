const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../db');
const { nanoid } = require('nanoid');
const { authenticateToken, userDataAccess } = require('../middleware/auth');

// Apply authentication middleware to all tenant routes
router.use(authenticateToken);
router.use(userDataAccess);

router.get('/', (req, res) => {
  const db = readDB();
  res.json(db.tenants);
});

router.post('/', (req, res) => {
  const db = readDB();
  const body = req.body || {};
  const tenant = {
    id: nanoid(),
    userId: req.userId,
    name: body.name || '',
    phone: body.phone || '',
    propertyId: body.propertyId || null,
    room: body.room || '',
    rent: Number(body.rent) || 0,
    deposit: Number(body.deposit) || 0,
    moveIn: body.moveIn || null,
    moveOut: body.moveOut || null,
    rentDueDate: body.rentDueDate || null,
    emergencyContact: body.emergencyContact || '',
    healthInfo: body.healthInfo || '',
    idProofType: body.idProofType || '',
    idNumber: body.idNumber || ''
  };
  db.tenants.push(tenant);
  writeDB(db);
  res.json(tenant);
});

// Find tenant by phone (placed before id route to avoid route conflicts)
router.get('/phone/:phone', (req, res) => {
  const db = readDB();
  const t = db.tenants.find(x => x.phone === req.params.phone);
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
});

router.get('/:id', (req, res) => {
  const db = readDB();
  const t = db.tenants.find(x => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
});

router.put('/:id', (req, res) => {
  const db = readDB();
  const idx = db.tenants.findIndex(x => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const body = req.body || {};
  db.tenants[idx] = {
    ...db.tenants[idx],
    ...body,
    rent: body.rent !== undefined ? Number(body.rent) : db.tenants[idx].rent,
    deposit: body.deposit !== undefined ? Number(body.deposit) : db.tenants[idx].deposit
  };
  writeDB(db);
  res.json(db.tenants[idx]);
});

router.delete('/:id', (req, res) => {
  const db = readDB();
  db.tenants = db.tenants.filter(x => x.id !== req.params.id);
  writeDB(db);
  res.json({ success: true });
});

// Find tenant by phone
router.get('/phone/:phone', (req, res) => {
  const db = readDB();
  const t = db.tenants.find(x => x.phone === req.params.phone);
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
});

module.exports = router;
