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

// Define API routes and associate them with corresponding route handlers
const apiRoutes = [
  'packager',
  'deployer',
  'configuration',
  'installation',
  'util',
  'history',
  'environmentValidation',
  'validation',
];

// Register API routes in a loop for cleaner and more maintainable code
apiRoutes.forEach((route) => {
  app.use(`/api/${route}`, require(`./routes/api/${route}`));
});

// Catch-all handler to serve the React app's index.html for any route not explicitly defined above
// This enables the React app to handle frontend routing via its client-side router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start the server and listen on the specified hostname and port
app.listen(port, hostname, () => {
  console.log(`Server started on port ${port}`);

  // for Production: Open the app in the default browser after the server starts
  // const url = `http://localhost:${port}/`;
  // exec(`start ${url}`);
});
