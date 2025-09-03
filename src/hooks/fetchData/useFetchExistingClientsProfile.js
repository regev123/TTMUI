const initialFormData = {
  SRC_DB_CONN_STRING: '',
  TRG_DB_CONN_STRING: '',
  EPCT_DP_PATH: '',
  EPCT_DP_DIR: '',
};

/**
 * @function fetchExistingClientsProfile
 * @desc    Fetches the existing clients' profiles, validates the TTMHome path,
 *          retrieves the existing clients array, and maps the data to a structured format.
 *          Updates the clients' state and handles any errors during the process.
 * @access  Public
 *
 * @param {function} setIsLoadingExistingClients - Callback to set the loading state while fetching clients.
 * @param {function} setClients - Callback to set the clients' data once fetched and processed.
 * @param {function} setAlert - Callback to display alert messages in case of errors.
 *
 * @returns {Promise<void>} - Resolves once the clients' data has been fetched and processed.
 */
const fetchExistingClientsProfile = async (
  setIsLoadingExistingClients,
  setClients,
  setAlert,
  existingClientsArray
) => {
  setIsLoadingExistingClients(true);

  try {
    const clientsData = mapClientsToData(existingClientsArray);
    setClients(clientsData);
  } catch (error) {
    handleFetchError(error, setAlert);
  } finally {
    setIsLoadingExistingClients(false);
  }
};

/**
 * @function mapClientsToData
 * @desc    Maps the list of existing clients to a structured data object. Each client
 *          is checked for existence in the existing clients array and initialized with
 *          the default form data.
 * @access  Private
 *
 * @param {Array} existingClientsArray - Array of client names that exist in the system.
 * @returns {Object} - Mapped clients data where each client has its existence status and default data.
 */
const mapClientsToData = (existingClientsArray) => {
  const clientNames = ['ABP', 'OMS', 'OMS_SE', 'MCSS_SE', 'ACPE'];

  return clientNames.reduce((clientsData, client) => {
    clientsData[client] = createClientData(existingClientsArray, client);
    return clientsData;
  }, {});
};

/**
 * @function createClientData
 * @desc    Creates a data object for a specific client, indicating whether the client exists
 *          and initializing it with the default form data values.
 * @access  Private
 *
 * @param {Array} existingClientsArray - Array of existing clients in the system.
 * @param {String} clientName - The name of the client to create data for.
 * @returns {Object} - Structured client data including existence status and initial form values.
 */
const createClientData = (existingClientsArray, clientName) => {
  return {
    exists: existingClientsArray.includes(clientName),
    ...initialFormData,
  };
};

/**
 * @function handleFetchError
 * @desc    Handles errors that occur during the fetch process. Logs the error message
 *          and sets an alert to notify the user.
 * @access  Private
 *
 * @param {Object} error - The error object received during the fetch process.
 * @param {function} setAlert - Callback to set the alert message for the error.
 */
const handleFetchError = (error, setAlert) => {
  const errorMessage = error?.response?.data || 'An error occurred';
  setAlert(errorMessage);
  console.error(errorMessage);
};
export default fetchExistingClientsProfile;
