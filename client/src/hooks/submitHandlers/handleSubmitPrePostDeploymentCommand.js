import api from '../../utils/api';

/**
 * @function setDeployment
 * @desc    Handles the submission of deployment configuration updates to the API, updating the alert message
 *          and loading state based on success or failure.
 * @access  Public
 *
 * @param {Event} e - The event object from the form submission.
 * @param {function} setPageAlert - Callback to set the page alert message.
 * @param {function} setIsLoading - Callback to set the loading state.
 * @param {string} selectedProfile - The selected profile identifier.
 * @param {string} selectedDeployment - The deployment identifier to be updated.
 * @param {Object} prePostDeploymentCommand - Object containing deployment commands and enablement flags.
 *
 * @returns {Promise<void>} - Resolves once the deployment configuration is submitted and processed.
 */
const setDeployment = async (
  e,
  setPageAlert,
  setIsLoading,
  selectedProfile,
  selectedDeployment,
  prePostDeploymentCommand
) => {
  e.preventDefault();
  setPageAlert('');
  setIsLoading(true);

  try {
    const payload = buildDeploymentPayload(
      selectedProfile,
      selectedDeployment,
      prePostDeploymentCommand
    );

    await api.post('/configuration/updatePrePostDeploymentCommand', payload);

    setPageAlert('Change Succeeded!');
  } catch (error) {
    console.error(`Error updating ${selectedDeployment} command:`, error);
    setPageAlert('Change Failed!');
  } finally {
    setIsLoading(false);
  }
};

/**
 * @function buildDeploymentPayload
 * @desc    Constructs the payload for the deployment configuration update API call.
 *
 * @param {string} profile - The selected profile identifier.
 * @param {string} deployment - The deployment identifier to be updated.
 * @param {Object} commands - The object containing deployment commands and enablement flags.
 *
 * @returns {Object} - The constructed payload for the API call.
 */
const buildDeploymentPayload = (profile, deployment, commands) => ({
  selectedProfile: profile,
  selectedDeployment: deployment,
  scriptCommand: commands[profile][deployment],
  enableDeployment: commands[profile][`enabled${deployment}`],
});

export default setDeployment;
