const initialFormData = {
  SRC_DB_CONN_STRING: '',
  TRG_DB_CONN_STRING: '',
};

/**
 * @function fetchExistsClientsInit
 * @desc    Fetches existing clients from the API and processes them into a standardized format.
 *          Updates the clients state with the processed data and handles loading and error states.
 * @access  Public
 *
 * @param {function} setClients - Callback to update the clients state with processed data.
 * @param {function} setLoading - Callback to set the loading state during the fetching process.
 * @param {function} setAlert - Callback to set an alert message if an error occurs.
 *
 * @returns {Promise<void>} - Resolves once the clients data is fetched, processed, and the state is updated.
 */
const fetchExistsClientsInit = async (
  setClients,
  setLoading,
  setAlert,
  existingClientsArray
) => {
  try {
    const processedClients = processClientData(existingClientsArray);
    setClients(processedClients);
  } catch (error) {
    handleApiError(error, setAlert);
  } finally {
    setLoading(false);
  }
};

/**
 * @function processClientData
 * @desc    Processes the raw client data into a standardized format with default form values.
 *          It maps each client to an object containing an "exists" flag and initial form data.
 * @access  Private
 *
 * @param {Array} clients - Array of client names to process.
 *
 * @returns {Object} - An object where each client name maps to an object containing "exists" and initial form data.
 */
const processClientData = (clients) => {
  return clients.reduce((acc, client) => {
    acc[client] = {
      exists: true,
      ...initialFormData,
    };
    return acc;
  }, {});
};

/**
 * @function handleApiError
 * @desc    Handles any API errors that occur during the fetch process by setting an alert message and logging the error.
 * @access  Private
 *
 * @param {Object} error - The error object thrown during the API call.
 * @param {function} setAlert - Callback to update the alert state with an error message.
 *
 * @returns {void} - Does not return anything, just updates the alert state and logs the error.
 */
const handleApiError = (error, setAlert) => {
  setAlert(error.response?.data || 'An error occurred');
  console.error(error);
};

export default fetchExistsClientsInit;
