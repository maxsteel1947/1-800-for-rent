const express = require('express');
const router = express.Router();
const { readDB } = require('../db');
const { authenticateToken, userDataAccess } = require('../middleware/auth');

// Apply authentication middleware to all dashboard routes
router.use(authenticateToken);
router.use(userDataAccess);

// Helper function to filter data by user
const filterDataByUser = (data, userId) => {
  if (!data || !Array.isArray(data)) return [];
  return data.filter(item => item.userId === userId);
};

router.get('/', (req, res) => {
  const db = readDB();
  const userId = req.userId;
  
  // Get user-specific data
  const userPayments = filterDataByUser(db.payments, userId);
  const userTenants = filterDataByUser(db.tenants, userId);
  const userProperties = filterDataByUser(db.properties, userId);
  
  const totalRentCollected = userPayments
    .filter(p => p.status === 'paid')
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const pending = userTenants.filter(t => !userPayments.find(p => p.tenantId === t.id && p.date && p.status === 'paid')).length;
  const securityHeld = userTenants.reduce((s, t) => s + (Number(t.deposit) || 0), 0);
  const occupancy = userProperties.map(p => {
    const occ = userTenants.filter(t => t.propertyId === p.id).length;
    return { propertyId: p.id, name: p.name, rooms: p.rooms || 0, occupied: occ };
  });

  res.json({ totalRentCollected, pendingDuesCount: pending, securityHeld, occupancy });
});

// Monthly income aggregation endpoint
router.get('/income', (req, res) => {
  const db = readDB();
  const userId = req.userId;
  const monthsParam = Number(req.query.months) || 6;
  
  // Get user-specific payments
  const userPayments = filterDataByUser(db.payments, userId);
  
  const now = new Date();
  const months = [];
  for (let i = monthsParam - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('default', { month: 'short' }) });
  }

  const series = months.map(m => {
    const sum = userPayments
      .filter(p => {
        if (!p.date || p.status !== 'paid') return false;
        const pd = new Date(p.date);
        return pd.getFullYear() === m.year && (pd.getMonth() + 1) === m.month;
      })
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);
    return sum;
  });

  res.json({ labels: months.map(m => m.label), series });
});

module.exports = router;
