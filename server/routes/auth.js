const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { nanoid } = require('nanoid');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Helper functions for user management
const createUser = (userData) => {
  const db = readDB();
  const user = {
    id: nanoid(),
    email: userData.email,
    password: bcrypt.hashSync(userData.password, 10),
    fullName: userData.fullName || '',
    companyName: userData.companyName || '',
    phone: userData.phone || '',
    createdAt: new Date().toISOString(),
    isActive: true
  };
  
  // Initialize user's data
  db.users = db.users || [];
  db.users.push(user);
  
  // Create user's isolated data
  const userId = user.id;
  db.properties = db.properties || [];
  db.tenants = db.tenants || [];
  db.payments = db.payments || [];
  db.documents = db.documents || [];
  db.maintenance = db.maintenance || [];
  
  // Add sample property for the user
  const sampleProperty = {
    id: nanoid(),
    userId: userId,
    name: `${user.companyName || 'My'} Property`,
    address: '123 Main Street, City',
    rooms: 5,
    amenities: ['WiFi', 'AC', 'Parking', 'Food']
  };
  db.properties.push(sampleProperty);
  
  // Add sample tenant
  const sampleTenant = {
    id: nanoid(),
    userId: userId,
    name: 'John Doe',
    phone: '+919876543210',
    propertyId: sampleProperty.id,
    room: 'A101',
    rent: 8000,
    deposit: 10000,
    moveIn: new Date().toISOString().split('T')[0],
    rentDueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().split('T')[0],
    emergencyContact: '+919876543211',
    idProofType: 'Aadhaar',
    idNumber: '1234-5678-9012'
  };
  db.tenants.push(sampleTenant);
  
  // Add sample payment
  const samplePayment = {
    id: nanoid(),
    userId: userId,
    tenantId: sampleTenant.id,
    propertyId: sampleProperty.id,
    amount: 8000,
    date: new Date().toISOString().split('T')[0],
    method: 'UPI',
    status: 'paid'
  };
  db.payments.push(samplePayment);
  
  writeDB(db);
  return user;
};

const findUserByEmail = (email) => {
  const db = readDB();
  return (db.users || []).find(user => user.email === email);
};

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, companyName, phone } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Email, password, and full name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const user = createUser({ email, password, fullName, companyName, phone });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = findUserByEmail(decoded.email);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or user deactivated' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        companyName: user.companyName,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// simple OTP stub endpoint (for tenants)
router.post('/otp/request', (req, res) => {
  const { phone } = req.body;
  // In production: send SMS via provider and store OTP temporarily
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // Return OTP in response for demo only
  res.json({ phone, otp, message: 'OTP generated (demo). Implement SMS provider to send.' });
});


module.exports = router;
