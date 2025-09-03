/**
 * @function getInstallationsVersions
 * @desc Fetches installation versions after validating the connection.
 * @param {function} setLoading - Function to update loading state.
 * @param {function} setInstallationVersions - Function to set installation versions data.
 * @param {function} setPageAlert - Function to set the alert messages.
 */
const getInstallationsVersions = async (
  setLoading,
  setInstallationVersions,
  setPageAlert
) => {
  fetchInstallationVersions(setInstallationVersions, setLoading, setPageAlert);
};

/**
 * @function loadInstallationVersions
 * @desc Fetches installation versions from a local JSON file and maps the data.
 * @param {function} setInstallationVersions - Function to set installation versions data.
 * @param {function} setLoading - Function to update loading state.
 * @param {function} setPageAlert - Function to set the alert messages.
 */
const fetchInstallationVersions = async (
  setInstallationVersions,
  setLoading,
  setPageAlert
) => {
  try {
    const response = await fetch('/installationVersions.json');
    const data = await response.json();
    const versions = mapInstallationVersionsData(data);
    setInstallationVersions(versions);
  } catch (error) {
    handleError(
      error,
      'Failed to load installation versions, check file installationVersions.json in client public directory!',
      setPageAlert,
      setLoading
    );
  } finally {
    setLoading((prevState) => ({
      ...prevState,
      loadinginstallationVersions: false,
    }));
  }
};

/**
 * @function mapInstallationVersionsData
 * @desc Maps the raw installation versions data into the required format.
 * @param {Array} data - Raw data array from the installationVersions.json.
 * @returns {Array} - Mapped array of installation versions.
 */
const mapInstallationVersionsData = (data) => {
  return data.map((item) => ({
    version: item.version,
    URL: item.URL,
    tarName: item.tarName,
    xpiName: item.xpiName,
    jarName: item.jarName,
    obfuscationTar: item.obfuscationTar,
  }));
};

/**
 * @function handleError
 * @desc Centralized error handler for network or application errors.
 * @param {Object} error - The error object.
 * @param {string} customMessage - Custom error message to display.
 * @param {function} setPageAlert - Function to set the alert message.
 * @param {function} setLoading - Function to update loading state.
 */
const handleError = (error, customMessage, setPageAlert, setLoading) => {
  setPageAlert(customMessage || error.response.data);
  setLoading((prev) => ({ ...prev, disableSubmit: true }));
  console.error(error);
};

export default getInstallationsVersions;
