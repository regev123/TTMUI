const { Client } = require('ssh2'); // Import SSH2 client for making SSH connections
const config = require('config'); // Import config to load configuration data
const express = require('express'); // Import express for API routes
const router = express.Router(); // Create an Express router instance
const http = require('http'); // Import http to create a server
const WebSocket = require('ws'); // Import WebSocket to handle real-time communication
const loadConfigFile = require('./getConfigurationFile'); // Custom module to load configuration data
const app = express(); // Initialize express app
const server = http.createServer(app); // Create an HTTP server using Express app
const wss = new WebSocket.Server({ server }); // Create a WebSocket server on the HTTP server

// Store WebSocket connections
const clients = new Set(); // Using a Set to track connected WebSocket clients

// WebSocket connection and event handling
wss.on('connection', (ws) => {
  clients.add(ws); // Add the connected client to the Set

  ws.on('message', (message) => console.log('Received:', message)); // Log received WebSocket messages

  ws.on('close', () => {
    clients.delete(ws); // Remove the client from the Set when the connection is closed
  });

  ws.on('error', (error) => console.error('WebSocket error:', error)); // Handle WebSocket errors
});

// Function to broadcast a message to all connected WebSocket clients
const broadcastToClients = (message) => {
  const data = JSON.stringify({ stdout: message }); // Format message as JSON
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data); // Send the message to each open WebSocket client
    }
  });
};

// Abstract function to execute SSH commands
const executeSSHCommand = (conn, command, stdout, res) => {
  conn.exec(command, (err, stream) => {
    if (err) {
      console.error('Command execution error:', err); // Log error if SSH command execution fails
      return res.status(500).send('Command execution failed'); // Send failure response
    }

    // Handle when SSH stream is closed
    stream.on('close', () => {
      conn.end(); // Close the SSH connection
      const hasSucceeded = stdout.some(
        (str) => str.includes('MEC-Packager Finish Successfully (Status=0)') // Check if the output indicates success
      );
      if (hasSucceeded) res.status(200).json('Packager Succeeded');
      // Send success response if successful
      else res.status(400).json('Packager Failed'); // Send failure response if unsuccessful
    });

    // Capture stdout and broadcast it via WebSocket
    stream.stdout.on('data', (data) => {
      const output = data.toString(); // Convert stdout data to string
      stdout.push(output); // Add output to stdout array
      broadcastToClients(output); // Broadcast output to WebSocket clients
    });

    // Capture stderr and broadcast it via WebSocket
    stream.stderr.on('data', (data) => {
      const output = data.toString(); // Convert stderr data to string
      stdout.push(output); // Add output to stdout array (to treat errors as part of logs)
      broadcastToClients(output); // Broadcast error output to WebSocket clients
    });
  });
};

// @route    POST api/packager/runPackager
// @desc     Run the packager job on the TTM environment
// @access   Public
router.post('/runPackager', async (req, res) => {
  const activeClientsString = req.body; // Retrieve the active clients string from the request body
  const config = await loadConfigFile(); // Load configuration file with TTM settings
  let stdout = []; // Initialize array to store command output

  try {
    const conn = new Client(); // Initialize new SSH client
    const ttmHome = config.configData.TTMHome; // Get TTMHome path from config
    const ttmPackagerCommand = config.configData.TTMPackagerCommand; // Get packager command from config

    // Command to update the client list in MEC.profile.ksh based on the active clients
    const execClientsString = `sed -i 's|^export PRODUCTS_LIST="[^"]*"|export PRODUCTS_LIST="${activeClientsString.activeClientsString}"|' MEC.profile.ksh`;

    // When SSH connection is ready
    conn.on('ready', () => {
      // Full command to update clients, navigate to packager directory, and run the packager command
      const command = `cd ${ttmHome} && source ~/.profile && cd ${ttmHome}WORK_DIR/ && ${execClientsString} && cd ${ttmHome}packager/ && ${ttmPackagerCommand}`;

      // Execute the command over SSH
      executeSSHCommand(conn, command, stdout, res);
    });

    // Handle SSH connection errors
    conn.on('error', (err) => {
      console.error('SSH connection error:', err); // Log error
      res
        .status(500)
        .send(
          'SSH connection failed, check connection details to TTM Environment'
        ); // Send failure response
    });

    // Establish SSH connection using the details from the configuration file
    conn.connect({
      host: config.configData.TTMhost, // SSH host
      port: config.configData.TTMport, // SSH port
      username: config.configData.TTMusername, // SSH username
      password: config.configData.TTMpassword, // SSH password
    });
  } catch (error) {
    // Handle unexpected errors during execution
    console.error('Unexpected error:', error); // Log the error
    res.status(500).send('Unexpected error occurred'); // Send failure response
  }
});

// Start the server on the WebSocket port specified in the configuration
server.listen(config.get('wsPackagerPort'), () => {
  console.log(`Server is listening on port ${config.get('wsPackagerPort')}`); // Log when server starts
});

module.exports = router; // Export the router for use in other parts of the application
