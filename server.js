// Import required modules
const express = require('express'); // Express framework for building the API
const config = require('config'); // Configuration module to access environment settings
const path = require('path'); // Module for working with file and directory paths
const app = express(); // Initialize the Express application
const { exec } = require('child_process'); // Module to run shell commands

// Get hostname and port from the config file
const hostname = config.get('hostname');
const port = config.get('port');

// Serve static files from the React app's 'build' directory
// This is where the production-ready React frontend is served from
app.use(express.static(path.join(__dirname, 'client/build/')));

// Initialize middleware for parsing JSON request bodies
// extended: false means it uses the classic body-parser library
app.use(express.json({ extended: false }));

// Register API routes in a loop for cleaner and more maintainable code

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

// Catch-all handler to serve the React app's index.html for any route not explicitly defined above
// This enables the React app to handle frontend routing via its client-side router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start the server and listen on the specified hostname and port
app.listen(port, hostname, () => {
  console.log(`Server started on port ${port}`);

  // for Production: Open the app in the default browser after the server starts
  //const url = `http://localhost:${port}/`;
  //exec(`start ${url}`);
});
