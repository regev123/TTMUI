import api from '../../utils/api';

const FAILURE_MESSAGE = 'Change Failed!';
const INVALID_REMOTE_DB_USER = 'Please provide Remote DB User!';
const SUCCESS_MESSAGE = 'Change Succeeded!';

/**
 * @function setMECProfile
 * @desc Handles the MEC profile update process. Validates inputs, sends data to the API, and manages loading and alert states.
 * @access Public
 *
 * @param {Object} e - The event object.
 * @param {function} setIsLoadingSubmit - Function to set loading state during submission.
 * @param {function} setAlert - Function to update alert messages.
 * @param {Object} MECProfileFormData - Data to be submitted to the API.
 * @param {boolean} isEmailChecked - Indicates if email notifications are enabled.
 * @param {string} emailAddresses - List of email addresses for notifications.
 * @param {string} remoteDBUser - The remote DB user for the configuration.
 */
const setMECProfileRemoteDBUser = async (
  e,
  setIsLoadingSubmit,
  setAlert,
  remoteDBUser
) => {
  e.preventDefault();
  setIsLoadingSubmit(true);
  setAlert('');

  const validationErrors = validateInputs(remoteDBUser);
  if (validationErrors) {
    setAlert(validationErrors);
    setIsLoadingSubmit(false);
    return;
  }

  try {
    await api.post('/configuration/updateMECProfileRemoteDBUser', {
      remoteDBUser,
    });
    setAlert(SUCCESS_MESSAGE);
  } catch {
    setAlert(FAILURE_MESSAGE);
  } finally {
    setIsLoadingSubmit(false);
  }
};

/**
 * @function validateInputs
 * @desc Validates the form inputs (email and remote DB user).
 * @access Private
 *
 * @param {boolean} isEmailChecked - If email notifications are checked.
 * @param {string} emailAddresses - The email addresses to validate.
 * @param {string} remoteDBUser - The remote DB user to validate.
 * @returns {string|null} - Returns an error message if validation fails, else null.
 */
const validateInputs = (remoteDBUser) => {
  if (!remoteDBUser) {
    return INVALID_REMOTE_DB_USER;
  }
  return null;
};

export default setMECProfileRemoteDBUser;
