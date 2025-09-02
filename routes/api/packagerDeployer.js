const { Client } = require('ssh2');
const express = require('express');
const WebSocket = require('ws');
const loadConfigFile = require('../../utils/getConfigurationFile');
const clients = require('../../utils/websocketClients');

const linuxConnectionClient = require('../../utils/linuxConnectionClient');

const router = express.Router();

/**
 * @async
 * @route   POST /api/packagerDeployer/runJob
 * @desc    Executes a specified job (packager or deployer) on a remote server via SSH.
 *          The function performs the following steps:
 *          1. Loads configuration settings required for SSH connection and commands.
 *          2. Establishes an SSH connection to the remote server.
 *          3. Constructs the command to update the active clients list in the profile.
 *          4. Builds the complete command to navigate directories and execute the job command.
 *          5. Listens for the SSH connection's readiness to execute the job.
 *          6. Handles any errors that occur during the connection process.
 * @access  Public
 *
 * @param {Object} req - The request object containing the active clients and job type in the body.
 * @param {Object} res - The response object used to send back the status of the job execution.
 *
 * @returns {Promise<void>} - A promise that resolves when the job execution is initiated and the response is sent.
 */
router.post('/runJob', async (req, res) => {
  const { activeClientsString, jobType } = req.body;

  try {
    const config = await loadConfigFile();
    const { TTMHome, TTMPackagerCommand, TTMDeployerCommand } =
      config.configData;

    const conn = new Client();
    const jobCommand = getJobCommand(
      jobType,
      TTMPackagerCommand,
      TTMDeployerCommand
    );
    const jobPath = getJobPath(jobType, TTMHome);
    const updateClientsCommand = buildUpdateClientsCommand(activeClientsString);
    const completeCommand = buildSSHCommand(
      TTMHome,
      updateClientsCommand,
      jobPath,
      jobCommand
    );

    conn.on('ready', () =>
      executeSSHCommand(
        conn,
        completeCommand,
        res,
        handleJobCompletion,
        jobType
      )
    );
    conn.on('error', () => handleConnectionError(res));

    connectToSSH(conn, config.configData);
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).send('Unexpected error occurred');
  }
});

router.post('/getHTMLText', async (req, res) => {
  const { htmlFileName } = req.body;

  try {
    const config = await loadConfigFile();
    const { TTMHome } = config.configData;
    const command = `cat ${TTMHome}WORK_DIR/${htmlFileName}`;
    const response = await linuxConnectionClient(command);
    res.status(200).send(response.stdout);
  } catch (error) {
    res.status(400).send('Failed to get html file');
  }
});

/**
 * @desc    Sends a message to all connected WebSocket clients.
 *          The function serializes the message into JSON format and iterates through
 *          the set of clients, sending the message only to those that are currently open.
 * @access  Public
 *
 * @param {string} message - The message to be sent to the clients.
 *
 * @returns {void} - This function does not return a value.
 */
