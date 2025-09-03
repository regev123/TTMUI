/**
 * @function fetchPackagerDeploymentData
 * @desc Fetches the deployment data for the packager, including client statuses.
 *       Validates the TTM home path, retrieves existing clients, and initializes the clients data.
 *       Updates the state with the initialized client data and handles errors.
 * @access Public
 *
 * @param {function} setClients - Function to update the clients data state.
 * @param {function} setLoading - Function to set the loading state.
 * @param {function} setAlert - Function to set the alert message for errors.
 * @param {function} setSubmitDisabled - Function to disable the submit button on error.
 */
const fetchPackagerDepolyerData = async (
  setClients,
  setLoading,
  setAlert,
  setSubmitDisabled,
  existingClientsArray
) => {
  try {
    const initializedClients = initializeClients(existingClientsArray);
    setClients(initializedClients);
  } catch (error) {
    handleError(error, setAlert, setSubmitDisabled);
  } finally {
    setLoading((prevState) => ({ ...prevState, existingClients: false }));
  }
};

/**
 * @function initializeClients
 * @desc Initializes the clients data based on the list of existing clients.
 *       Creates a mapping of client keys to their respective statuses (exists and checked).
 * @access Private
 *
 * @param {Array} existingClients - Array of existing client keys (e.g., 'ABP', 'OMS').
 * @returns {Object} - A mapping of client statuses for each client key.
 */
const initializeClients = (existingClients) => ({
  ABP: createClientStatus('ABP', existingClients),
  OMS: createClientStatus('OMS', existingClients),
  OMS_SE: createClientStatus('OMS_SE', existingClients),
  MCSS_SE: createClientStatus('MCSS_SE', existingClients),
  ACPE: createClientStatus('ACPE', existingClients),
});

/**
 * @function createClientStatus
 * @desc Creates a status object for a specific client based on its presence in the existing clients list.
 *       The status object contains `exists` (whether the client exists) and `checked` (defaulted to `exists`).
 * @access Private
 *
 * @param {string} clientKey - The key representing the client (e.g., 'ABP', 'OMS').
 * @param {Array} existingClients - The list of existing client keys.
 * @returns {Object} - The status object for the client.
 */
const createClientStatus = (clientKey, existingClients) => {
  const exists = existingClients.includes(clientKey);
  return {
    exists,
    checked: exists,
  };
};

/**
 * @function handleError
 * @desc Handles errors during the fetch process by setting an alert message and disabling the submit button.
 * @access Private
 *
 * @param {Object} error - The error object received from the failed API request.
 * @param {function} setAlert - Function to set the alert message for errors.
 * @param {function} setSubmitDisabled - Function to disable the submit button upon error.
 */
const handleError = (err, setAlert, setSubmitDisabled) => {
  setAlert(err.response?.data || 'Error occurred');
  setSubmitDisabled(true);
};

export default fetchPackagerDepolyerData;
