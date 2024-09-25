const express = require('express');
const router = express.Router();
const config = require('config'); // Imports configuration settings
const { Client } = require('ssh2'); // Imports SSH2 client to handle SSH connections
const loadConfigFile = require('./getConfigurationFile'); // Custom module to load configuration data

// @route    POST api/util/getExistingClients
// @desc     Get the existing clients installed in the environment
// @access   Public (no authentication required)
router.post('/getExistingClients', async (req, res) => {
  const config = await loadConfigFile(); // Loads configuration file with TTM settings
  let stdout = ''; // Variable to store the standard output of the SSH command
  let stderr = ''; // Variable to store the standard error of the SSH command
  const ttmHome = config.configData.TTMHome; // Retrieves the TTMHome path from the configuration

  try {
    const conn = new Client(); // Creates a new SSH client instance

    // When the SSH connection is ready
    conn.on('ready', () => {
      // Executes the SSH command to list files in the TTMHome/WORK_DIR directory
      conn.exec(`cd ${ttmHome}WORK_DIR && ls`, (err, stream) => {
        if (err) {
          // Handles errors during command execution
          console.error('Command execution error:', err);
          return res.status(500).send('Command execution failed'); // Sends an error response if the command fails
        }

        // Captures the standard output (stdout) from the command
        stream.on('data', (data) => {
          stdout += data.toString();
        });

        // Captures the standard error (stderr) from the command
        stream.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        // Executes when the SSH command stream is closed
        stream.on('close', (code, signal) => {
          if (code !== 0) {
            // If the command fails, logs the error and sends an error response
            console.error('First command failed with stderr:', stderr);
            return res.status(500).send('First command failed');
          }

          // Sends the command's standard output as the response if successful
          res.status(200).json(stdout);
        });
      });
    });

    // Handles errors that occur during the SSH connection process
    conn.on('error', (err) => {
      console.error('SSH connection error:', err);
      res
        .status(500)
        .send(
          'SSH connection failed, check connection details of TTM Environment'
        );
    });

    // Initiates the SSH connection using the details from the configuration file
    conn.connect({
      host: config.configData.TTMhost, // Hostname or IP address of the remote server
      port: config.configData.TTMport, // SSH port (typically 22)
      username: config.configData.TTMusername, // SSH username
      password: config.configData.TTMpassword, // SSH password
    });
  } catch (error) {
    // Handles unexpected errors during execution
    console.error('Unexpected error:', error);
    res.status(500).send('Unexpected error occurred');
  }
});

module.exports = router; // Exports the router for use in other parts of the application
