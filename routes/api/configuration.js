const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const loadConfigFile = require('../../utils/getConfigurationFile');
const linuxConnectionClient = require('../../utils/linuxConnectionClient');
const { Client } = require('ssh2');
/**
 * @function getConfigurationValues
 * @desc    Retrieves essential configuration values from the configuration file.
 * @access  Internal
 *
 * @returns {Promise<Object>} - A promise that resolves to an object containing:
 *   - {string} TTMhost - The hostname for the TTM connection.
 *   - {string} TTMusername - The username for the TTM connection.
 *   - {string} TTMpassword - The password for the TTM connection.
 *   - {string} TTMHome - The home directory for TTM.
 *
 * @throws {Error} Throws an error if the configuration file cannot be loaded.
 */
async function getConfigurationValues() {
  const configData = await loadConfigFile();
  const { TTMhost, TTMusername, TTMpassword, TTMHome } = configData.configData;
  return { TTMhost, TTMusername, TTMpassword, TTMHome };
}

/**
 * @route   GET /api/configuration/getConfiguration
 * @access  Public
 * @returns {Object} - JSON response containing TTM configuration values:
 *   - TTMhost {string} - The host address of the TTM server.
 *   - TTMusername {string} - The username for TTM authentication.
 *   - TTMpassword {string} - The password for TTM authentication.
 *   - TTMHome {string} - The home directory path of the TTM installation.
 */
