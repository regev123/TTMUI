import api from '../../utils/api';
import store from '../../store';
import validateConncetionString from '../../utils/ValidateConnectionString';
import { checkTTMEnvironmentConfiguration } from '../../actions/TTMEnvDetails';
import { getExistingClientsArray } from '../../actions/ExsitingClients';

/**
 * @function install
 * @desc    Initiates the installation process, validating inputs, sending a request to the backend,
 *          and handling the loading state and alerts based on success or failure.
 * @param {Event} e - The form submission event.
 * @param {Function} setPageAlert - Function to update page alerts.
 * @param {Function} setLoading - Function to manage the loading state.
 * @param {Object} formData - The form data including all client configurations.
 * @param {Array} installationVersions - Available installation versions.
 * @param {string} selectedInstallationVersion - The selected installation version.
 * @param {Object} clientChecks - An object representing which clients are selected.
 */
const install = async (
  e,
  setPageAlert,
  setLoading,
  formData,
  installationVersions,
  selectedInstallationVersion,
  clientChecks,
  tarOnEnvironment
) => {
  e.preventDefault();

  setPageAlert('');
  setLoading((prev) => ({ ...prev, installing: true }));

  if (!isFormValid(formData, selectedInstallationVersion)) {
    setLoading((prev) => ({ ...prev, installing: false }));
    return;
  }

  let clients;
  try {
    clients = await validateInputs(
      clientChecks,
      formData,
      tarOnEnvironment,
      selectedInstallationVersion
    );
  } catch (error) {
    alert(error);
    setLoading((prev) => ({ ...prev, installing: false }));
    return;
  }

  const matchedVersion = findMatchedVersion(
    installationVersions,
    selectedInstallationVersion
  );

  const body = {
    clients,
    formData,
    matchedVersion,
    tarOnEnvironment,
  };

  await submitInstallationRequest(body, setPageAlert);
  setLoading((prev) => ({ ...prev, installing: false }));
};

/**
 * @function findMatchedVersion
 * @desc    Finds the installation version that matches the selected version.
 * @param {Array} installationVersions - List of available installation versions.
 * @param {string} selectedInstallationVersion - The selected version.
 * @returns {Object} - The matched installation version object.
 */
const findMatchedVersion = (
  installationVersions,
  selectedInstallationVersion
) => {
  console.log(
    'installationVersions : ' + JSON.stringify(installationVersions, null, 2)
  );
  return installationVersions.find(
    (item) => item.version === selectedInstallationVersion
  );
};

/**
 * @function validateInputs
 * @desc    Validates the input data for all selected clients and checks the database connection strings.
 * @param {Object} clientChecks - A mapping of selected clients.
 * @param {Object} formData - The form data.
 * @returns {Array} - A list of valid clients.
 * @throws {Error} - Throws an error if any client validation fails.
 */
const validateInputs = async (
  clientChecks,
  formData,
  tarOnEnvironment,
  selectedInstallationVersion
) => {
  const clients = [];

  for (const client of Object.keys(clientChecks)) {
    if (!clientChecks[client]) continue;

    removeSpaceFromInputs(client, formData);

    if (tarOnEnvironment) {
      try {
        await api.post('/installation/checkTarOnEnvironment', {
          selectedInstallationVersion,
        });
      } catch (error) {
        throw error.response.data;
      }
    }

    if (!isClientFormValid(formData[client])) {
      throw `All ${client} fields are required.`;
    }

    try {
      await validateConncetionString([
        {
          connString: formData[client].SRC_DB_CONN_STRING,
          type: 'Source',
          client,
        },
        {
          connString: formData[client].TRG_DB_CONN_STRING,
          type: 'Target',
          client,
        },
      ]);
    } catch (error) {
      throw error;
    }
    clients.push(client);
  }
  return clients;
};

/**
 * @function removeSpaceFromInputs
 * @desc    Removes spaces from all input values for a specific client.
 * @param {string} client - The client type (e.g., 'ABP').
 * @param {Object} formData - The form data containing client-specific inputs.
 */
const removeSpaceFromInputs = (client, formData) => {
  Object.entries(formData[client]).forEach(([key, value]) => {
    formData[client][key] = value.replace(/\s+/g, '');
  });
};

/**
 * @function isFormValid
 * @desc    Validates the required form fields.
 * @param {Object} formData - The form data.
 * @param {string} selectedInstallationVersion - The selected installation version.
 * @returns {boolean} - True if form is valid, otherwise false.
 */
const isFormValid = (formData, selectedInstallationVersion) => {
  if (!formData.remoteDBUser) {
    alert('Remote DB User is required.');
    return false;
  }

  if (!selectedInstallationVersion) {
    alert('Select installation version!');
    return false;
  }

  return true;
};

/**
 * @function isClientFormValid
 * @desc    Checks if all fields in a client's form data are filled.
 * @param {Object} clientData - The form data for a specific client.
 * @returns {boolean} - True if all fields are filled, otherwise false.
 */
const isClientFormValid = (clientData) => {
  return Object.values(clientData).every((value) => value !== '');
};

/**
 * @function submitInstallationRequest
 * @desc    Sends the installation request to the backend API.
 * @param {Object} body - The request body to be sent.
 * @param {Function} setPageAlert - Function to set the alert message based on the installation result.
 * @throws {Error} - Throws an error if the API request fails.
 */
const submitInstallationRequest = async (body, setPageAlert) => {
  try {
    await api.post('/installation/install', body);
    await store.dispatch(checkTTMEnvironmentConfiguration());
    await store.dispatch(getExistingClientsArray());
    setPageAlert('Installation finished successfully');
  } catch (error) {
    throw new Error('Installation failed');
  }
};

export default install;
