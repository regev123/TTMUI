const express = require('express');
const router = express.Router();
const config = require('config'); // Imports configuration settings
const { Client } = require('ssh2'); // Imports SSH2 client to handle SSH connections
const loadConfigFile = require('./getConfigurationFile'); // Custom module to load configuration data

// @route    POST api/validation/validateTTMHomeCorrectPath
// @desc     Check TTMHome path correctness from configuration file
// @access   Public (no authentication required)
router.post('/validateTTMHomeCorrectPath', async (req, res) => {
  // Variables to store the SSH command output
  let stdout = '';
  let stderr = '';

  // Loads configuration data
  const config = await loadConfigFile();
  const ttmHome = config.configData.TTMHome; // Gets the TTMHome path from the configuration

  try {
    const conn = new Client(); // Initializes a new SSH client

    // SSH connection is ready
    conn.on('ready', () => {
      // Executes the command to navigate to the TTMHome path and list its contents
      conn.exec(`cd ${ttmHome} && ls`, (err, stream) => {
        if (err) {
          // Handles errors in command execution
          console.error('Command execution error:', err);
          return res.status(500).send('Command execution failed'); // Sends failure response
        }

        // Collects the standard output (stdout) from the command
        stream.on('data', (data) => {
          stdout += data.toString();
        });

        // Collects the standard error (stderr) from the command
        stream.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        // Executes when the SSH command stream is closed
        stream.on('close', (code, signal) => {
          if (code !== 0) {
            // If the command exits with a non-zero status, log and return error
            console.error('TTM Home path is incorrect:', stderr);
            return res
              .status(500)
              .send(
                'TTM Home path is incorrect, please change on the configuration tab!'
              );
          }

          // Verifies if the directory contains "WORK_DIR", indicating correctness
          if (!stdout.includes('WORK_DIR')) {
            return res
              .status(500)
              .json(
                'TTM Home path is incorrect, please change on the configuration tab!'
              );
          }

          // If the TTMHome path is correct, send success response
          return res.status(200).json('TTM Home path is correct');
        });
      });
    });

    // Handles SSH connection errors
    conn.on('error', (err) => {
      console.error('SSH connection error:', err);
      return res
        .status(500)
        .send(
          'SSH connection failed, check connection details of TTM Environment'
        );
    });

    // Connects to the remote server with provided SSH credentials
    conn.connect({
      host: config.configData.TTMhost, // SSH server hostname
      port: config.configData.TTMport, // SSH port
      username: config.configData.TTMusername, // SSH username
      password: config.configData.TTMpassword, // SSH password
    });
  } catch (error) {
    // Handles unexpected errors in the entire try block
    console.error('Unexpected error:', error);
    return res.status(500).send('Unexpected error occurred');
  }
});

module.exports = router; // Exports the router for use in other parts of the application
