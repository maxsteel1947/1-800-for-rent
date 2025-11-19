const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../db');
const { nanoid } = require('nanoid');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { authenticateToken, userDataAccess } = require('../middleware/auth');

// Apply authentication middleware to all payment routes
router.use(authenticateToken);
router.use(userDataAccess);

router.get('/', (req, res) => {
  const db = readDB();
  const userPayments = db.payments.filter(p => p.userId === req.userId);
  res.json(userPayments);
});

router.post('/', (req, res) => {
  const db = readDB();
  const body = req.body || {};
  const payment = {
    id: nanoid(),
    userId: req.userId,
    tenantId: body.tenantId || null,
    propertyId: body.propertyId || null,
    amount: Number(body.amount) || 0,
    date: body.date || new Date().toISOString().split('T')[0],
    method: body.method || 'UPI',
    status: body.status || 'paid'
  };
  db.payments.push(payment);
  writeDB(db);
  res.json(payment);
});

router.get('/tenant/:tenantId', (req, res) => {
  const db = readDB();
  const list = db.payments.filter(p => p.tenantId === req.params.tenantId);
  res.json(list);
});

module.exports = router;

// PDF receipt endpoint
router.get('/:id/receipt', (req, res) => {
  const db = readDB();
  const p = db.payments.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'Payment not found' });

  const tenant = db.tenants.find(t => t.id === p.tenantId) || { name: 'Unknown' };
  const property = db.properties.find(pt => pt.id === p.propertyId) || { name: 'Unknown' };

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=receipt-${p.id}.pdf`);

  doc.fontSize(18).text('1-800-for-rent', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text('Payment Receipt');
  doc.moveDown();

  doc.fontSize(12).text(`Receipt ID: ${p.id}`);
  doc.text(`Date: ${p.date}`);
  doc.text(`Amount: ₹${p.amount}`);
  doc.text(`Method: ${p.method}`);
  doc.moveDown();

  doc.text(`Tenant: ${tenant.name}`);
  doc.text(`Property: ${property.name}`);
  doc.text(`Room: ${tenant.room || '-'}`);
  doc.moveDown();

  doc.text('Thank you for your payment.');
  doc.end();
  doc.pipe(res);
});
