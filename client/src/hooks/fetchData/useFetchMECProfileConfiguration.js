import api from '../../utils/api';

/**
 * @function fetchMECProfileConfiguration
 * @desc Fetches MEC profile configuration data, including report email and remote DB user data.
 *       Updates the state with the fetched data, handling errors appropriately.
 * @access Public
 *
 * @param {boolean} isMECProfileConfigLoaded - Flag indicating if MEC profile config is already loaded.
 * @param {function} setIsMECProfileConfigLoaded - Function to update MEC profile config loaded state.
 * @param {function} setIsConfigLoading - Function to set the loading state.
 * @param {function} setMECProfileFormData - Function to update the form data state with fetched MEC profile data.
 * @param {function} setAlert - Function to set the alert message for errors.
 */
const fetchMECProfileConfiguration = async (
  setIsMECEmailConfigLoaded,
  setIsConfigLoading,
  setMECProfileFormData,
  setAlert,
  selectedData
) => {
  try {
    setIsConfigLoading(true);
    if (selectedData === 'Email Details') {
      const emailData = await api.get('/configuration/getReportEmail');
      setIsMECEmailConfigLoaded(true);
      updateEmailFormData(emailData.data, setMECProfileFormData);
    } else {
      const remoteUserData = await api.get('/util/getRemoteDBUser');
      updateRemoteDBUserFormData(remoteUserData.data, setMECProfileFormData);
    }
  } catch (error) {
    handleError(error, setAlert);
  } finally {
    setIsConfigLoading(false);
  }
};

/**
 * @function updateEmailFormData
 * @desc Updates the form data state with email configuration data.
 * @access Private
 *
 * @param {Object} emailData - Email configuration data to be added to the form.
 * @param {function} setMECProfileFormData - Function to update the form data state.
 */
const updateEmailFormData = (emailData, setMECProfileFormData) => {
  setMECProfileFormData((prevData) => ({
    ...prevData,
    isEmailChecked: emailData.isEmailChecked,
    emailAddresses: emailData.emailAddresses,
    isZipFile: emailData.isZipFile === 'Y',
  }));
};

/**
 * @function updateRemoteDBUserFormData
 * @desc Updates the form data state with remote DB user data.
 * @access Private
 *
 * @param {Object} remoteDBUser - Remote DB user data to be added to the form.
 * @param {function} setMECProfileFormData - Function to update the form data state.
 */
const updateRemoteDBUserFormData = (remoteDBUser, setMECProfileFormData) => {
  setMECProfileFormData((prevData) => ({
    ...prevData,
    remoteDBUser,
  }));
};

/**
 * @function handleError
 * @desc Handles errors by setting an alert message and logging the error.
 * @access Private
 *
 * @param {Object} error - The error object from the failed API request.
 * @param {function} setAlert - Function to set the alert message for errors.
 */
const handleError = (error, setAlert) => {
  const errorMessage = error?.response?.data || 'An error occurred';
  setAlert(errorMessage);
  console.error(errorMessage);
};

export default fetchMECProfileConfiguration;
