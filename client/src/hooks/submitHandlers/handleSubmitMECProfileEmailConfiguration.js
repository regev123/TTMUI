import api from '../../utils/api';

const FAILURE_MESSAGE = 'Change Failed!';
const INVALID_EMAIL_MESSAGE = 'Please provide a valid email!';
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
const setMECProfileEmail = async (
  e,
  setIsLoadingSubmit,
  setAlert,
  isEmailChecked,
  isZipFile,
  emailAddresses
) => {
  e.preventDefault();
  setIsLoadingSubmit(true);
  setAlert('');

  const validationErrors = validateEmailInput(isEmailChecked, emailAddresses);
  if (validationErrors) {
    setAlert(validationErrors);
    setIsLoadingSubmit(false);
    return;
  }

  try {
    await api.post('/configuration/updateMECProfileEmail', {
      isEmailChecked,
      emailAddresses,
      isZipFile,
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
const validateEmailInput = (isEmailChecked, emailAddresses) => {
  if (isEmailChecked && !isValidEmailList(emailAddresses)) {
    return INVALID_EMAIL_MESSAGE;
  }
  return null;
};

/**
 * @function isValidEmailList
 * @desc Validates a list of email addresses.
 * @access Private
 *
 * @param {string} emailList - The email addresses to validate.
 * @returns {boolean} - True if all emails are valid, otherwise false.
 */
const isValidEmailList = (emailList) => {
  return emailList
    .split(' ')
    .map((email) => email.trim())
    .every(isValidEmail);
};

/**
 * @function isValidEmail
 * @desc Validates an individual email address.
 * @access Private
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} - True if the email is valid, otherwise false.
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default setMECProfileEmail;
