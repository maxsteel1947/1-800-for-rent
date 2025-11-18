const express = require('express');
const router = express.Router();
const { readDB } = require('../db');

router.get('/', (req, res) => {
  const db = readDB();
  const totalRentCollected = db.payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const pending = db.tenants.filter(t => !db.payments.find(p => p.tenantId === t.id && p.date && p.status === 'paid')).length;
  const securityHeld = db.tenants.reduce((s, t) => s + (Number(t.deposit) || 0), 0);
  const occupancy = db.properties.map(p => {
    const occ = db.tenants.filter(t => t.propertyId === p.id).length;
    return { propertyId: p.id, name: p.name, rooms: p.rooms || 0, occupied: occ };
  });

    res.json({ totalRentCollected, pendingDuesCount: pending, securityHeld, occupancy });
});

  // Monthly income aggregation endpoint
  router.get('/income', (req, res) => {
    const db = readDB();
    const monthsParam = Number(req.query.months) || 6;
    const now = new Date();
    const months = [];
    for (let i = monthsParam - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('default', { month: 'short' }) });
    }

    const series = months.map(m => {
      const sum = db.payments
        .filter(p => {
          if (!p.date) return false;
          const pd = new Date(p.date);
          return pd.getFullYear() === m.year && (pd.getMonth() + 1) === m.month;
        })
        .reduce((s, p) => s + (Number(p.amount) || 0), 0);
      return sum;
    });

    res.json({ labels: months.map(m => m.label), series });
  });

module.exports = router;
