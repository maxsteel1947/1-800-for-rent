const { readDB, writeDB } = require('./db');
const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');

function seed() {
  const db = readDB();
  db.users = [
    { id: 'owner-1', name: 'Owner One', email: 'owner@example.com', role: 'owner', password: bcrypt.hashSync('password', 8) }
  ];

  db.properties = [
    { id: 'prop-1', ownerId: 'owner-1', name: 'Sunrise PG', address: '123 Main St', rooms: 10, amenities: ['WiFi','AC'] }
  ];

  db.tenants = [
    { id: 'tenant-1', name: 'Alice', phone: '9999999999', propertyId: 'prop-1', room: 'A1', rent: 8000, deposit: 10000, moveIn: '2025-11-01' }
  ];

  db.payments = [
    { id: 'pay-1', tenantId: 'tenant-1', propertyId: 'prop-1', amount: 8000, date: '2025-11-05', method: 'UPI', status: 'paid' }
  ];

  writeDB(db);
  console.log('Seeded data');
}

seed();
