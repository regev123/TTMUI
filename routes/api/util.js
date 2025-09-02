const express = require('express');
const router = express.Router();
const loadConfigFile = require('../../utils/getConfigurationFile');
const linuxConnectionClient = require('../../utils/linuxConnectionClient');

/**
 * @desc    Handles a request to retrieve a list of existing clients by
 *          navigating to the TTM (Topological Task Manager) WORK_DIR
 *          directory and listing its contents. Uses the TTMHome configuration
 *          to build the command for the specified directory, then executes
 *          the command to get the client list.
 * @access  Public
 *
 * @route   POST api/util/getExistingClients
 *
 * @param   {object} req - The HTTP request object (not used here).
 * @param   {object} res - The HTTP response object used to send back
 *                         the list of clients or an error message.
 *
 * @returns {void} - Sends a JSON response containing the list of clients
 *                   in the TTM WORK_DIR directory, or an error if the
 *                   command execution fails.
 */
router.post('/getExistingClients', (req, res) => {
  handleRequest(res, async () => {
    const TTMHome = await getTTMHome();
    const command = `cd ${TTMHome}WORK_DIR && ls`;
    const clients = await executeCommand(command);
    res.status(200).json(clients);
  });
});

/**
 * @desc    Handles a request to retrieve database connection details for
 *          a specified client. This involves decrypting both source and
 *          target database connection strings by executing shell commands
 *          in the TTM (Topological Task Manager) environment. The response
 *          includes the decrypted connection strings if the commands
 *          execute successfully.
 * @access  Public
 *
 * @route   POST api/util/getDBDetails
 *
 * @param   {object} req - The HTTP request object containing the selected
 *                         client identifier in the body.
 * @param   {object} res - The HTTP response object used to send back
 *                         the decrypted database connection details or
 *                         an error message.
 *
 * @returns {void} - Sends a JSON response with the connection strings for
 *                   the source and target databases for the specified client,
 *                   or an error if the command execution fails.
 */
router.post('/getDBDetails', (req, res) => {
  const { selected } = req.body;
  const regex = /Decrypted Value:\s*(.+)/;

  handleRequest(res, async () => {
    const TTMHome = await getTTMHome();
    const sourceCommand = buildDbCommand('SRC_DB', TTMHome, selected);
    const targetCommand = buildDbCommand('TAR_DB_LIST', TTMHome, selected);

    const sourceRes = await executeCommand(sourceCommand);
    const targetRes = await executeCommand(targetCommand);

    res.status(200).json({
      [selected]: {
        exists: true,
        SRC_DB_CONN_STRING: extractDbValue(sourceRes, regex),
        TRG_DB_CONN_STRING: extractDbValue(targetRes, regex),
      },
    });
  });
});

/**
 * @desc    Handles a request to retrieve the remote database user by
 *          navigating to the TTM (Topological Task Manager) WORK_DIR
 *          directory and extracting the REMOTE_DB_USER environment
 *          variable from the MEC profile file. Uses a command to parse
 *          and retrieve the user defined in the profile.
 * @access  Public
 *
 * @route   GET api/util/getRemoteDBUser
 *
 * @param   {object} req - The HTTP request object (not used here).
 * @param   {object} res - The HTTP response object used to send back
 *                         the remote database user or an error message.
 *
 * @returns {void} - Sends a JSON response containing the remote database
 *                   user extracted from the TTM profile, or an error if
 *                   the command execution fails.
 */
router.get('/getRemoteDBUser', (req, res) => {
  handleRequest(res, async () => {
    const TTMHome = await getTTMHome();
    const command = `cd ${TTMHome}WORK_DIR/ && awk -F'[ =]+' '/^export REMOTE_DB_USER=/ {print $3}' MEC.profile.ksh`;
    const dbUser = await executeCommand(command);
    res.status(200).json(dbUser);
  });
});

/**
 * @desc    Handles a request to retrieve the database directory identifier
 *          (EPCT_DP_DIR) for a specific client by navigating to the TTM
 *          (Topological Task Manager) WORK_DIR directory and parsing the
 *          MEC profile file for the specified client. Extracts the directory
 *          path associated with the database identifier.
 * @access  Public
 *
 * @route   POST api/util/getTTMDirDBIdentifier
 *
 * @param   {object} req - The HTTP request object, containing the client
 *                         identifier in the request body (`req.body.client`).
 * @param   {object} res - The HTTP response object used to send back
 *                         the database directory identifier or an error message.
 *
 * @returns {void} - Sends a JSON response containing the extracted database
 *                   directory identifier for the specified client, or an
 *                   error if the command execution fails.
 */
router.post('/getTTMDirDBIdentifier', (req, res) => {
  handleRequest(res, async () => {
    const TTMHome = await getTTMHome();
    const command = `cd ${TTMHome}WORK_DIR/ && awk -F'[ =]+' '/^export EPCT_DP_DIR=/ {print $3}' MEC.profile.${req.body.client}.ksh | awk '{print $1}'`;
    const dbDir = await executeCommand(command);
    res.status(200).json(dbDir);
  });
});

