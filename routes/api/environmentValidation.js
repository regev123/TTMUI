const express = require('express');
const router = express.Router();
const loadConfigFile = require('../../utils/getConfigurationFile');
const { v4: uuidv4 } = require('uuid');
const linuxConnectionClient = require('../../utils/linuxConnectionClient');

/**
 * @route   POST /api/environmentValidation/getTNSPingInternal
 * @desc    Validate the connection to the specified database instance using TNS ping
 * @access  Public
 *
 * @param {Object} req - Express request object containing the database instance in the body
 * @param {Object} res - Express response object for sending back the response
 *
 * @returns {Object} - JSON response with:
 *   - {Object} success - An object indicating success with host and port on successful connection
 *   - {Object} error - An error message if the TNS ping fails or if the host/port are invalid
 *
 */
router.post('/getDBHost', async (req, res) => {
  await handleRequest(res, async () => {
    const config = await loadConfigFile();
    const { clientName, clientType } = req.body;
    const TNSPingCommand = createDBHostCommand(config, clientName, clientType);
    const TNSPingResponse = await linuxConnectionClient(TNSPingCommand);
    const DBHost = extractHost(TNSPingResponse.stdout);
    validateHostAndPort(res, DBHost);
  });
});

/**
 * @route   POST /api/environmentValidation/checkSSHConnection
 * @desc    Validate the SSH connection to a specified user and host
 * @access  Public
 *
 * @param {Object} req - Express request object containing the SSH user and host in the body
 * @param {Object} res - Express response object for sending back the response
 *
 * @returns {Object} - JSON response with:
 *   - {Object} success - A message indicating a successful SSH connection
 *   - {Object} error - An error message if the SSH connection fails
 *
 */
router.post('/checkSSHConnection', async (req, res) => {
  await handleRequest(res, async () => {
    const config = await loadConfigFile();
    const sshCheckCommand = createSSHCheckCommand(
      config,
      req.body.sshUserAndHost
    );
    const SSHConnectionResponse = await linuxConnectionClient(sshCheckCommand);
    respondToSSHConnection(res, SSHConnectionResponse.stdout.trim());
  });
});

/**
 * @route   POST /api/environmentValidation/checkDirectory
 * @desc    Validate the existence of a specified directory on a remote server via SSH
 * @access  Public
 *
 * @param {Object} req - Express request object containing SSH user, host, and directory path in the body
 * @param {Object} res - Express response object for sending back the response
 *
 * @returns {Object} - JSON response with:
 *   - {Object} success - A message indicating that the directory exists
 *   - {Object} error - An error message if the directory is not found
 *
 */
router.post('/checkDirectory', async (req, res) => {
  await handleRequest(res, async () => {
    const config = await loadConfigFile();
    const checkDirCommand = createCheckDirectoryCommand(
      config,
      req.body.sshUserAndHost,
      req.body.DPDIRPath
    );
    const checkDirectoryResponse = await linuxConnectionClient(checkDirCommand);
    respondToDirectoryCheck(res, checkDirectoryResponse.stdout.trim());
  });
});

/**
 * @route   POST /api/environmentValidation/checkDataPumpDump
 * @desc    Validate database connection, TTM directory, and create a data pump dump on a remote server
 * @access  Public
 *
 * @param {Object} req - Express request object containing DB connection string and TTM directory identifier in the body
 * @param {Object} res - Express response object for sending back the response
 *
 * @returns {Object} - JSON response with:
 *   - {Object} success - A message indicating that the dump creation succeeded
 *   - {Object} error - An error message if the dump creation fails
 *
 */
router.post('/checkDataPumpDump', async (req, res) => {
  await handleRequest(res, async () => {
    await validateDatabaseConnection(req.body.DBConnectionString);
    await validateTTMDirectory(
      req.body.TTMDirDBIdentifier,
      req.body.DBConnectionString
    );

    const config = await loadConfigFile();
    const dumpCommand = createDumpCommand(
      config,
      req.body.DBConnectionString,
      req.body.TTMDirDBIdentifier
    );
    const dumpResponse = await linuxConnectionClient(dumpCommand);
    handleDumpCreationResponse(res, dumpResponse.stderr);
  });
});

/**
 * @route   POST /api/environmentValidation/checkDBConnection
 * @desc    Validate the database connection using the provided connection string
 * @access  Public
 *
 * @param {Object} req - Express request object containing the database connection string in the body
 * @param {Object} res - Express response object for sending back the response
 *
 * @returns {Object} - JSON response with:
 *   - {Object} success - A message indicating that the validation was successful
 *   - {Object} error - An error message if the validation fails
 *
 */
