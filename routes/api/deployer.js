const { Client } = require('ssh2'); // Import SSH2 client for managing SSH connections
const config = require('config'); // Import configuration module to access config settings
const express = require('express'); // Import Express to create server routes
const router = express.Router(); // Create an Express router for handling API routes

const http = require('http'); // Import http module to create an HTTP server
const WebSocket = require('ws'); // Import WebSocket for real-time communication
const loadConfigFile = require('./getConfigurationFile'); // Import function to load the configuration file

const app = express(); // Initialize the Express app
const server = http.createServer(app); // Create an HTTP server with Express app
const wss = new WebSocket.Server({ server }); // Initialize a WebSocket server using the HTTP server

// Store WebSocket connections in a Set to track connected clients
const clients = new Set();

// WebSocket connection event handler
wss.on('connection', (ws) => {
  clients.add(ws); // Add the new WebSocket connection to the clients Set

  // Log received messages from the WebSocket client
  ws.on('message', (message) => {
    console.log('Received:', message);
  });

  // When a WebSocket connection is closed, remove it from the clients Set
  ws.on('close', () => {
    clients.delete(ws); // Remove the connection from the Set
  });

  // Handle WebSocket errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast a message to all connected WebSocket clients
const broadcastToClients = (message) => {
  const data = JSON.stringify({ stdout: message }); // Convert the message to JSON format
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // Only send the message to open WebSocket connections
      client.send(data); // Send the message to the WebSocket client
    }
  });
};

// Function to abstract SSH command execution
const executeSSHCommand = (conn, command, stdout, res) => {
  conn.exec(command, (err, stream) => {
    if (err) {
      console.error('Command execution error:', err);
      return res.status(500).send('Command execution failed'); // Respond with an error if SSH command fails
    }

    // On stream close, check if the deployer was successful
    stream.on('close', () => {
      conn.end(); // Close the SSH connection
      const hasSucceeded = stdout.some((str) =>
        str.includes('MEC-Deployer Finish Successfully (Status=0)')
      ); // Check if the deployer succeeded based on the output

      if (hasSucceeded) res.status(200).json('Deployer Succeeded');
      // Respond with success if deployer was successful
      else res.status(400).json('Deployer Failed'); // Respond with failure if deployer was not successful
    });

    // Collect data from stdout and broadcast it to WebSocket clients
    stream.stdout.on('data', (data) => {
      const output = data.toString();
      stdout.push(output); // Add output to stdout array
      broadcastToClients(output); // Broadcast the output to all WebSocket clients
    });

    // Collect data from stderr and broadcast it to WebSocket clients
    stream.stderr.on('data', (data) => {
      const output = data.toString();
      stdout.push(output); // Add output to stdout array
      broadcastToClients(output); // Broadcast the error output to all WebSocket clients
    });
  });
};

// @route    POST api/deployer/runDeployer
// @desc     Run the deployer job for TTM
// @access   Public
router.post('/runDeployer', async (req, res) => {
  const config = await loadConfigFile(); // Load configuration file
  const activeClientsString = req.body; // Get the active clients from the request body
  let stdout = []; // Initialize an array to store command output

  try {
    const conn = new Client(); // Create a new SSH connection client
    const ttmHome = config.configData.TTMHome; // Get TTMHome path from config
    const ttmDeployerCommand = config.configData.TTMDeployerCommand; // Get the deployer command from config

    // Prepare the command to set the active clients and run the deployer job
    const execClientsString = `sed -i 's|^export PRODUCTS_LIST="[^"]*"|export PRODUCTS_LIST="${activeClientsString.activeClientsString}"|' MEC.profile.ksh`;

    // When the SSH connection is ready, execute the deployer job
    conn.on('ready', () => {
      const command = `cd ${ttmHome} && source ~/.profile && cd ${ttmHome}WORK_DIR/ && ${execClientsString} && cd ${ttmHome}deployer/ && ${ttmDeployerCommand}`;
      executeSSHCommand(conn, command, stdout, res); // Execute the command via SSH
    });

    // Handle SSH connection errors
    conn.on('error', (err) => {
      console.error('SSH connection error:', err);
      res
        .status(500)
        .send(
          'SSH connection failed, Check connection details to TTM Environment'
        );
    });

    // Connect to the remote server using SSH
    conn.connect({
      host: config.configData.TTMhost, // Remote host from config
      port: config.configData.TTMport, // Remote SSH port from config
      username: config.configData.TTMusername, // SSH username from config
      password: config.configData.TTMpassword, // SSH password from config
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).send('Unexpected error occurred'); // Respond with a generic error message if any exception occurs
  }
});

// Start the HTTP server and WebSocket server on the configured port
server.listen(config.get('wsDeployerPort'), () => {
  console.log(`Server is listening on port ${config.get('wsDeployerPort')}`);
});

module.exports = router; // Export the router for use in other parts of the application
