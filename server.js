const express = require('express');
const config = require('config');
const path = require('path');
const app = express();
const { exec } = require('child_process');

const hostname = config.get('hostname');
const port = config.get('port');

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build/')));

//Init Middleware
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/packager', require('./routes/api/packager'));
app.use('/api/deployer', require('./routes/api/deployer'));
app.use('/api/configuration', require('./routes/api/configuration'));
app.use('/api/installation', require('./routes/api/installation'));
app.use('/api/util', require('./routes/api/util'));
app.use('/api/history', require('./routes/api/history'));
app.use(
  '/api/environmentValidation',
  require('./routes/api/environmentValidation')
);
app.use('/api/validation', require('./routes/api/validation'));

// Catch-all handler to serve React's index.html for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(port, hostname, () => {
  console.log(`Server started on port ${port}`);
  //const url = `http://localhost:${port}/`;
  //exec(`start ${url}`);
});
