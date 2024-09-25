const express = require('express');
const router = express.Router(); // Create an Express router for handling API routes
const config = require('config'); // Import configuration module to access config settings
const fs = require('fs').promises; // Use fs.promises to handle file system operations asynchronously
const { Client } = require('ssh2'); // Import SSH2 client for managing SSH connections
const loadConfigFile = require('./getConfigurationFile'); // Import function to load the configuration file

// Helper function to fetch TTM configuration values
const getConfigurationValues = async () => {
  const config = await loadConfigFile(); // Load configuration file
  return {
    TTMhost: config.configData.TTMhost,
    TTMport: config.configData.TTMport,
    TTMusername: config.configData.TTMusername,
    TTMpassword: config.configData.TTMpassword,
    TTMHome: config.configData.TTMHome,
    TTMPackagerCommand: config.configData.TTMPackagerCommand,
    TTMDeployerCommand: config.configData.TTMDeployerCommand,
  };
};

// @route    GET /api/configuration/getConfiguration
// @desc     Get the full TTM configuration and send it to the client
// @access   Public
router.get('/getConfiguration', async (req, res) => {
  const result = await getConfigurationValues(); // Fetch configuration values
  res.status(200).json(result); // Send the configuration as a JSON response
});

// @route    GET /api/configuration/getwsPackagerPort
// @desc     Get the WebSocket packager port
// @access   Public
router.get('/getwsPackagerPort', async (req, res) => {
  const config = await loadConfigFile(); // Load configuration file
  res.status(200).json({ wsPackagerPort: config.configData.wsPackagerPort }); // Return the WebSocket packager port
});

// @route    GET /api/configuration/getwsDeployerPort
// @desc     Get the WebSocket deployer port
// @access   Public
router.get('/getwsDeployerPort', async (req, res) => {
  const config = await loadConfigFile(); // Load configuration file
  res.status(200).json({ wsDeployerPort: config.configData.wsDeployerPort }); // Return the WebSocket deployer port
});

// Helper function for updating the configuration file
const updateConfigFile = async (newConfig) => {
  try {
    const config = await loadConfigFile(); // Load current configuration

    // Merge new configuration data with the existing configuration
    const updatedConfig = { ...config.configData, ...newConfig };

    // Write the updated configuration back to the file
    await fs.writeFile(
      config.configPath,
      JSON.stringify(updatedConfig, null, 2)
    );

    return { message: 'Configuration updated successfully', config };
  } catch (error) {
    console.log(error); // Log any errors
    throw new Error('Failed to update configuration file');
  }
};

// @route    POST /api/configuration/setConfiguration
// @desc     Update TTM configuration
// @access   Public
router.post('/setConfiguration', async (req, res) => {
  const formData = req.body; // Get the configuration data from the request body
  if (!formData || typeof formData !== 'object') {
    return res.status(400).json({ error: 'Invalid data format' }); // Return an error if the data format is invalid
  }

  try {
    const result = await updateConfigFile(formData); // Update the configuration file
    res.status(200).json(result.config.configData); // Respond with the updated configuration
  } catch (error) {
    res.status(500).json({ error: error.message }); // Handle errors and respond with a 500 status code
  }
});

// Reusable function to execute SSH commands
const executeSSHCommand = async (commands, res) => {
  const config = await loadConfigFile(); // Load the configuration file
  const conn = new Client(); // Create a new SSH client instance

  // When the SSH connection is ready, execute the command
  conn.on('ready', () => {
    conn.exec(commands, (err, stream) => {
      if (err) {
        console.error('Command execution error:', err);
        return res.status(500).send('Command execution failed'); // Handle SSH command execution errors
      }
      stream.on('close', () => conn.end()); // Close the SSH connection when the command is done
      stream.stdout.on('data', (data) =>
        console.log('STDOUT:', data.toString())
      ); // Log command output from stdout
      stream.stderr.on('data', (data) =>
        console.error('STDERR:', data.toString())
      ); // Log errors from stderr
    });
  });

  // Handle SSH connection errors
  conn.on('error', (err) => {
    console.error('SSH connection error:', err);
    res.status(500).send('SSH connection failed, check connection details'); // Return a 500 status if SSH connection fails
  });

  // Connect to the remote server using SSH with credentials from the config
  conn.connect({
    host: config.configData.TTMhost,
    port: config.configData.TTMport,
    username: config.configData.TTMusername,
    password: config.configData.TTMpassword,
  });
};

