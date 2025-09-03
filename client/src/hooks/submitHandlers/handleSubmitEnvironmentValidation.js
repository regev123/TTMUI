import api from '../../utils/api';

/**
 * @function validate
 * @desc    Validates various environmental checks for a selected client, including database connection,
 *          SSH connection, directory path, and data pump dump creation.
 * @param {Event} e - The form submission event.
 * @param {string} selectedClient - The selected client name and type (e.g., 'ClientName Source').
 * @param {Function} setDisableSubmit - Function to disable/enable the submit button.
 * @param {Function} setValidations - Function to update validation states for various checks.
 * @param {Function} setAlert - Function to display alert messages.
 */
const validate = async (
  e,
  selectedClient,
  setDisableSubmit,
  setValidations,
  setAlert,
  isEnvObfuscated
) => {
  e.preventDefault();
  setDisableSubmit(true);
  setValidationsLoading('TNSPing', setValidations);
  if (isEnvObfuscated)
    await api.post('/obfuscation/copyObfuscationInputFileToEnvironment');
  const { clientName, clientType } = getClientDetails(selectedClient);

  try {
    const { dbUser, dbPassword, dbInstance } = await getDBDetails(
      clientName,
      clientType,
      setValidations
    );
    const dbHost = await getDBHost(
      clientName,
      clientType,
      setAlert,
      setValidations
    );
    const DBServerUser = await getRemoteDBUser(setValidations);
    await isValidSSHConnection(DBServerUser, dbHost, setAlert, setValidations);
    const DPDirPath = await getDPDIRPath(setValidations, clientName);
    await isValidDPDirectory(
      DPDirPath,
      DBServerUser,
      dbHost,
      setValidations,
      setAlert
    );
    const TTMDBDirIdentifier = await getTTMDirDBIdentifier(
      setValidations,
      clientName
    );
    await isValidDumpCreation(
      TTMDBDirIdentifier,
      dbUser,
      dbPassword,
      dbInstance,
      setValidations,
      setAlert
    );
  } catch (error) {
    handleApiError(error, setDisableSubmit, setAlert);
    return;
  } finally {
    setDisableSubmit(false);
    setAlert('');
  }
};

/**
 * @function isValidTNSPing
 * @desc    Validates the TNS ping connection to the given database instance.
 * @param {string} dbInstance - The database instance to check.
 * @param {Function} setAlert - Function to display alert messages.
 * @param {Function} setValidations - Function to update validation status.
 * @returns {string} - The database host if TNS ping is successful.
 */
const getDBHost = async (clientName, clientType, setAlert, setValidations) => {
  try {
    const {
      data: { host },
    } = await api.post('/environmentValidation/getDBHost', {
      clientName,
      clientType,
    });
    updateValidationStatus('TNSPing', 'success', `${host}`, setValidations);
    return host;
  } catch (error) {
    updateValidationStatus(
      'TNSPing',
      'failed',
      'TNSPing validation failed',
      setValidations
    );
    clearAlert(setAlert);
    throw error;
  }
};

/**
 * @function isValidSSHConnection
 * @desc    Validates the SSH connection to the given DB host using the provided DB user.
 * @param {string} DBServerUser - The remote database user for SSH connection.
 * @param {string} dbHost - The database host for the SSH connection.
 * @param {Function} setAlert - Function to display alert messages.
 * @param {Function} setValidations - Function to update validation status.
 */
const isValidSSHConnection = async (
  DBServerUser,
  dbHost,
  setAlert,
  setValidations
) => {
  try {
    await api.post('/environmentValidation/checkSSHConnection', {
      sshUserAndHost: `${DBServerUser}@${dbHost}`,
    });
    updateValidationStatus(
      'SSHConnection',
      'success',
      'SSH connection successful',
      setValidations
    );
  } catch (error) {
    updateValidationStatus(
      'SSHConnection',
      'failed',
      'SSH connection failed',
      setValidations
    );
    clearAlert(setAlert);
    throw error;
  }
};

/**
 * @function isValidDPDirectory
 * @desc    Validates whether the Data Pump directory exists on the DB host.
 * @param {string} DPDIRPath - The path to the Data Pump directory.
 * @param {string} DBServerUser - The remote database user for SSH connection.
 * @param {string} dbHost - The database host.
 * @param {Function} setValidations - Function to update validation status.
 * @param {Function} setAlert - Function to display alert messages.
 */
const isValidDPDirectory = async (
  DPDIRPath,
  DBServerUser,
  dbHost,
  setValidations,
  setAlert
) => {
  try {
    await api.post('/environmentValidation/checkDirectory', {
      DPDIRPath,
      sshUserAndHost: `${DBServerUser}@${dbHost}`,
    });
    updateValidationStatus(
      'DPDir',
      'success',
      'Directory found',
      setValidations
    );
  } catch (error) {
    updateValidationStatus(
      'DPDir',
      'failed',
      'Directory not found',
      setValidations
    );
    clearAlert(setAlert);
    throw error;
  }
};

/**
 * @function isValidDumpCreation
 * @desc    Validates if the Data Pump dump creation is successful.
 * @param {string} TTMDirDBIdentifier - The Data Pump directory identifier.
 * @param {string} dbUser - The database user.
 * @param {string} dbPassword - The database password.
 * @param {string} dbInstance - The database instance.
 * @param {Function} setValidations - Function to update validation status.
 * @param {Function} setAlert - Function to display alert messages.
 */
