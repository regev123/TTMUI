import api from '../../utils/api';
import validateConnectionString from '../../utils/ValidateConnectionString';
/**
 * @function setClientsProfile
 * @desc Handles the process of updating client profiles. Filters valid clients, validates connection strings,
 *       and sends the update request to the API while managing loading and alert states.
 * @access Public
 *
 * @param {Object} e - The event object triggered by the form submission.
 * @param {function} setPageAlert - Function to set the alert message that is displayed on the page.
 * @param {function} setIsClientConfigLoading - Function to toggle the loading state while processing.
 * @param {Object} clients - The list of clients to be processed and updated.
 */
const setClientDBDetails = async (
  e,
  setPageAlert,
  setIsClientConfigLoading,
  selectedProfile,
  source,
  target,
  isEnvObfuscated
) => {
  e.preventDefault();
  setPageAlert('');
  setIsClientConfigLoading(true);

  try {
    await validateClientsConnection(selectedProfile, source, target);
    if (isEnvObfuscated)
      await api.post('/obfuscation/copyObfuscationInputFileToEnvironment');
    await api.post('/configuration/updateDBDetails', {
      selectedProfile,
      source,
      target,
    });
    if (isEnvObfuscated)
      await api.post('/obfuscation/removeObfuscationInputFileFromEnvironment');
    setPageAlert('Change Succeeded!');
  } catch (error) {
    setPageAlert(error || 'Change Failed!');
  } finally {
    setIsClientConfigLoading(false);
  }
};

/**
 * @function validateClientsConnection
 * @desc Validates the connection strings (source and target) for each client.
 * @access Private
 *
 * @param {Object} clients - The list of clients to be validated.
 * @returns {Promise<void>} - Resolves once all connection strings are validated.
 */
const validateClientsConnection = async (client, source, target) => {
  await validateConnectionString([
    { connString: source, type: 'Source', client },
    { connString: target, type: 'Target', client },
  ]);
};

export default setClientDBDetails;
