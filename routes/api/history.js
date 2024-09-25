const express = require('express'); // Importing the Express framework
const router = express.Router(); // Creating a new router instance to define routes
const { Client } = require('ssh2'); // Importing the Client class from the ssh2 module for SSH connections
const loadConfigFile = require('./getConfigurationFile'); // Importing a function to load configuration files

// Reusable SSH command execution function
async function executeSSHCommand(res, command, config) {
  let stdout = ''; // Initialize a variable to capture standard output
  let stderr = ''; // Initialize a variable to capture standard error

  try {
    const conn = new Client(); // Create a new SSH client instance
    conn.on('ready', () => {
      // Event handler for when the SSH client is ready
      conn.exec(command, (err, stream) => {
        // Execute the provided command on the remote server
        if (err) {
          // Check for execution errors
          console.error('Command execution error:', err); // Log the error
          return res.status(500).send('Command execution failed'); // Respond with a 500 status
        }

        // Event handler for when the stream closes
        stream.on('close', () => {
          conn.end(); // Close the SSH connection
          res.status(200).json({ stdout }); // Respond with the captured standard output
        });

        // Capture standard output data from the command execution
        stream.stdout.on('data', (data) => {
          stdout += data.toString(); // Append new data to stdout variable
        });

        // Capture standard error data from the command execution
        stream.stderr.on('data', (data) => {
          stderr += data.toString(); // Append new data to stderr variable
        });
      });
    });

    // Event handler for SSH connection errors
    conn.on('error', (err) => {
      console.error('SSH connection error:', err); // Log the connection error
      res.status(500).send(
        'SSH connection failed, check connection details to TTM environment' // Respond with a 500 status
      );
    });

    // Connect to the SSH server using configuration details
    conn.connect({
      host: config.configData.TTMhost,
      port: config.configData.TTMport,
      username: config.configData.TTMusername,
      password: config.configData.TTMpassword,
    });
  } catch (error) {
    console.error('Unexpected error:', error); // Log unexpected errors
    res.status(500).send('Unexpected error occurred'); // Respond with a 500 status
  }
}

// Log list generation command template
function generateLogListCommand(logType, config) {
  return `
    cd ${config.configData.TTMHome}WORK_DIR/ &&
    echo "[" &&
    find . -type f -name "MEC-${logType}*.log" | while read -r file; do
      echo "  {";
      echo "    \\"fileName\\": \\"$(basename "$file")\\","; 
      echo "    \\"fileContent\\": \\"$(sed ':a;N;$!ba;s/\\\\/\\\\\\\\/g;s/\\n/\\\\n/g;s/\\"/\\\\\\"/g' "$file")\\"";
      echo "  },";
    done | sed '$ s/,$//' &&
    echo "]"
  `;
}

// @route    POST api/history/getPackagerLogList
// @desc     Get the latest packager history log
// @access   Public
router.post('/getPackagerLogList', async (req, res) => {
  const config = await loadConfigFile(); // Load configuration settings
  const sshCommand = generateLogListCommand('Packager', config); // Generate the command for packager logs
  executeSSHCommand(res, sshCommand, config); // Execute the SSH command
});

// @route    POST api/history/getDeployerLogList
// @desc     Get the latest deployer history log
// @access   Public
router.post('/getDeployerLogList', async (req, res) => {
  const config = await loadConfigFile(); // Load configuration settings
  const sshCommand = generateLogListCommand('Deployer', config); // Generate the command for deployer logs
  executeSSHCommand(res, sshCommand, config); // Execute the SSH command
});

module.exports = router; // Export the router for use in other modules
