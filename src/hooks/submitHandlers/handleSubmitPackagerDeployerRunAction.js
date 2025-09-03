import api from '../../utils/api';

/**
 * @function runPackagerDeployer
 * @desc Initiates a packager or deployer job, updating the UI with relevant status, and handling the result or error.
 * @access Public
 *
 * @param {function} setSubmitButtonText - Updates the text on the submit button.
 * @param {boolean} isPackager - Flag to determine whether to run a packager or deployer job.
 * @param {function} setStatus - Function to update the status message.
 * @param {function} setAlert - Function to update the alert message.
 * @param {function} setSubmitDisabled - Function to disable/enable the submit button.
 * @param {string} activeClientsString - Comma-separated string of active client identifiers.
 */
const runPackagerDeployer = async (
  setSubmitButtonText,
  isPackager,
  setStatus,
  setAlert,
  setSubmitDisabled,
  activeClientsString,
  isEnvObfuscated
) => {
  const jobType = isPackager ? 'packager' : 'deployer';
  const jobActionText = isPackager ? 'Packager' : 'Deployer';

  updateUIForJobStart(
    setSubmitButtonText,
    setStatus,
    setSubmitDisabled,
    jobActionText,
    setAlert
  );

  try {
    if (isEnvObfuscated)
      await api.post('/obfuscation/copyObfuscationInputFileToEnvironment');
    const response = await api.post('/packagerDeployer/runJob', {
      activeClientsString,
      jobType,
    });
    setAlert(response.data);
  } catch (err) {
    setAlert(err.response.data);
    setAlert(err.response?.data || 'An error occurred while running the job');
  } finally {
    if (isEnvObfuscated)
      await api.post('/obfuscation/removeObfuscationInputFileFromEnvironment');
    resetSubmitButton(setSubmitButtonText, setSubmitDisabled, jobActionText);
  }
};

/**
 * @function updateUIForJobStart
 * @desc Updates the UI elements when a job (packager or deployer) starts.
 * @access Private
 *
 * @param {function} setSubmitButtonText - Updates the text on the submit button.
 * @param {function} setStatus - Function to update the status message.
 * @param {function} setSubmitDisabled - Function to disable the submit button.
 * @param {string} jobActionText - The text to display for the job (Packager or Deployer).
 */
const updateUIForJobStart = (
  setSubmitButtonText,
  setStatus,
  setSubmitDisabled,
  jobActionText,
  setAlert
) => {
  setSubmitButtonText(`Running ${jobActionText}...`);
  setStatus(`Running ${jobActionText.toLowerCase()}...\n\n`);
  setSubmitDisabled(true);
  setAlert('');
};

/**
 * @function resetSubmitButton
 * @desc Resets the submit button state after the job has completed or failed.
 * @access Private
 *
 * @param {function} setSubmitButtonText - Updates the text on the submit button.
 * @param {function} setSubmitDisabled - Function to disable/enable the submit button.
 * @param {string} jobActionText - The text to display for the job (Packager or Deployer).
 */
const resetSubmitButton = (
  setSubmitButtonText,
  setSubmitDisabled,
  jobActionText
) => {
  setSubmitButtonText(`Run ${jobActionText}`);
  setSubmitDisabled(false);
};

export default runPackagerDeployer;