const isValidDumpCreation = async (
  TTMDirDBIdentifier,
  dbUser,
  dbPassword,
  dbInstance,
  setValidations,
  setAlert
) => {
  try {
    const response = await api.post(
      '/environmentValidation/checkDataPumpDump',
      {
        TTMDirDBIdentifier,
        DBConnectionString: `${dbUser}/${dbPassword}@${dbInstance}`,
      }
    );
    updateValidationStatus(
      'DumpCreation',
      'success',
      response.data,
      setValidations
    );
  } catch (error) {
    updateValidationStatus(
      'DumpCreation',
      'failed',
      error.response.data,
      setValidations
    );
    clearAlert(setAlert);
  }
};

/**
 * @function setValidationsLoading
 * @desc    Sets the validation status to 'loading' for the specified key.
 * @param {string} key - The validation key (e.g., 'TNSPing', 'SSHConnection').
 * @param {Function} setValidations - Function to update validation status.
 */
const setValidationsLoading = (key, setValidations) => {
  setValidations((prev) => ({ ...prev, [key]: { status: 'loading' } }));
};

/**
 * @function getDBDetails
 * @desc    Fetches the database connection details for the selected client and client type.
 * @param {string} clientName - The name of the selected client.
 * @param {string} clientType - The type of client (Source or Target).
 * @param {Function} setValidations - Function to update validation status.
 * @returns {Object} - Contains dbUser, dbPassword, and dbInstance.
 */
const getDBDetails = async (clientName, clientType, setValidations) => {
  const DBDetailsResponse = await api.post('/util/getDBDetails', {
    selected: clientName,
  });

  return parseDBConnectionString(
    DBDetailsResponse.data[clientName],
    clientType
  );
};

/**
 * @function getRemoteDBUser
 * @desc    Fetches the remote database user for SSH connections.
 * @param {Function} setValidations - Function to update validation status.
 * @returns {string} - The remote database user.
 */
const getRemoteDBUser = async (setValidations) => {
  setValidationsLoading('SSHConnection', setValidations);

  const RemoteDBUserResponse = await api.get('/util/getRemoteDBUser');
  return RemoteDBUserResponse.data;
};

/**
 * @function getDPDIRPath
 * @desc    Fetches the Data Pump directory path for the selected client.
 * @param {Function} setValidations - Function to update validation status.
 * @param {string} clientName - The name of the selected client.
 * @returns {string} - The Data Pump directory path.
 */
const getDPDIRPath = async (setValidations, clientName) => {
  setValidationsLoading('DPDir', setValidations);

  const DPDirPathResponse = await api.post('/util/getDPDIRPath', {
    client: clientName,
  });

  return DPDirPathResponse.data;
};

/**
 * @function getTTMDirDBIdentifier
 * @desc    Retrieves the Data Pump directory identifier for the selected client.
 * @param {Function} setValidations - Function to update validation status.
 * @param {string} clientName - The name of the selected client.
 * @returns {string} - The Data Pump directory identifier.
 */
const getTTMDirDBIdentifier = async (setValidations, clientName) => {
  setValidationsLoading('DumpCreation', setValidations);

  const TTMDBDirIdentifier = await api.post('/util/getTTMDirDBIdentifier', {
    client: clientName,
  });

  return TTMDBDirIdentifier.data;
};

/**
 * @function updateValidationStatus
 * @desc    Updates the validation status for a specific validation check.
 * @param {string} key - The key representing the validation check (e.g., 'TNSPing', 'SSHConnection').
 * @param {string} statusMessage - The status of the validation check ('success', 'failed', etc.).
 * @param {string} messageValue - A message providing additional information about the validation result.
 * @param {Function} setValidations - Function to update the state that tracks the validation statuses.
 */
const updateValidationStatus = (
  key,
  statusMessage,
  messageValue,
  setValidations
) => {
  setValidations((prev) => ({
    ...prev,
    [key]: {
      status: statusMessage,
      message: messageValue,
    },
  }));
};

/**
 * @function handleApiError
 * @desc    Handles errors from API calls by displaying an alert message and logging the error.
 * @param {Object} error - The error object returned by the API call.
 * @param {Function} setDisableSubmit - Function to disable or enable the form's submit button.
 * @param {Function} setAlert - Function to set the alert message to display.
 */
const handleApiError = (error, setDisableSubmit, setAlert) => {
  setAlert(error.response?.data || 'An error occurred');
  console.error(error);
  setDisableSubmit(false);
};

/**
 * @function clearAlert
 * @desc    Clears any alerts set by validation functions.
 * @param {Function} setAlert - Function to clear alert messages.
 */
const clearAlert = (setAlert) => setAlert('');

/**
 * @function parseDBConnectionString
 * @desc Parses the DB connection string into user, password, and instance.
 * @param {Object} dbDetails - The DB connection details.
 * @param {string} clientType - The client type (Source or Target).
 * @returns {Object} - Contains dbUser, dbPassword, and dbInstance.
 */
const parseDBConnectionString = (dbDetails, clientType) => {
  const connString =
    clientType === 'Source'
      ? dbDetails['SRC_DB_CONN_STRING']
      : dbDetails['TRG_DB_CONN_STRING'];
  const match = connString.match(/^([^/]+)\/([^@]+)@(.+)$/);
  return { dbUser: match[1], dbPassword: match[2], dbInstance: match[3] };
};

/**
 * @function getClientDetails
 * @desc Extracts and returns the client name and type from the selected client string.
 * @param {string} selectedClient - The selected client string (e.g., 'ClientName Source').
 * @returns {Object} - Contains the client name and type.
 */
const getClientDetails = (selectedClient) => {
  const [clientName, clientType] = selectedClient.split(' ');
  return { clientName, clientType };
};

export default validate;
