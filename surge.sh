#!/bin/bash

# Build the client
cd client
npm run build

# Copy server files to a public directory for deployment
mkdir -p ../public/api
cp -r server/* ../public/api/
cp -r dist/* ../public/

# Create a simple serverless function for surge.sh
cat > ../public/api/server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Mock database for static hosting
const dbPath = path.join(__dirname, 'db.json');
let db = { users: [], properties: [], tenants: [], payments: [], documents: [], maintenance: [], bookings: [] };

try {
  if (fs.existsSync(dbPath)) {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  }
} catch (e) {
  console.log('No existing database, starting fresh');
}

// API Routes
app.get('/api/auth/verify', (req, res) => {
  res.json({ valid: false });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email);
  if (user) {
    res.json({ user, token: 'mock-token' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const user = { id: Date.now().toString(), ...req.body };
  db.users.push(user);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.json({ user, token: 'mock-token' });
});

// Properties
app.get('/api/properties', (req, res) => res.json(db.properties));
app.post('/api/properties', (req, res) => {
  const property = { id: Date.now().toString(), ...req.body };
  db.properties.push(property);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.json(property);
});

// Tenants
app.get('/api/tenants', (req, res) => res.json(db.tenants));
app.post('/api/tenants', (req, res) => {
  const tenant = { id: Date.now().toString(), ...req.body };
  db.tenants.push(tenant);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.json(tenant);
});

// Payments
app.get('/api/payments', (req, res) => res.json(db.payments));
app.post('/api/payments', (req, res) => {
  const payment = { id: Date.now().toString(), ...req.body };
  db.payments.push(payment);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.json(payment);
});

// Documents
app.get('/api/documents', (req, res) => res.json(db.documents));
app.post('/api/documents/upload', (req, res) => {
  const doc = { id: Date.now().toString(), ...req.body };
  db.documents.push(doc);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.json(doc);
});

// Maintenance
app.get('/api/maintenance', (req, res) => res.json(db.maintenance));
app.post('/api/maintenance', (req, res) => {
  const ticket = { id: Date.now().toString(), ...req.body };
  db.maintenance.push(ticket);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.json(ticket);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
EOF

cd ..
echo "Ready for surge.sh deployment"
echo "Run: surge public"
