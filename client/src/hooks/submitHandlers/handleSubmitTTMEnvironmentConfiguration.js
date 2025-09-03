import api from '../../utils/api';
import store from '../../store';
import { checkTTMEnvironmentConfiguration } from '../../actions/TTMEnvDetails';
import { checkIsEnvironmentObfuscated } from '../../actions/Obfuscation';
import { getExistingClientsArray } from '../../actions/ExsitingClients';

// Constants for alert messages
const ALERT_MESSAGES = {
  SUCCESS: 'Change Success',
  FAIL_TO_CONNECT_TTM_EMVIRONMENT: 'Failed to connect TTM Environment!',
  TTM_HOME_PATH_INVALID: 'TTM Home path is invalid!',
  FAILURE: 'Failed to submit configuration.',
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @function setConfiguration
 * @desc    Handles the submission of configuration data to the API and updates the alert message based on success or failure.
 * @access  Public
 *
 * @param {Object} e - The event object from the form submission.
 * @param {Object} formData - The configuration data to be submitted.
 * @param {function} setAlert - A callback function to update the alert message displayed to the user.
 *
 * @returns {Promise<void>} - A promise that resolves once the configuration is set, with no return value.
 */
const setConfiguration = async (e, formData, setAlert) => {
  e.preventDefault();

  try {
    await api.post('/configuration/setConfiguration', formData);
    await delay(1000);
    await store.dispatch(checkTTMEnvironmentConfiguration());
    await store.dispatch(checkIsEnvironmentObfuscated());
    await store.dispatch(getExistingClientsArray());
    setAlert(ALERT_MESSAGES.SUCCESS);
  } catch (error) {
    setAlert(ALERT_MESSAGES.FAILURE);
  }
};

export default setConfiguration;
