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
const setClientDPDir = async (
  e,
  setPageAlert,
  setIsClientConfigLoading,
  selectedProfile,
  DPPath,
  DPDir
) => {
  e.preventDefault();
  setPageAlert('');
  setIsClientConfigLoading(true);

  try {
    await api.post('/configuration/updateDPDir', {
      selectedProfile,
      DPDir,
      DPPath,
    });
    setPageAlert('Change Succeeded!');
  } catch (error) {
    setPageAlert(error || 'Change Failed!');
  } finally {
    setIsClientConfigLoading(false);
  }
};

export default setClientDPDir;