const broadcastToClients = (message) => {
  const data = JSON.stringify({ stdout: message });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

/**
 * @desc    Executes a given SSH command on a remote server using the provided connection.
 *          It handles command execution results by capturing standard output and error streams.
 *          Upon completion, it invokes a callback function to handle the command's output.
 * @access  Public
 *
 * @param {Object} conn - The SSH connection object used to execute the command.
 * @param {string} command - The command to be executed on the remote server.
 * @param {Object} res - The response object used to send back the status of the command execution.
 * @param {Function} onCommandComplete - A callback function that is called upon command completion,
 *                                        which processes the command's output log and the response.
 *
 * @returns {void} - This function does not return a value.
 */
const executeSSHCommand = (conn, command, res, onCommandComplete, jobType) => {
  const outputLog = [];

  conn.exec(command, (err, stream) => {
    if (err) {
      return handleCommandError(err, res);
    }

    stream
      .on('close', () =>
        handleCommandClose(conn, outputLog, res, onCommandComplete, jobType)
      )
      .on('data', (data) => handleStreamData(data, outputLog))
      .stderr.on('data', (data) => handleStreamData(data, outputLog));
  });
};

/**
 * @desc    Processes the data received from the SSH command execution stream.
 *          It converts the incoming data to a string, appends it to the output log,
 *          and broadcasts the output to all connected WebSocket clients.
 * @access  Public
 *
 * @param {Buffer} data - The data received from the command execution stream, typically a Buffer object.
 * @param {Array} outputLog - An array that accumulates the output logs generated during command execution.
 *
 * @returns {void} - This function does not return a value.
 */
const handleStreamData = (data, outputLog) => {
  const output = data.toString();
  outputLog.push(output);
  broadcastToClients(output);
};

/**
 * @desc    Handles errors that occur during command execution.
 *          It logs the error message to the console and sends a 500 status response
 *          indicating that the command execution failed.
 * @access  Public
 *
 * @param {Error} error - The error object containing details about the command execution failure.
 * @param {Object} res - The response object used to send back the error status and message.
 *
 * @returns {void} - This function does not return a value.
 */
const handleCommandError = (error, res) => {
  console.error('Command execution error:', error);
  return res.status(500).send('Command execution failed');
};

/**
 * @desc    Closes the SSH connection and triggers the completion handler
 *          with the accumulated output log and response object.
 * @access  Public
 *
 * @param {Object} conn - The SSH connection object that needs to be closed.
 * @param {Array} outputLog - The log of outputs collected during the command execution.
 * @param {Object} res - The response object used to send back the final status.
 * @param {Function} onCommandComplete - A callback function to handle job completion.
 *
 * @returns {void} - This function does not return a value.
 */
const handleCommandClose = (
  conn,
  outputLog,
  res,
  onCommandComplete,
  jobType
) => {
  conn.end();
  onCommandComplete(outputLog, res, jobType);
};

/**
 * @desc    Determines the outcome of the job based on the output log.
 *          It checks if the output log contains a success message and sends
 *          an appropriate response with a 200 or 400 status.
 * @access  Public
 *
 * @param {Array} outputLog - The log of outputs collected during the command execution.
 * @param {Object} res - The response object used to send back the job status.
 *
 * @returns {void} - This function does not return a value.
 */
const handleJobCompletion = (outputLog, res, jobType) => {
  const checkSuccessStr =
    jobType === 'packager'
      ? 'MEC-Packager Finish Successfully (Status=0)'
      : 'MEC-Deployer Finish Successfully (Status=0)';
  const successStr =
    jobType === 'packager' ? 'Packager Succeeded' : 'Deployer Succeeded';
  const failStr =
    jobType === 'packager' ? 'Packager Failed' : 'Deployer Failed';
  const isSuccess = outputLog.some((log) => log.includes(checkSuccessStr));
  res.status(isSuccess ? 200 : 400).json(isSuccess ? successStr : failStr);
};

/**
 * @desc    Retrieves the appropriate job command based on the job type.
 *          It returns the packager command if the job type is 'packager',
 *          otherwise it returns the deployer command.
 * @access  Public
 *
 * @param {string} jobType - The type of job being executed ('packager' or 'deployer').
 * @param {string} packagerCommand - The command string to execute for the packager.
 * @param {string} deployerCommand - The command string to execute for the deployer.
 *
 * @returns {string} - The command string to be executed based on the job type.
 */
const getJobCommand = (jobType, packagerCommand, deployerCommand) => {
  return jobType === 'packager' ? packagerCommand : deployerCommand;
};

/**
 * @desc    Constructs the job path based on the job type and TTM home directory.
 *          It returns the path to the packager directory if the job type is 'packager',
 *          otherwise it returns the path to the deployer directory.
 * @access  Public
 *
 * @param {string} jobType - The type of job being executed ('packager' or 'deployer').
 * @param {string} TTMHome - The home directory for the Topological Task Manager.
 *
 * @returns {string} - The path to the respective job directory.
 */
const getJobPath = (jobType, TTMHome) => {
  return jobType === 'packager' ? `${TTMHome}packager/` : `${TTMHome}deployer/`;
};

/**
 * @desc    Constructs a command string to update the list of active clients
 *          in the `MEC.profile.ksh` file. It uses the `sed` command to find
 *          and replace the current `PRODUCTS_LIST` variable with the new value
 *          provided in `activeClientsString`.
 * @access  Public
 *
 * @param {string} activeClientsString - A string representing the new list
 *                                       of active clients to be set in the profile.
 *
 * @returns {string} - A command string that can be executed to update the
 *                     `PRODUCTS_LIST` in the `MEC.profile.ksh` file.
 */
const buildUpdateClientsCommand = (activeClientsString) => {
  return `sed -i 's|^export PRODUCTS_LIST="[^"]*"|export PRODUCTS_LIST="${activeClientsString}"|' MEC.profile.ksh`;
};

/**
 * @desc    Constructs a complete SSH command that changes directories and
 *          executes the specified job command. It prepares the environment
 *          by sourcing the profile and navigating to the appropriate directories
 *          before running the client update command and the job command.
 * @access  Public
 *
 * @param {string} homeDir - The base directory for the Topological Task Manager.
 * @param {string} clientUpdateCommand - The command string to update the client list.
 * @param {string} jobDir - The directory where the job command will be executed.
 * @param {string} jobCommand - The command to execute the job (either packager or deployer).
 *
 * @returns {string} - A complete command string that encompasses all necessary steps
 *                     for job execution over SSH.
 */
const buildSSHCommand = (homeDir, clientUpdateCommand, jobDir, jobCommand) => {
  return `cd ${homeDir} && source ~/.profile && cd ${homeDir}WORK_DIR/ && ${clientUpdateCommand} && cd ${jobDir} && ${jobCommand}`;
};

/**
 * @desc    Handles errors that occur during the SSH connection process. It logs
 *          the error message to the console and sends a 500 status response
 *          indicating that the SSH connection has failed.
 * @access  Public
 *
 * @param {Object} res - The response object used to send back the error status
 *                       and message.
 *
 * @returns {void} - This function does not return a value.
 */
const handleConnectionError = (res) => {
  console.error('SSH connection error');
  res
    .status(500)
    .send('SSH connection failed. Please check TTM Environment details.');
};

/**
 * @desc    Initiates a connection to the SSH server using the provided connection
 *          details. It utilizes the `connect` method of the SSH client to establish
 *          the connection with the specified host, port, username, and password.
 * @access  Public
 *
 * @param {Object} conn - The SSH connection object to establish the connection.
 * @param {Object} TTMConfig - An object containing the connection details:
 *                             host, port, username, and password.
 *
 * @returns {void} - This function does not return a value.
 */
const connectToSSH = (conn, { TTMhost, TTMport, TTMusername, TTMpassword }) => {
  conn.connect({
    host: TTMhost,
    port: TTMport,
    username: TTMusername,
    password: TTMpassword,
  });
};

module.exports = router;