router.get('/getConfiguration', async (req, res) => {
  try {
    const configValues = await getConfigurationValues();
    res.status(200).json(configValues);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

/**
 * @route   GET /api/configuration/getwsPort
 * @desc    Retrieve the WebSocket port configuration
 * @access  Public
 *
 * @returns {Object} - JSON response containing:
 *   - wsPort {number} - The WebSocket port defined in the TTM configuration file.
 */
router.get('/getwsPort', async (req, res) => {
  try {
    const configData = await loadConfigFile();
    res.status(200).json({ wsPort: configData.configData.port });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch WebSocket port' });
  }
});

/**
 * @desc    Updates the configuration file with new settings.
 * @access  Internal
 *
 * @param {Object} newConfig - An object containing the new configuration settings to merge into the existing configuration.
 *
 * @returns {Promise<Object>} - A promise that resolves to an object containing:
 *   - {string} message - A success message indicating the configuration was updated.
 *   - {Object} config - The updated configuration object.
 *
 * @throws {Error} Throws an error if the configuration file cannot be updated.
 */
const updateConfigFile = async (newConfig) => {
  try {
    const configData = await loadConfigFile();
    const updatedConfig = { ...configData.configData, ...newConfig };
    await fs.writeFile(
      configData.configPath,
      JSON.stringify(updatedConfig, null, 2)
    );
    return {
      message: 'Configuration updated successfully',
      config: updatedConfig,
    };
  } catch (error) {
    console.error('Error updating config file:', error);
    throw new Error('Failed to update configuration file');
  }
};

/**
 * @route   POST /api/configuration/setConfiguration
 * @desc    Update TTM configuration settings
 * @access  Public
 *
 * @param {Object} req.body - New configuration data to update
 *
 * @returns {Object} - JSON response with:
 *   - {Object} config - The updated configuration object on success
 *   - {Object} error - An error message if the update fails or invalid data is provided
 */
router.post('/setConfiguration', async (req, res) => {
  const { body: newConfig } = req;
  if (!newConfig || typeof newConfig !== 'object') {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  try {
    const result = await updateConfigFile(newConfig);
    res.status(200).json(result.config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/configuration/getReportEmail
 * @desc    Retrieve the report email configuration from the MEC.profile file
 * @access  Public
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 *
 * @returns {Object} - JSON response with:
 *   - {Object} emailConfig - The report email configuration object on success
 *   - {Object} error - An error message if fetching the configuration fails
 *
 */
router.get('/getReportEmail', async (req, res) => {
  const configData = await loadConfigFile();

  try {
    const emailConfig = await fetchReportEmailConfig(
      configData.configData.TTMHome
    );
    res.status(200).json(emailConfig);
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to fetch report email configuration' });
  }
});

/**
 * @desc    Retrieves email configuration settings from the MEC.profile.ksh file.
 * @access  Internal
 *
 * @param {string} TTMHome - The path to the TTM home directory.
 *
 * @returns {Promise<Object>} - A promise that resolves to an object containing:
 *   - {string} emailAddresses - The list of email addresses configured for notifications.
 *   - {boolean} isEmailChecked - Indicates whether email notifications are enabled.
 *   - {boolean} isZipFile - Indicates whether a ZIP file attachment is configured.
 */
async function fetchReportEmailConfig(TTMHome) {
  const emailCommand = `cd ${TTMHome}WORK_DIR/ && awk -F'[""]' '/export MEC_EMAIL_LIST=/{print $2}' MEC.profile.ksh`;
  const zipCommand = `cd ${TTMHome}WORK_DIR/ && awk -F'=' '/^export EMAIL_ZIP_ATTACHED_REPORT/ { gsub(/"/, "", $2); print $2 }' MEC.profile.ksh`;
  const emailResult = await linuxConnectionClient(emailCommand);
  const zipResult = await linuxConnectionClient(zipCommand);

  return {
    emailAddresses: emailResult.stdout.trim(),
    isEmailChecked: !!emailResult.stdout.trim(),
    isZipFile: zipResult.stdout.trim(),
  };
}

/**
 * @route   POST /updateMECProfileData
 * @desc    Updates the MEC profile data including email configuration and remote DB user.
 * @access  Public
 *
 * @param {Object} req - Express request object containing:
 *   - {boolean} isEmailChecked - Indicates if email reporting is enabled
 *   - {string} emailAddresses - Comma-separated list of email addresses for report delivery
 *   - {boolean} isZipFile - Determines if the report should be sent as a ZIP file
 *   - {string} remoteDBUser - Username for remote database access
 *
 * @param {Object} res - Express response object
 *
 * @returns {Object} - JSON response with:
 *   - {string} message - Success message if configuration updates successfully
 *   - {Object} error - An error message if the update fails
 */
router.post('/updateMECProfileEmail', async (req, res) => {
  const { isEmailChecked, emailAddresses, isZipFile } = req.body;

  try {
    const config = await loadConfigFile();
    const ttmHomePath = config.configData.TTMHome;

    await updateEmailSettings(
      ttmHomePath,
      isEmailChecked,
      emailAddresses,
      isZipFile
    );

    res.status(200).json({ message: 'Configuration updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update email configuration' });
  }
});

/**
 * @route   POST /updateMECProfileRemoteDBUser
 * @desc    Updates the MEC profile with a new remote database user.
 * @access  Public
 *
 * @param {Object} req - Express request object containing:
 *   - {string} remoteDBUser - The new remote database user to be set in the profile
 *
 * @param {Object} res - Express response object
 *
 * @returns {Object} - JSON response with:
 *   - {string} message - Success message if the configuration is updated successfully
 *   - {Object} error - An error message if the update fails
 */
router.post('/updateMECProfileRemoteDBUser', async (req, res) => {
  const { remoteDBUser } = req.body;

  try {
    const config = await loadConfigFile();
    const ttmHomePath = config.configData.TTMHome;

    await updateRemoteDBUserInProfile(ttmHomePath, remoteDBUser);

    res.status(200).json({ message: 'Configuration updated successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Failed to update Remote DB user configuration' });
  }
});

/**
 * @desc    Builds and executes commands to update email configuration settings
 *          in the MEC profile based on provided parameters.
 *
 * @param {string} ttmHomePath - The base directory path for TTM (Topological Task Manager) files
 * @param {boolean} isEmailChecked - Indicates if email reporting is enabled
 * @param {string} emailAddresses - Comma-separated list of email addresses for report delivery
 * @param {boolean} isZipFile - Determines if the report should be sent as a ZIP file
 *
 * @returns {Promise<void>} - Resolves on successful command execution
 * @throws {Error} - Throws an error if command execution fails
 */
async function updateEmailSettings(
  ttmHomePath,
  isEmailChecked,
  emailAddresses,
  isZipFile
) {
  const emailCommands = buildEmailConfigCommands(
    ttmHomePath,
    isEmailChecked,
    emailAddresses,
    isZipFile
  );
  await linuxConnectionClient(emailCommands);
}

/**
 * @desc    Updates the REMOTE_DB_USER variable in the MEC.profile.ksh file to a new specified value.
 *
 * @param {string} ttmHomePath - The base directory path for TTM (Topological Task Manager) files
 * @param {string} remoteDBUser - The username to be set for REMOTE_DB_USER in MEC.profile.ksh
 *
 * @returns {Promise<void>} - Resolves on successful command execution
 * @throws {Error} - Throws an error if command execution fails
 */
async function updateRemoteDBUserInProfile(ttmHomePath, remoteDBUser) {
  const updateUserCommand = `cd ${ttmHomePath}/WORK_DIR/ && sed -i "s/^export REMOTE_DB_USER=.*/export REMOTE_DB_USER=${remoteDBUser}/" MEC.profile.ksh`;
  await linuxConnectionClient(updateUserCommand);
}

/**
 * @desc    Constructs shell commands to configure email settings based on provided parameters.
 * @access  Internal
 *
 * @param {string} TTMHome - The path to the TTM home directory.
 * @param {boolean} isEmailChecked - Indicates whether the email feature is enabled.
 * @param {string} emailAddresses - The email addresses to set for notifications, if enabled.
 * @param {boolean} isZipFile - Indicates whether to include a ZIP file attachment with reports.
 *
 * @returns {string} - A command string that includes the necessary shell commands to configure email settings.
 */
function buildEmailConfigCommands(
  TTMHome,
  isEmailChecked,
  emailAddresses,
  isZipFile
) {
  const initEmailCommand = `sed -i 's|^export MEC_EMAIL_LIST="[^"]*"|export MEC_EMAIL_LIST=""|' MEC.profile.ksh`;
  const updateEmailCommand = `sed -i 's|^export MEC_EMAIL_LIST="[^"]*"|export MEC_EMAIL_LIST="${emailAddresses}"|' MEC.profile.ksh`;
  const enableZipCommand = `sed -i 's|^export EMAIL_ZIP_ATTACHED_REPORT=[^"]*|export EMAIL_ZIP_ATTACHED_REPORT=Y|' MEC.profile.ksh`;
  const disableZipCommand = `sed -i 's|^export EMAIL_ZIP_ATTACHED_REPORT=[^"]*|export EMAIL_ZIP_ATTACHED_REPORT=N|' MEC.profile.ksh`;

  let command = `cd ${TTMHome}/WORK_DIR/ `;

  if (isEmailChecked) {
    command += `&& ${updateEmailCommand} `;
    command += isZipFile
      ? `&& ${enableZipCommand} `
      : `&& ${disableZipCommand} `;
  } else {
    command += `&& ${initEmailCommand} && ${disableZipCommand} `;
  }
  return command;
}

/**
 * @route   POST /api/configuration/getDBDetails
 * @desc    Fetch decrypted database details for a specific client
 * @access  Public
 *
 * @param {Object} req - Express request object containing:
 *   - {string} selectedClient - Identifier for the client whose DB details are requested
 *
 * @param {Object} res - Express response object
 *
 * @returns {Object} - JSON response containing:
 *   - {Object} DBDetails - The decrypted database details for the specified client
 *   - {Object} error - An error message if the fetch operation fails
 */
router.post('/getDBDetails', async (req, res) => {
  const configData = await loadConfigFile();
  const { selectedClient } = req.body;

  try {
    const DBDetails = await fetchDBDetails(
      configData.configData.TTMHome,
      selectedClient
    );
    res.status(200).json(DBDetails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch DB details' });
  }
});

/**
 * @async
 * @desc    Fetches the decrypted database connection details for a specific client by executing decryption commands.
 * @access  Internal
 *
 * @param {string} TTMHome - The path to the TTM home directory.
 * @param {string} client - The name of the client for which to fetch the database details.
 *
 * @returns {Promise<Object>} - A promise that resolves to an object containing the client's database connection strings.
 * @returns {Promise<Object>.client} - The client name as a key with the following properties:
 * @returns {Promise<Object>.client.exists} - Indicates whether the database connection details were successfully retrieved (always true in this implementation).
 * @returns {Promise<Object>.client.SRC_DB_CONN_STRING} - The decrypted source database connection string.
 * @returns {Promise<Object>.client.TRG_DB_CONN_STRING} - The decrypted target database connection string.
 */
async function fetchDBDetails(TTMHome, client) {
  const regex = /Decrypted Value:\s*(.+)/;
  const sourceCommand = `cd ${TTMHome}packager/ && source ${TTMHome}packager/MEC_sys_functions.ksh && export DIRBIN=${TTMHome}packager/ && source ${TTMHome}WORK_DIR/MEC.profile.ksh && source ${TTMHome}WORK_DIR/MEC.profile.${client}.ksh && mec_decrypt_db_connection $SRC_DB && echo "Decrypted Value: $DECRYPTED_VALUE"`;
  const targetCommand = `cd ${TTMHome}packager/ && source ${TTMHome}packager/MEC_sys_functions.ksh && export DIRBIN=${TTMHome}packager/ && source ${TTMHome}WORK_DIR/MEC.profile.ksh  && source ${TTMHome}WORK_DIR/MEC.profile.${client}.ksh && mec_decrypt_db_connection $TAR_DB_LIST && echo "Decrypted Value: $DECRYPTED_VALUE"`;

  const sourceRes = await linuxConnectionClient(sourceCommand);
  const targetRes = await linuxConnectionClient(targetCommand);
  const targetDBValue = targetRes.stdout.match(regex);
  const sourceDBValue = sourceRes.stdout.match(regex);
  return {
    [client]: {
      exists: true,
      SRC_DB_CONN_STRING: sourceDBValue[1].trim(),
      TRG_DB_CONN_STRING: targetDBValue[1].trim(),
    },
  };
}

/**
 * @route   POST /api/configuration/updateClientsProfiles
 * @desc    Encrypt and update DB details and data pump directory for multiple clients in TTM configuration.
 * @access  Public
 *
 * @param {Object} req - Express request object containing:
 *   - {Array} clients - An array of objects representing the database details
 *     and data pump directory paths for each client that needs to be updated.
 *
 * @param {Object} res - Express response object
 *
 * @returns {Object} - JSON response containing:
 *   - {string} message - A success message indicating that DB details
 *     and data pump directory paths were updated successfully.
 *   - {Object} error - An error message if the update operation fails.
 *
 * @function updateDBDetails - Encrypts and updates the database connection details for each client.
 * @function updateDataPumpDir - Updates the data pump directory path for each client in TTM configuration.
 */
router.post('/updateDBDetails', async (req, res) => {
  const configData = await loadConfigFile();
  const { selectedProfile, source, target } = req.body;
  const { TTMHome } = configData.configData;
  try {
    await updateDBDetails(TTMHome, selectedProfile, source, target);
    res.status(200).json('DB details updated successfully');
  } catch (error) {
    res.status(500).json({ error: 'Failed to update DB details' });
  }
});

/**
 * @route   POST /updateDPDir
 * @desc    Updates the Data Pump Directory (DPDir) in the selected profile configuration.
 * @access  Public
 *
 * @param {Object} req - Express request object containing:
 *   - {string} selectedProfile - The profile for which the Data Pump Directory will be updated
 *   - {string} DPDir - The new Data Pump Directory to be set
 *   - {string} DPPath - The new path for the Data Pump Directory
 *
 * @param {Object} res - Express response object
 *
 * @returns {Object} - JSON response with:
 *   - {string} message - Success message if the directory is updated successfully
 *   - {Object} error - An error message if the update fails
 */
router.post('/updateDPDir', async (req, res) => {
  const configData = await loadConfigFile();
  const { selectedProfile, DPDir, DPPath } = req.body;
  const { TTMHome } = configData.configData;

  try {
    await updateDataPumpDir(TTMHome, selectedProfile, DPDir, DPPath);
    res.status(200).json('DP Directory updated successfully');
  } catch (error) {
    res.status(500).json({ error: 'Failed to update DP Directory' });
  }
});

/**
 * @async
 * @desc    Updates database connection details for multiple clients by encrypting source and target DB connection strings.
 * @access  Internal
 *
 * @param {string} TTMHome - The path to the TTM home directory.
 * @param {Object} clients - An object containing client names as keys and their database connection details as values.
 * @param {string} clients[client].SRC_DB_CONN_STRING - The source database connection string for the client.
 * @param {string} clients[client].TRG_DB_CONN_STRING - The target database connection string for the client.
 *
 * @returns {Promise<void>} - A promise that resolves when the updates for all clients are complete.
 */
async function updateDBDetails(TTMHome, client, source, target) {
  const sourceCommand = `( cd ${TTMHome}packager/ && source ${TTMHome}packager/MEC_sys_functions.ksh &&  export DIRBIN=${TTMHome}packager/ && source ${TTMHome}WORK_DIR/MEC.profile.ksh  && source ${TTMHome}WORK_DIR/MEC.profile.${client}.ksh && mec_encrypt_db_connection $${client}_PROPERTIES "SRC_DB" "${source}" && mec_replace_variable_value_in_profile $${client}_PROPERTIES "SRC_DB" "$SRC_DB" "$ENCRYPTED_DB_CONN")`;
  const targetCommand = `( cd ${TTMHome}packager/ && source ${TTMHome}packager/MEC_sys_functions.ksh &&  export DIRBIN=${TTMHome}packager/ && source ${TTMHome}WORK_DIR/MEC.profile.ksh  && source ${TTMHome}WORK_DIR/MEC.profile.${client}.ksh && mec_encrypt_db_connection $${client}_PROPERTIES "TAR_DB_LIST" "${target}" && mec_replace_variable_value_in_profile $${client}_PROPERTIES "TAR_DB_LIST" "$TAR_DB_LIST" "$ENCRYPTED_DB_CONN")`;
  await linuxConnectionClient(sourceCommand);
  await linuxConnectionClient(targetCommand);
}

/**
 * @function updateDataPumpDir
 * @desc    Updates the Data Pump directory and path details for multiple clients in their respective TTM configuration files.
 *          This function iterates through each client, connecting to the Linux server to modify the specified environment variables.
 *
 * @param {string} TTMHome - The base directory path for the TTM environment, where client configuration files are located.
 * @param {Object} clients - An object containing database details for each client, where each key represents a client name
 *                           and the associated value is an object with Data Pump directory (`EPCT_DP_DIR`) and path (`EPCT_DP_PATH`) information.
 *
 * @returns {Promise<void>} - A promise that resolves once all client configuration updates are complete.
 *
 * @throws {Error} - Throws an error if any command execution on the Linux server fails.
 */
async function updateDataPumpDir(TTMHome, client, DPDir, DPPath) {
  const dataPumpDirIdentidifier = `cd ${TTMHome}WORK_DIR/ && sed -i 's/^export EPCT_DP_DIR=.*$/export EPCT_DP_DIR=${DPDir}   # Define the pre-created Data Pump directory/' MEC.profile.${client}.ksh`;
  const dataPumpDirPath = `cd ${TTMHome}WORK_DIR/ && sed -i 's|^#export EPCT_DP_PATH=.*|#export EPCT_DP_PATH=${DPPath} # DP files location|' MEC.profile.${client}.ksh`;
  await linuxConnectionClient(dataPumpDirIdentidifier);
  await linuxConnectionClient(dataPumpDirPath);
}

/**
 * @route   POST /getPrePostDeploymentCommand
 * @desc    Fetch the pre or post deployment command for a specified client profile.
 * @access  Public
 *
 * @param {Object} req - Express request object containing:
 *   - {string} selectedProfile - The name of the selected client profile for which to fetch the deployment command.
 *   - {string} selectedDeployment - Indicates whether to fetch the 'Pre' or 'Post' deployment command.
 *
 * @param {Object} res - Express response object
 *
 * @returns {Object} - JSON response containing:
 *   - {string} commandOutput - The output of the fetched deployment command.
 *   - {Object} error - An error message if the command fetching operation fails.
 */
router.post('/getPrePostDeploymentCommand', async (req, res) => {
  const { selectedProfile, selectedDeployment } = req.body;
  try {
    const configData = await loadConfigFile();
    const TTMHome = configData.configData.TTMHome;

    const commandOutput = await fetchDeploymentCommand(
      TTMHome,
      selectedProfile,
      selectedDeployment
    );
    res.status(200).json(commandOutput);
  } catch (error) {
    console.error('Error fetching deployment command:', error);
    res.status(500).json({ error: 'Failed to fetch deployment command' });
  }
});

/**
 * @function fetchDeploymentCommand
 * @desc    Constructs and executes a command to fetch the deployment command for a specified client profile.
 * @access  Private
 *
 * @param {string} TTMHome - The home directory for the TTM configuration.
 * @param {string} clientName - The name of the client profile for which to fetch the deployment command.
 * @param {string} deploymentType - Indicates whether to fetch the 'Pre' or 'Post' deployment command.
 *
 * @returns {string} - The trimmed output of the fetched deployment command.
 *
 * @throws {Error} - Throws an error if the command execution fails.
 */
async function fetchDeploymentCommand(TTMHome, clientName, deploymentType) {
  const command = buildCommand(TTMHome, clientName, deploymentType);
  const commandResponse = await linuxConnectionClient(command);
  return commandResponse.stdout.trim();
}

/**
 * @function buildCommand
 * @desc    Constructs a shell command to retrieve the specified deployment command for a given client profile.
 * @access  Private
 *
 * @param {string} TTMHome - The home directory for the TTM configuration.
 * @param {string} clientName - The name of the client profile for which to build the command.
 * @param {string} deploymentType - Indicates whether to build a command for the 'Pre' or 'Post' deployment.
 *
 * @returns {string} - The constructed shell command to be executed.
 *
 * @example
 * // Returns a command to retrieve the pre-deployment command for a specific client
 * const command = buildCommand('/path/to/TTM/', 'OMS_SE', 'Pre');
 */
function buildCommand(TTMHome, clientName, deploymentType) {
  const commandType =
    deploymentType === 'Pre' ? 'PRE_EPCT_COMMAND' : 'POST_EPCT_COMMAND';
  return `cd ${TTMHome}WORK_DIR && grep -E '^[[:space:]]*[#]?[[:space:]]*export[[:space:]]+${commandType}=".+".*' MEC.profile.${clientName}.ksh`;
}

/**
 * @route   POST /updatePrePostDeploymentCommand
 * @desc    Updates the specified Pre or Post deployment command for a given client profile.
 *          This endpoint receives the profile name, deployment type, and new command
 *          from the request body, then updates the corresponding command in the
 *          client's profile script.
 * @access  Public
 *
 * @param {Object} req - Express request object containing:
 *   - {string} selectedProfile - The name of the client profile to be updated.
 *   - {string} selectedDeployment - The type of deployment ('Pre' or 'Post').
 *   - {string} scriptCommand - The new script command to set for the deployment.
 *
 * @param {Object} res - Express response object
 *
 * @returns {string} - A success message indicating that the command has been updated.
 * @returns {Object} - An error message if the update operation fails.
 */
router.post('/updatePrePostDeploymentCommand', async (req, res) => {
  const {
    selectedProfile,
    selectedDeployment,
    scriptCommand,
    enableDeployment,
  } = req.body;
  try {
    const configData = await loadConfigFile();
    const TTMHome = configData.configData.TTMHome;

    await updateDeploymentCommand(
      TTMHome,
      selectedProfile,
      selectedDeployment,
      scriptCommand,
      enableDeployment
    );

    res.status(200).send('Change Succeeded!');
  } catch (error) {
    console.error('Error updating deployment command:', error);
    res.status(500).send(`Failed to update ${selectedDeployment} command`);
  }
});

/**
 * @function updateDeploymentCommand
 * @desc    Updates the specified deployment command in the client's profile script.
 * @access  Private
 *
 * @param {string} TTMHome - The home directory for the TTM configuration.
 * @param {string} clientName - The name of the client profile to update.
 * @param {string} deploymentType - Indicates the type of deployment ('Pre' or 'Post').
 * @param {string} deploymentCommand - The new command to set for the specified deployment type.
 *
 * @returns {Promise} - Resolves when the command has been successfully executed.
 */
async function updateDeploymentCommand(
  TTMHome,
  clientName,
  deploymentType,
  deploymentCommand,
  enableDeployment
) {
  const command = constructUpdateCommand(
    TTMHome,
    clientName,
    deploymentType,
    deploymentCommand,
    enableDeployment
  );
  const commandResponse = await linuxConnectionClient(command);
  return commandResponse;
}

/**
 * @function constructUpdateCommand
 * @desc    Constructs the shell command for updating the deployment command in the client profile script.
 * @access  Private
 *
 * @param {string} TTMHome - The home directory for the TTM configuration.
 * @param {string} clientName - The name of the client profile to update.
 * @param {string} deploymentType - Indicates the type of deployment ('Pre' or 'Post').
 * @param {string} deploymentCommand - The new command to set for the specified deployment type.
 *
 * @returns {string} - The constructed shell command to be executed.
 */
function constructUpdateCommand(
  TTMHome,
  clientName,
  deploymentType,
  deploymentCommand,
  enableDeployment
) {
  const commandType =
    deploymentType === 'Pre' ? 'PRE_EPCT_COMMAND' : 'POST_EPCT_COMMAND';
  let command;
  if (enableDeployment) {
    command = `cd ${TTMHome}WORK_DIR && 
    sed -i '/^export ${commandType}/d; /^#export ${commandType}/d' MEC.profile.${clientName}.ksh &&
    sed -i '/# . . . . . . . . .  PLEASE DO NOT EXIT BELOW THIS LINE . . . . . . . . . . . . # . . . . . . . . . ./i export ${commandType}="${deploymentCommand}"' MEC.profile.${clientName}.ksh`;
  } else {
    command = `cd ${TTMHome}WORK_DIR &&
    sed -i '/^export ${commandType}=""$/d' MEC.profile.${clientName}.ksh &&
    sed -i 's|^export ${commandType}="\\(.*\\)"|#export ${commandType}="\\1"|' MEC.profile.${clientName}.ksh &&
    sed -i '/# . . . . . . . . .  PLEASE DO NOT EXIT BELOW THIS LINE . . . . . . . . . . . . # . . . . . . . . . ./i export ${commandType}=""' MEC.profile.${clientName}.ksh
    `;
  }
  return command;
}

router.get('/getMECProfileData', async (req, res) => {
  try {
    const configData = await loadConfigFile();
    const TTMHome = configData.configData.TTMHome;
    const command = `cd ${TTMHome}WORK_DIR && cat MEC.profile.ksh`;
    const commandResponse = await linuxConnectionClient(command);
    res.status(200).json(commandResponse.stdout);
  } catch (error) {
    console.error('Error fetching deployment command:', error);
    res.status(500).json({ error: 'Failed to fetch deployment command' });
  }
});

router.post('/pingSolr', async (req, res) => {
  try {
    const { Username, Password, Host } = req.body;
    const command = `cd ~/JEE/SolrProduct/scripts/SolrDomain_SolrServer/SolrServer && ./pingSolrServer.sh`;
    const commandResponse = await linuxConnectionClientSolr(
      command,
      Username,
      Password,
      Host
    );
    res.status(200).json(commandResponse.stdout);
  } catch (error) {
    console.error('Error fetching deployment command:', error);
    res.status(500).json({ error: error.errorMessage });
  }
});

router.post('/startSolr', async (req, res) => {
  try {
    const { Username, Password, Host } = req.body;
    const command = `cd ~/JEE/SolrProduct/scripts/SolrDomain_SolrServer/SolrServer && ./startSolrServer.sh`;
    const commandResponse = await linuxConnectionClientSolr(
      command,
      Username,
      Password,
      Host
    );
    res.status(200).json(commandResponse.stdout);
  } catch (error) {
    console.error('Error fetching deployment command:', error);
    res.status(500).json({ error: error.errorMessage });
  }
});

const linuxConnectionClientSolr = async (
  executionCommand,
  Username,
  Password,
  Host
) => {
  const config = await loadConfigFile();
  let stdout = '';
  let stderr = '';

  const responseObject = { stdout: '', stderr: '', code: 0, errorMessage: '' };

  return new Promise((resolve, reject) => {
    try {
      const conn = new Client();

      conn.on('ready', () => {
        conn.exec(executionCommand, (err, stream) => {
          if (err) {
            console.error('Command execution error:', err);
            responseObject.errorMessage = 'Command execution failed!';
            return reject(responseObject);
          }

          stream.on('data', (data) => {
            stdout += data.toString();
          });

          stream.stderr.on('data', (data) => {
            stderr += data.toString();
          });

          stream.on('close', (code, signal) => {
            responseObject.stdout = stdout;
            responseObject.stderr = stderr;
            responseObject.code = code;

            conn.end();
            resolve(responseObject);
          });
        });
      });

      conn.on('error', (err) => {
        responseObject.errorMessage =
          'SSH connection failed, check connection details of Solr Environment';
        reject(responseObject);
      });

      conn.connect({
        host: Host,
        port: config.configData.TTMport,
        username: Username,
        password: Password,
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      responseObject.errorMessage = 'Unexpected error occurred';
      reject(responseObject);
    }
  });
};

module.exports = router;
