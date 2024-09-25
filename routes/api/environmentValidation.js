const express = require('express');
const router = express.Router();
const { Client } = require('ssh2'); // SSH client for executing remote commands
const loadConfigFile = require('./getConfigurationFile'); // Function to load config data
const { v4: uuidv4 } = require('uuid'); // UUID generator

// Utility function to handle SSH connection and command execution
const executeSSHCommand = (config, command) => {
  return new Promise((resolve, reject) => {
    const conn = new Client(); // Create a new SSH client
    conn.on('ready', () => {
      // Execute the given command on the remote server when connection is ready
      conn.exec(
        `cd ${config.configData.TTMHome} && source ~/.profile && ${command}`, // Change to specific directory and execute command
        (err, stream) => {
          if (err) {
            return reject('Command execution failed'); // Handle command execution error
          }

          let stdoutData = ''; // To collect standard output
          let stderrData = ''; // To collect error output

          // Event when the command execution completes
          stream.on('close', (code, signal) => {
            conn.end(); // Close SSH connection
            resolve({ stdoutData, stderrData }); // Return the command output
          });

          // Append data from stdout and stderr streams
          stream.stdout.on('data', (data) => (stdoutData += data.toString()));
          stream.stderr.on('data', (data) => (stderrData += data.toString()));
        }
      );
    });

    // Handle SSH connection error
    conn.on('error', (err) => reject('SSH connection failed: ' + err));

    // Establish the SSH connection using provided credentials from config
    conn.connect({
      host: config.configData.TTMhost,
      port: config.configData.TTMport,
      username: config.configData.TTMusername,
      password: config.configData.TTMpassword,
    });
  });
};

// POST: Get TNS Ping Internal
// Endpoint to perform a TNS Ping on a database instance
router.post('/getTNSPingInternal', async (req, res) => {
  try {
    const config = await loadConfigFile(); // Load the configuration file
    const tnspingCommand = `tnsping ${req.body.DBInstance}`; // Create tnsping command for the DB instance
    const output = await executeSSHCommand(config, tnspingCommand); // Execute the command via SSH

    // Extract the host and port from the tnsping output
    const hostMatch = output.stdoutData.match(/host=([^\)]+)/);
    const portMatch = output.stdoutData.match(/port=([^\)]+)/);
    const host = hostMatch ? hostMatch[1] : null;
    const port = portMatch ? portMatch[1] : null;

    if (!host || !port) return res.status(400).json('Invalid DB Instance'); // Respond if the instance is invalid
    res.status(200).json({ host, port }); // Respond with host and port information
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Unexpected error occurred'); // Handle errors
  }
});

// POST: Check SSH Connection
// Endpoint to check if an SSH connection to a specified host is successful
router.post('/checkSSHConnection', async (req, res) => {
  try {
    const config = await loadConfigFile(); // Load configuration
    // Create SSH check command
    const sshCheckCommand = `ssh -o BatchMode=yes ${req.body.sshUserAndHost} exit && echo "SSH connection successful" || echo "SSH connection failed"`;
    const output = await executeSSHCommand(config, sshCheckCommand); // Execute SSH command

    // Respond based on the success or failure of the SSH connection
    if (output.stdoutData.trim() === 'SSH connection successful') {
      res.status(200).json({ message: 'SSH connection successful' });
    } else {
      res.status(400).json({ message: 'SSH connection failed' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Unexpected error occurred'); // Handle errors
  }
});

// POST: Check Directory
// Endpoint to check if a directory exists on a remote machine
router.post('/checkDirectory', async (req, res) => {
  try {
    const config = await loadConfigFile(); // Load configuration
    // Create command to check directory existence
    const checkDirCommand = `ssh ${req.body.sshUserAndHost} '[ -d ${req.body.DPDIRPath} ] && echo "found" || echo "not found"'`;
    const output = await executeSSHCommand(config, checkDirCommand); // Execute the command

    // Respond based on whether the directory was found or not
    if (output.stdoutData.trim() === 'found') {
      res.status(200).json({ message: 'Directory found' });
    } else {
      res.status(400).json({ message: 'Directory not found' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Unexpected error occurred'); // Handle errors
  }
});

// POST: Check Data Pump Dump
// Endpoint to create a data pump dump file on a database
router.post('/checkDataPumpDump', async (req, res) => {
  try {
    // Validate client DB connection credentials
    const ClientDBConnection = await clientsValidation(
      req.body.DBConnectionString
    );
    if (ClientDBConnection !== 'Validation successful')
      return res.status(400).json('DB user or password is incorrect');

    // Validate if the directory exists on the DB
    const DirectoryInDB = await DirectoryOnDBValidation(
      req.body.TTMDirDBIndentifier,
      req.body.DBConnectionString
    );
    if (DirectoryInDB === 'no rows selected')
      return res.status(400).json('TTM dir DB identifier is incorrect');

    const config = await loadConfigFile(); // Load configuration
    const uuid = uuidv4(); // Generate a unique identifier for the dump file
    // Create data pump command
    const dumpCommand = `expdp ${req.body.DBConnectionString} tables=EPC1_DISTRIB_VERSION directory=${req.body.TTMDirDBIndentifier} dumpfile=TTM_dmp_test_${uuid}.dmp logfile=TTM_dmp_test_${uuid}.log`;
    const output = await executeSSHCommand(config, dumpCommand); // Execute the command via SSH

    // Respond based on the success of the data pump dump
    if (output.stderrData.includes('successfully completed')) {
      res.status(200).json('Dump Creation Succeeded');
    } else {
      res.status(500).json('Dump Creation Failed');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Unexpected error occurred'); // Handle errors
  }
});

// Database Client Validation
// Utility function to validate the database connection string
const clientsValidation = async (DBConnectionString) => {
  try {
    const config = await loadConfigFile(); // Load configuration
    const sqlCommand = `
      WHENEVER SQLERROR EXIT SQL.SQLCODE
      BEGIN
        NULL; -- Test connection
      END;
      /
    `;
    // Execute SQL command for validation
    const output = await executeSSHCommand(
      config,
      `echo "${sqlCommand}" | sqlplus -S ${DBConnectionString}`
    );

    // Return validation result based on the SQLPlus output
    if (
      output.stdoutData.includes('PL/SQL procedure successfully completed') ||
      output.stdoutData.includes('Connected')
    ) {
      return 'Validation successful';
    }
    return 'Validation failed';
  } catch (error) {
    console.error('Error:', error);
    return 'Validation failed';
  }
};

// Directory Validation on Database
// Utility function to validate if the directory exists in the database
const DirectoryOnDBValidation = async (
  TTMDirDBIndentifier,
  DBConnectionString
) => {
  try {
    const config = await loadConfigFile(); // Load configuration
    // SQL query to check if the directory exists
    const query = `select DIRECTORY_NAME, DIRECTORY_PATH from all_directories where DIRECTORY_NAME='${TTMDirDBIndentifier}';`;
    const output = await executeSSHCommand(
      config,
      `echo "${query}" | sqlplus -S ${DBConnectionString}`
    );

    return output.stdoutData.trim(); // Return query result
  } catch (error) {
    console.error('Error:', error);
    return 'Validation failed';
  }
};

module.exports = router; // Export the router to be used in the main application
