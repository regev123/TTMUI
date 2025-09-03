import api from '../../utils/api';

/**
 * @function fetchDeploymentConfiguration
 * @desc    Fetches deployment configuration from the API based on the selected deployment and profile,
 *          and updates state accordingly.
 * @access  Public
 *
 * @param {string} selectedDeployment - The deployment identifier to fetch configuration for.
 * @param {Object} isClientConfigLoaded - Object indicating if client configurations are already loaded.
 * @param {function} setPrePostDeploymentCommand - Callback to update the pre/post deployment command.
 * @param {string} selectedProfile - The selected profile identifier.
 * @param {function} markClientConfigAsLoaded - Callback to mark the client config as loaded.
 * @param {function} setIsLoading - Callback to set the loading state.
 * @param {function} setPageAlert - Callback to set alert messages for the page.
 *
 * @returns {Promise<void>} - Resolves once the configuration is fetched and processed.
 */
const fetchDeploymentConfiguration = async (
  selectedDeployment,
  isClientConfigLoaded,
  setPrePostDeploymentCommand,
  selectedProfile,
  markClientConfigAsLoaded,
  setIsLoading,
  setPageAlert
) => {
  // Exit if deployment or profile data is missing, or if config is already loaded
  if (
    !selectedDeployment ||
    isConfigAlreadyLoaded(
      isClientConfigLoaded,
      selectedProfile,
      selectedDeployment
    )
  ) {
    return;
  }

  setIsLoading(true);
  try {
    const response = await api.post(
      '/configuration/getPrePostDeploymentCommand',
      { selectedProfile, selectedDeployment }
    );

    const parsedCommand = parseDeploymentCommand(response.data);
    updatePrePostDeploymentCommand(
      parsedCommand,
      selectedDeployment,
      selectedProfile,
      setPrePostDeploymentCommand
    );

    markClientConfigAsLoaded(`${selectedDeployment}DeploymentDataLoaded`);
  } catch (error) {
    console.error('Error fetching deployment configuration:', error);
    setPageAlert('Error loading configuration');
  } finally {
    setIsLoading(false);
  }
};

/**
 * @function isConfigAlreadyLoaded
 * @desc    Checks if the configuration for a specific deployment is already loaded.
 *
 * @param {Object} isClientConfigLoaded - Object indicating loaded configurations.
 * @param {string} profile - The selected profile identifier.
 * @param {string} deployment - The selected deployment identifier.
 *
 * @returns {boolean} - True if the configuration is already loaded, false otherwise.
 */
const isConfigAlreadyLoaded = (isClientConfigLoaded, profile, deployment) =>
  isClientConfigLoaded[profile]?.[`${deployment}DeploymentDataLoaded`];

/**
 * @function parseDeploymentCommand
 * @desc    Parses the deployment command data to extract the command and enabled status.
 *
 * @param {string} data - The deployment command data from the API response.
 * @returns {Object} - Parsed command data with 'command' and 'isEnabled' properties.
 */
const parseDeploymentCommand = (data) => {
  const match = data.match(/"(.*?)"/);
  return {
    command: match ? match[1] : '',
    isEnabled: !data.startsWith('#'),
  };
};

/**
 * @function updatePrePostDeploymentCommand
 * @desc    Updates the pre/post deployment command state based on the parsed command data.
 *
 * @param {Object} parsedCommand - The parsed command data.
 * @param {string} deployment - The selected deployment identifier.
 * @param {string} profile - The selected profile identifier.
 * @param {function} setCommand - Callback to update the pre/post deployment command state.
 */
const updatePrePostDeploymentCommand = (
  parsedCommand,
  deployment,
  profile,
  setCommand
) => {
  setCommand((prevCommands) => ({
    ...prevCommands,
    [profile]: {
      ...prevCommands[profile],
      [deployment]: parsedCommand.command,
      [`enabled${deployment}`]: parsedCommand.isEnabled,
    },
  }));
};

export default fetchDeploymentConfiguration;
