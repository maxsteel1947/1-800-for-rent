const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const tenants = require('./routes/tenants');
const properties = require('./routes/properties');
const payments = require('./routes/payments');
const documents = require('./routes/documents');
const maintenance = require('./routes/maintenance');
const bookings = require('./routes/bookings');
const dashboard = require('./routes/dashboard');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../client/dist')));

app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenants);
app.use('/api/properties', properties);
app.use('/api/payments', payments);
app.use('/api/documents', documents);
app.use('/api/maintenance', maintenance);
app.use('/api/bookings', bookings);
app.use('/api/dashboard', dashboard);

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