/**
 * @desc    Handles a request to retrieve the data processing directory path
 *          (EPCT_DP_PATH) for a specific client by navigating to the TTM
 *          (Topological Task Manager) WORK_DIR directory and parsing the
 *          MEC profile file for the specified client. Extracts the directory
 *          path from the commented export line within the profile file.
 * @access  Public
 *
 * @route   POST api/util/getDPDIRPath
 *
 * @param   {object} req - The HTTP request object, containing the client
 *                         identifier in the request body (`req.body.client`).
 * @param   {object} res - The HTTP response object used to send back
 *                         the data processing directory path or an error message.
 *
 * @returns {void} - Sends a JSON response containing the extracted data
 *                   processing directory path for the specified client,
 *                   or an error if the command execution fails.
 */
router.post('/getDPDIRPath', (req, res) => {
  handleRequest(res, async () => {
    const TTMHome = await getTTMHome();
    const command = `cd ${TTMHome}WORK_DIR/ && awk -F'=' '/^#export EPCT_DP_PATH=/ {split($2, arr, "#"); print arr[1]}' MEC.profile.${req.body.client}.ksh | xargs`;
    const dpDirPath = await executeCommand(command);
    res.status(200).json(dpDirPath);
  });
});

/**
 * @route   GET /getTTMHomePath
 * @desc    Retrieves the TTMHome path from the system.
 *          This route calls a function to get the TTMHome path and returns it in the response.
 * @access  Public
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * @returns {Object} - JSON response with:
 *   - {string} TTMHomePath - The path to the TTMHome directory.
 */
router.get('/getTTMHomePath', async (req, res) => {
  res.status(200).json({ TTMHomePath: await getTTMHome() });
});

/**
 * @desc    Executes an SSH command on a remote Linux server and handles
 *          any errors that may occur during the command execution. Throws
 *          an error if the command fails or if there is an error message
 *          in the response. Returns the trimmed output of the command if
 *          successful.
 * @access  Private
 *
 * @param   {string} command - The SSH command to execute on the remote server.
 *
 * @returns {Promise<string>} - A promise that resolves to the standard output
 *                              of the executed command, with any leading
 *                              or trailing whitespace removed.
 *
 * @throws  {Error} - Throws an error if the command execution fails
 *                    or if there is an error message in the response.
 */
const executeCommand = async (command) => {
  const response = await linuxConnectionClient(command);
  if (response.errorMessage) throw new Error(response.errorMessage);
  if (response.code !== 0) throw new Error('Command execution failed');
  return response.stdout.trim();
};

/**
 * @desc    Retrieves the TTM (Topological Task Manager) home directory path
 *          from the configuration file. Loads the configuration and accesses
 *          the TTMHome property from the config data.
 * @access  Private
 *
 * @returns {Promise<string>} - A promise that resolves to the TTM home directory
 *                              path as specified in the configuration file.
 *
 * @throws  {Error} - Throws an error if the configuration file cannot be loaded.
 */
const getTTMHome = async () => {
  const config = await loadConfigFile();
  return config.configData.TTMHome;
};

/**
 * @desc    Builds a command string to decrypt the database connection string
 *          for a specified database type. The command navigates to the TTM
 *          (Topological Task Manager) packager directory, sources required
 *          environment profiles, sets the DIRBIN variable, and invokes the
 *          `mec_decrypt_db_connection` function to decrypt the specified
 *          database connection.
 * @access  Private
 *
 * @param   {string} dbType - The type of database to decrypt (e.g., SRC_DB, TAR_DB_LIST).
 * @param   {string} TTMHome - The base directory path for the TTM installation.
 * @param   {string} selected - The client or environment profile to source
 *                              (e.g., `prod`, `dev`).
 *
 * @returns {string} - A complete SSH command string that decrypts the database
 *                     connection string and outputs the decrypted value.
 */
const buildDbCommand = (dbType, TTMHome, selected) => `
  cd ${TTMHome}packager/ &&
  source ${TTMHome}packager/MEC_sys_functions.ksh &&
  export DIRBIN=${TTMHome}packager/ &&
  source ${TTMHome}WORK_DIR/MEC.profile.ksh &&
  source ${TTMHome}WORK_DIR/MEC.profile.${selected}.ksh &&
  mec_decrypt_db_connection $${dbType} && 
  echo "Decrypted Value: \$DECRYPTED_VALUE"
`;

/**
 * @desc    Extracts the decrypted database value from a command response
 *          using a specified regular expression. Checks if the response
 *          contains a match for the pattern and returns the extracted
 *          value if found.
 * @access  Private
 *
 * @param   {string} response - The command output containing the decrypted value.
 * @param   {RegExp} regex - The regular expression pattern to match and capture
 *                           the decrypted value.
 *
 * @returns {string|null} - The extracted decrypted database value, or `null`
 *                          if no match is found.
 */
const extractDbValue = (response, regex) => {
  const match = response.match(regex);
  return match ? match[1].trim() : null;
};

/**
 * @desc    A helper function to handle asynchronous request processing with error handling.
 *          Executes a callback function and sends a 500 status response if an error occurs
 *          during execution.
 * @access  Private
 *
 * @param   {object} res - The HTTP response object used to send back the result
 *                         or an error message.
 * @param   {Function} callback - The asynchronous callback function that performs the
 *                                request's main logic.
 *
 * @returns {void} - Sends a JSON response with the callback result or an error message
 *                   if an exception is thrown.
 */
const handleRequest = async (res, callback) => {
  try {
    await callback();
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = router;
