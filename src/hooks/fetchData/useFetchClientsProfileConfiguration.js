import api from '../../utils/api';

/**
 * @function fetchClientsProfileConfiguration
 * @desc Fetches the client profile configuration details by calling relevant APIs, updates the client data state, and marks the configuration as loaded.
 * @access Public
 *
 * @param {function} setIsClientConfigLoading - Function to toggle loading state during the configuration fetch.
 * @param {string} selectedProfile - The currently selected client profile.
 * @param {function} setClients - State setter function for client data.
 * @param {Object} clients - The current clients data object.
 * @param {function} markClientConfigAsLoaded - Function to mark specific configurations as loaded.
 */
const fetchClientsProfileConfiguration = async (
  setIsClientConfigLoading,
  selectedProfile,
  setClients,
  clients,
  markClientConfigAsLoaded,
  selectedData,
  isEnvObfuscated
) => {
  setIsClientConfigLoading(true);

  try {
    if (selectedData === 'DB Details') {
      if (isEnvObfuscated)
        await api.post('/obfuscation/copyObfuscationInputFileToEnvironment');
      const dbDetails = await fetchDBDetails(selectedProfile);
      updateDBConfiguration(dbDetails, setClients, clients, selectedProfile);
      if (isEnvObfuscated)
        await api.post(
          '/obfuscation/removeObfuscationInputFileFromEnvironment'
        );
      markClientConfigAsLoaded('DBLoaded');
    } else {
      const ttmDirDBIdentifier = await fetchTTMDirDBIdentifier(selectedProfile);
      const dpDirPath = await fetchDPDIRPath(selectedProfile);
      updateDPDirConfiguration(
        ttmDirDBIdentifier,
        dpDirPath,
        setClients,
        clients,
        selectedProfile
      );
      markClientConfigAsLoaded('DPDirLoaded');
    }
  } catch (error) {
    console.error('Error fetching client configuration:', error);
  } finally {
    setIsClientConfigLoading(false);
  }
};

/**
 * @function fetchDBDetails
 * @desc Fetches database details for the specified client profile.
 * @access Private
 *
 * @param {string} client - The client profile to fetch database details for.
 * @returns {Object} - The database details object for the specified client.
 */
const fetchDBDetails = async (client) => {
  const { data } = await api.post('/configuration/getDBDetails', {
    selectedClient: client,
  });
  return data[client];
};

/**
 * @function fetchTTMDirDBIdentifier
 * @desc Retrieves the TTM Directory Database Identifier for the specified client profile.
 * @access Private
 *
 * @param {string} client - The client profile to fetch TTM Directory DB Identifier for.
 * @returns {string} - The TTM Directory Database Identifier.
 */
const fetchTTMDirDBIdentifier = async (client) => {
  const { data } = await api.post('/util/getTTMDirDBIdentifier', { client });
  return data;
};

/**
 * @function fetchDPDIRPath
 * @desc Retrieves the DP Directory Path for the specified client profile.
 * @access Private
 *
 * @param {string} client - The client profile to fetch DP Directory Path for.
 * @returns {string} - The DP Directory Path.
 */
const fetchDPDIRPath = async (client) => {
  const { data } = await api.post('/util/getDPDIRPath', { client });
  return data;
};

/**
 * @function updateClientConfiguration
 * @desc Updates the client configuration object with new data and updates the client state.
 * @access Private
 *
 * @param {Object} dbDetails - The database details for the client.
 * @param {string} ttmDirDBIdentifier - The TTM Directory DB Identifier.
 * @param {string} dpDirPath - The DP Directory Path.
 * @param {function} setClients - State setter function for the clients data.
 * @param {Object} clients - The current clients data object.
 * @param {string} selectedProfile - The currently selected client profile.
 */
const updateDBConfiguration = (
  dbDetails,
  setClients,
  clients,
  selectedProfile
) => {
  const updatedClientData = {
    ...clients[selectedProfile],
    ...dbDetails,
  };

  setClients((prevClients) => ({
    ...prevClients,
    [selectedProfile]: updatedClientData,
  }));
};

const updateDPDirConfiguration = (
  ttmDirDBIdentifier,
  dpDirPath,
  setClients,
  clients,
  selectedProfile
) => {
  const updatedClientData = {
    ...clients[selectedProfile],
    EPCT_DP_PATH: dpDirPath,
    EPCT_DP_DIR: ttmDirDBIdentifier,
  };

  setClients((prevClients) => ({
    ...prevClients,
    [selectedProfile]: updatedClientData,
  }));
};

export default fetchClientsProfileConfiguration;
