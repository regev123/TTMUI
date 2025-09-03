import api from '../../utils/api';

// Error message constants
const ERROR_MESSAGES = {
  LOAD_FAILURE: 'Failed to load configuration.',
};

/**
 * @function fetchConfiguration
 * @desc    Fetches configuration data from the API and updates the form state, alert message, and loading status.
 * @access  Public
 *
 * @param {function} setFormData - Callback function to set the fetched configuration data into the form state.
 * @param {function} setAlert - Callback function to update the alert message if fetching fails.
 * @param {function} setLoading - Callback function to update the loading status; set to false when loading completes.
 *
 * @returns {Promise<void>} - A promise that resolves once the configuration data is fetched and processed, with no return value.
 */
const fetchConfiguration = async (setFormData, setAlert, setLoading) => {
  try {
    const { data } = await api.get('/configuration/getConfiguration');
    setFormData(data);
  } catch (error) {
    setAlert(ERROR_MESSAGES.LOAD_FAILURE);
    console.error('Error fetching configuration:', error);
  } finally {
    setLoading(false);
  }
};

export default fetchConfiguration;