router.post('/checkDBConnection', async (req, res) => {
  await handleRequest(res, async () => {
    const config = await loadConfigFile();
    const dbConnectionString = req.body.DBConnectionString;
    const output = await validateDBConnection(config, dbConnectionString);

    handleValidationResponse(res, output);
  });
});

// Utility Functions

/**
 * @desc    Handles the request, executes the provided callback, and catches any errors to send a response.
 * @access  Internal
 *
 * @param {Object} res - Express response object for sending back the response
 * @param {Function} callback - The function to execute for handling the request
 *
 * @returns {Promise} - Resolves when the callback is executed successfully
 */
const handleRequest = async (res, callback) => {
  try {
    await callback();
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * @desc    Validates the host and port extracted from the TNS Ping response.
 * @access  Internal
 *
 * @param {Object} res - Express response object for sending back the response
 * @param {string} host - The host extracted from the response
 * @param {string} port - The port extracted from the response
 *
 * @returns {Object} - JSON response indicating the validity of the host and port
 */
const validateHostAndPort = (res, host) => {
  if (!host) {
    return res.status(400).json('Invalid DB Host');
  }
  res.status(200).json({ host: host.trimStart() });
};

/**
 * @desc    Creates a TNS Ping command using the provided configuration and database instance.
 * @access  Internal
 *
 * @param {Object} config - The configuration object containing TTMHome
 * @param {string} dbInstance - The database instance to ping
 *
 * @returns {string} - The constructed TNS Ping command
 */
const createDBHostCommand = (config, clientName, clientType) => {
  const TTMHome = config.configData.TTMHome;
  const dbUrlString = clientType === 'Source' ? '$SRC_DB' : '$TAR_DB_LIST';
  const getDBServerHostCommand = `cd ${TTMHome}packager/ && source ~/.profile && source ${TTMHome}packager/MEC_sys_functions.ksh && export DIRBIN=${TTMHome}packager/ && source ${TTMHome}WORK_DIR/MEC.profile.ksh &&source ${TTMHome}WORK_DIR/MEC.profile.${clientName}.ksh && mec_decrypt_db_connection ${dbUrlString} && epct_get_db_server_name $DECRYPTED_VALUE && echo "DB SERVER HOST: $DB_SERVER_HOST"`;
  return getDBServerHostCommand;
};

/**
 * @desc    Extracts the host and port from the TNS Ping command output.
 * @access  Internal
 *
 * @param {string} stdout - The standard output from the TNS Ping command
 *
 * @returns {Object} - An object containing the host and port
 */
const extractHost = (stdout) => {
  const hostMatch = stdout.match(/DB SERVER HOST:([^\)]+)/);
  return hostMatch ? hostMatch[1] : null;
};

/**
 * @desc    Creates an SSH check command using the provided configuration and user/host.
 * @access  Internal
 *
 * @param {Object} config - The configuration object containing TTMHome
 * @param {string} sshUserAndHost - The SSH user and host to check the connection
 *
 * @returns {string} - The constructed SSH check command
 */
const createSSHCheckCommand = (config, sshUserAndHost) => {
  return `cd ${
    config.configData.TTMHome
  } && source ~/.profile && ssh -o BatchMode=yes ${sshUserAndHost.trim()} exit && echo "SSH connection successful" || echo "SSH connection failed"`;
};

/**
 * @desc    Responds to the SSH connection check with a success or failure message.
 * @access  Internal
 *
 * @param {Object} res - Express response object for sending back the response
 * @param {string} stdout - The standard output from the SSH command
 *
 * @returns {Object} - JSON response indicating the result of the SSH connection check
 */
const respondToSSHConnection = (res, stdout) => {
  const message = stdout.includes('SSH connection successful')
    ? 'SSH connection successful'
    : 'SSH connection failed';
  const status = message === 'SSH connection successful' ? 200 : 400;
  res.status(status).json({ message });
};

/**
 * @desc    Creates a command to check the existence of a directory on a remote server.
 * @access  Internal
 *
 * @param {Object} config - The configuration object containing TTMHome
 * @param {string} sshUserAndHost - The SSH user and host to check the directory
 * @param {string} dirPath - The directory path to check
 *
 * @returns {string} - The constructed command to check the directory
 */
const createCheckDirectoryCommand = (config, sshUserAndHost, dirPath) => {
  return `cd ${
    config.configData.TTMHome
  } && source ~/.profile && ssh ${sshUserAndHost.trim()} '[ -d ${dirPath} ] && echo "found" || echo "not found"'`;
};

/**
 * @desc    Responds to the directory check with a success or failure message.
 * @access  Internal
 *
 * @param {Object} res - Express response object for sending back the response
 * @param {string} stdout - The standard output from the directory check command
 *
 * @returns {Object} - JSON response indicating the result of the directory check
 */
const respondToDirectoryCheck = (res, stdout) => {
  const message = stdout.includes('found')
    ? 'Directory found'
    : 'Directory not found';
  const status = message === 'Directory found' ? 200 : 400;
  res.status(status).json({ message });
};

/**
 * @desc    Validates the database connection using the provided connection string.
 * @access  Internal
 *
 * @param {string} dbConnectionString - The database connection string to validate
 *
 * @throws {Error} - Throws an error if the validation fails
 */
const validateDatabaseConnection = async (dbConnectionString) => {
  const validationMessage = await clientsValidation(dbConnectionString);
  if (validationMessage !== 'Validation successful') {
    throw new Error('DB user or password is incorrect');
  }
};

/**
 * @desc    Validates the TTM directory using the provided identifier and connection string.
 * @access  Internal
 *
 * @param {string} ttmDirDBIdentifier - The identifier for the TTM directory to validate
 * @param {string} dbConnectionString - The database connection string to use for validation
 *
 * @throws {Error} - Throws an error if the directory validation fails
 */
const validateTTMDirectory = async (ttmDirDBIdentifier, dbConnectionString) => {
  const directoryValidationMessage = await DirectoryOnDBValidation(
    ttmDirDBIdentifier,
    dbConnectionString
  );
  if (directoryValidationMessage === 'no rows selected') {
    throw new Error('TTM dir DB identifier is incorrect');
  }
};

/**
 * @desc    Creates a command for data pump export using the provided configuration and identifiers.
 * @access  Internal
 *
 * @param {Object} config - The configuration object containing TTMHome
 * @param {string} dbConnectionString - The database connection string for the export
 * @param {string} ttmDirDBIdentifier - The TTM directory identifier for the export
 *
 * @returns {string} - The constructed command for data pump export
 */
const createDumpCommand = (config, dbConnectionString, ttmDirDBIdentifier) => {
  const uuid = uuidv4();
  return `cd ${config.configData.TTMHome} && source ~/.profile && expdp ${dbConnectionString} tables=EPC1_DISTRIB_VERSION directory=${ttmDirDBIdentifier} dumpfile=TTM_dmp_test_${uuid}.dmp logfile=TTM_dmp_test_${uuid}.log`;
};

/**
 * @desc    Handles the response from a dump creation command.
 * @access  Internal
 *
 * @param {Object} res - Express response object for sending back the response
 * @param {string} stderrData - The standard error output from the dump creation command
 *
 * @returns {Object} - JSON response indicating the result of the dump creation
 */
const handleDumpCreationResponse = (res, stderrData) => {
  const isSuccess = stderrData.includes('successfully completed');
  const status = isSuccess ? 200 : 500;
  const message = isSuccess
    ? 'Dump Creation Succeeded'
    : 'Dump Creation Failed';
  res.status(status).json(message);
};

/**
 * @desc    Validates the client using the provided database connection string.
 * @access  Internal
 *
 * @param {string} DBConnectionString - The database connection string to validate
 *
 * @returns {string} - A message indicating the result of the validation
 */
const clientsValidation = async (DBConnectionString) => {
  try {
    const config = await loadConfigFile();
    const sqlCommand = buildValidationSQL();
    const ClientsValidationResponse = await executeDatabaseCommand(
      config,
      DBConnectionString,
      sqlCommand
    );

    return isValidationSuccessful(ClientsValidationResponse.stdout)
      ? 'Validation successful'
      : 'Validation failed';
  } catch (error) {
    console.error('Error during clients validation:', error);
    return 'Validation failed';
  }
};

/**
 * @desc    Executes a SQL command on the database using the provided connection string.
 * @access  Internal
 *
 * @param {Object} config - The configuration object containing TTMHome
 * @param {string} DBConnectionString - The database connection string to execute against
 * @param {string} sqlCommand - The SQL command to execute
 *
 * @returns {Object} - The response from executing the command
 */
const executeDatabaseCommand = async (
  config,
  DBConnectionString,
  sqlCommand
) => {
  const command = `cd ${config.configData.TTMHome} && source ~/.profile && echo "${sqlCommand}" | sqlplus -S ${DBConnectionString}`;
  return await linuxConnectionClient(command);
};

/**
 * @desc    Checks if the validation response indicates success.
 * @access  Internal
 *
 * @param {string} validationResponse - The validation response to check
 *
 * @returns {boolean} - True if validation is successful, otherwise false
 */
const isValidationSuccessful = (stdoutData) => {
  return (
    stdoutData.includes('PL/SQL procedure successfully completed') ||
    stdoutData.includes('Connected')
  );
};

/**
 * @desc    Validates the existence of the TTM directory in the database.
 * @access  Internal
 *
 * @param {string} ttmDirDBIdentifier - The identifier for the TTM directory to validate
 * @param {string} dbConnectionString - The database connection string for the validation
 *
 * @returns {string} - The result of the validation
 */
const DirectoryOnDBValidation = async (
  TTMDirDBIdentifier,
  DBConnectionString
) => {
  try {
    const config = await loadConfigFile();
    const query = buildDirectoryQuery(TTMDirDBIdentifier);
    const DirectoryOnDBResponse = await executeDatabaseQuery(
      config,
      DBConnectionString,
      query
    );

    return DirectoryOnDBResponse.stdout.trim();
  } catch (error) {
    console.error('Error during directory validation:', error);
    return 'Validation failed';
  }
};

/**
 * @desc    Builds a SQL query to select the directory name and path from the database based on the given TTM directory identifier.
 * @access  Internal
 *
 * @param {string} TTMDirDBIdentifier - The identifier for the TTM directory to query
 *
 * @returns {string} - The constructed SQL query string
 */
const buildDirectoryQuery = (TTMDirDBIdentifier) => {
  return `SELECT DIRECTORY_NAME, DIRECTORY_PATH FROM all_directories WHERE DIRECTORY_NAME='${TTMDirDBIdentifier}';`;
};

/**
 * @desc    Executes a SQL query against the database using the provided connection string and configuration.
 * @access  Internal
 *
 * @param {Object} config - The configuration object containing necessary paths and settings.
 * @param {string} DBConnectionString - The connection string for the database to connect to.
 * @param {string} query - The SQL query string to be executed.
 *
 * @returns {Promise<Object>} - The response from executing the database command, which includes stdout and stderr.
 */
const executeDatabaseQuery = async (config, DBConnectionString, query) => {
  const command = `cd ${config.configData.TTMHome} && source ~/.profile && echo "${query}" | sqlplus -S ${DBConnectionString}`;
  return await linuxConnectionClient(command);
};

/**
 * @desc    Validates the database connection using the provided connection string.
 * @access  Internal
 *
 * @param {Object} config - The configuration object containing necessary paths and settings.
 * @param {string} dbConnectionString - The connection string for the database to validate.
 *
 * @returns {Promise<Object>} - The response from executing the validation command, which includes stdout and stderr.
 */
const validateDBConnection = async (config, dbConnectionString) => {
  const sqlCommand = buildValidationSQL();
  return await linuxConnectionClient(
    `cd ${config.configData.TTMHome} && source ~/.profile && echo "${sqlCommand}" | sqlplus -S ${dbConnectionString}`
  );
};

/**
 * @desc    Builds the SQL command for validating a database connection.
 * @access  Internal
 *
 * @returns {string} - The SQL command string to validate the connection.
 */
const buildValidationSQL = () => {
  return `
    WHENEVER SQLERROR EXIT SQL.SQLCODE
    BEGIN
      NULL; 
    END;
    /
  `;
};

/**
 * @desc    Handles the response of the database validation process.
 * @access  Internal
 *
 * @param {Object} res - Express response object used to send the response.
 * @param {Object} output - The output from the validation command execution.
 *
 * @returns {void} - Sends a JSON response with the validation result.
 */
const handleValidationResponse = (res, output) => {
  const isSuccess =
    output.stdout.includes('PL/SQL procedure successfully completed') ||
    output.stdout.includes('Connected');
  const status = isSuccess ? 200 : 400;
  const message = isSuccess ? 'Validation successful' : 'Validation failed';
  res.status(status).json(message);
};

/**
 * @desc    Handles errors that occur during request processing.
 * @access  Internal
 *
 * @param {Object} res - Express response object used to send the error response.
 * @param {Error} error - The error object containing the error message.
 *
 * @returns {void} - Sends a 500 status response with the error message.
 */
const handleError = (res, error) => {
  res.status(500).send(error.message);
};

module.exports = router;
