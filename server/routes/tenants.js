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
  const userTenants = db.tenants.filter(t => t.userId === req.userId);
  res.json(userTenants);
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
  };
  db.tenants.push(tenant);
  writeDB(db);
  res.json(tenant);
});

// Find tenant by phone (placed before id route to avoid route conflicts)
router.get('/phone/:phone', (req, res) => {
  const db = readDB();
  const t = db.tenants.find(x => x.phone === req.params.phone && x.userId === req.userId);
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
});

router.get('/:id', (req, res) => {
  const db = readDB();
  const t = db.tenants.find(x => x.id === req.params.id && x.userId === req.userId);
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
});

router.put('/:id', (req, res) => {
  const db = readDB();
  const idx = db.tenants.findIndex(x => x.id === req.params.id && x.userId === req.userId);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.tenants[idx] = { ...db.tenants[idx], ...req.body };
  writeDB(db);
  res.json(db.tenants[idx]);
});

router.delete('/:id', (req, res) => {
  const db = readDB();
  const idx = db.tenants.findIndex(x => x.id === req.params.id && x.userId === req.userId);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.tenants.splice(idx, 1);
  writeDB(db);
  res.json({ success: true });
});

module.exports = router;