// @route    POST /api/configuration/changeReportEmail
// @desc     Update report email configuration in the MEC.profile file
// @access   Public
router.post('/changeReportEmail', async (req, res) => {
  const config = await loadConfigFile(); // Load the configuration file
  const { EmailString, EmailChcekcd } = req.body; // Extract the email data from the request body
  if (!EmailString) {
    return res.status(400).json({ error: 'Email string is required' }); // Return an error if email string is not provided
  }

  // Prepare the commands to update the email configuration in MEC.profile
  const execEmailString = `sed -i 's|^export MEC_EMAIL_LIST="[^"]*"|export MEC_EMAIL_LIST="${EmailString}"|' MEC.profile.ksh`;
  const execEmailStringInit = `sed -i 's|^export MEC_EMAIL_LIST="[^"]*"|export MEC_EMAIL_LIST=""|' MEC.profile.ksh`;
  const execEmailCheckedString = `sed -i 's|^export EMAIL_ZIP_ATTACHED_REPORT=[^"]*|export EMAIL_ZIP_ATTACHED_REPORT=Y|' MEC.profile.ksh`;
  const execEmailNotCheckedString = `sed -i 's|^export EMAIL_ZIP_ATTACHED_REPORT=[^"]*|export EMAIL_ZIP_ATTACHED_REPORT=N|' MEC.profile.ksh`;

  // Determine which command to run based on the email check status
  let commands;
  if (EmailChcekcd) {
    commands = `cd ${config.configData.TTMHome}WORK_DIR/ && ${execEmailString} && ${execEmailCheckedString}`;
  } else {
    commands = `cd ${config.configData.TTMHome}WORK_DIR/ && ${execEmailStringInit} && ${execEmailNotCheckedString}`;
  }

  executeSSHCommand(commands, res); // Execute the SSH command to update the email
  res.status(200).json('Changed succeeded'); // Respond with a success message
});

// @route    GET /api/configuration/getReportEmail
// @desc     Retrieve the report email configuration from the MEC.profile file
// @access   Public
router.get('/getReportEmail', async (req, res) => {
  const config = await loadConfigFile(); // Load the configuration file

  // Commands to retrieve the email configuration from MEC.profile
  const execCheckEmailSelected = `awk -F'=' '/^export EMAIL_ZIP_ATTACHED_REPORT/ { gsub(/"/, "", $2); print $2 }' MEC.profile.ksh`;
  const execEmailString = `awk -F'[""]' '/export MEC_EMAIL_LIST=/{print $2}' MEC.profile.ksh`;

  const conn = new Client(); // Create a new SSH client instance

  // Function to execute the SSH command and return the result
  const runCommand = (command) => {
    return new Promise((resolve, reject) => {
      conn.exec(
        `cd ${config.configData.TTMHome}WORK_DIR/ && ${command}`,
        (err, stream) => {
          if (err) {
            return reject(`Command execution failed: ${err}`);
          }
          let output = ''; // Initialize output string
          stream.on('close', () => resolve(output.trim())); // Resolve the output once the command finishes
          stream.stdout.on('data', (data) => (output += data.toString())); // Collect stdout data
          stream.stderr.on('data', (data) =>
            console.error('STDERR:', data.toString())
          ); // Log any stderr data
        }
      );
    });
  };

  // When SSH connection is ready, execute the commands
  conn.on('ready', async () => {
    try {
      const EmailSelected = await runCommand(execCheckEmailSelected); // Check if the email option is selected
      let EmailString = null;
      if (EmailSelected === 'Y') {
        EmailString = await runCommand(execEmailString); // Retrieve the email string if selected
      }

      conn.end(); // Close the SSH connection
      res.status(200).json({ EmailString, EmailSelected }); // Return the email configuration
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Command execution failed'); // Handle command execution errors
      conn.end(); // Close the SSH connection in case of an error
    }
  });

  // Handle SSH connection errors
  conn.on('error', (err) => {
    console.error('SSH connection error:', err);
    res.status(500).send('SSH connection failed, check connection details'); // Return an error if SSH connection fails
  });

  // Connect to the remote server using SSH with credentials from the config
  conn.connect({
    host: config.configData.TTMhost,
    port: config.configData.TTMport,
    username: config.configData.TTMusername,
    password: config.configData.TTMpassword,
  });
});

module.exports = router; // Export the router to be used in the main application
