const {
  addToExecString,
  addDisableToExecString,
} = require('../utils/addToExecString');

const {
  ABP_CLIENT_DISABLE,
  OMS_CLIENT_DISABLE,
  OMS_SE_CLIENT_DISABLE,
  MCSS_SE_CLIENT_DISABLE,
  ACPE_CLIENT_DISABLE,
  REMOTE_DB_USER,
  OVERRIDE_DATA_PUMP_FILE,
  ABP_EPCT_DP_DIR_DISABLE,
  ABP_EPCT_DP_DIR,
  ABP_EPCT_DP_PATH,
  ABP_SRC_DB_USER,
  ABP_SRC_DB_PASSWORD,
  ABP_SRC_DB_INSTANCE,
  ABP_SRC_DB_USER_DISABLE,
  ABP_SRC_DB_PASSWORD_DISABLE,
  ABP_SRC_DB_INSTANCE_DISABLE,
  ABP_TRG_DB_CONN_STRING,
  OMS_EPCT_DP_DIR_DISABLE,
  OMS_EPCT_DP_DIR,
  OMS_EPCT_DP_PATH,
  OMS_SRC_DB_USER,
  OMS_SRC_DB_PASSWORD,
  OMS_SRC_DB_INSTANCE,
  OMS_SRC_DB_USER_DISABLE,
  OMS_SRC_DB_PASSWORD_DISABLE,
  OMS_SRC_DB_INSTANCE_DISABLE,
  OMS_TRG_DB_CONN_STRING,
  OMS_SE_EPCT_DP_DIR_DISABLE,
  OMS_SE_EPCT_DP_DIR,
  OMS_SE_EPCT_DP_PATH,
  OMS_SE_SRC_DB_USER,
  OMS_SE_SRC_DB_PASSWORD,
  OMS_SE_SRC_DB_INSTANCE,
  OMS_SE_SRC_DB_USER_DISABLE,
  OMS_SE_SRC_DB_PASSWORD_DISABLE,
  OMS_SE_SRC_DB_INSTANCE_DISABLE,
  OMS_SE_TRG_DB_CONN_STRING,
  MCSS_SE_EPCT_DP_DIR_DISABLE,
  MCSS_SE_EPCT_DP_DIR,
  MCSS_SE_EPCT_DP_PATH,
  MCSS_SE_SRC_DB_USER,
  MCSS_SE_SRC_DB_PASSWORD,
  MCSS_SE_SRC_DB_INSTANCE,
  MCSS_SE_SRC_DB_USER_DISABLE,
  MCSS_SE_SRC_DB_PASSWORD_DISABLE,
  MCSS_SE_SRC_DB_INSTANCE_DISABLE,
  MCSS_SE_TRG_DB_CONN_STRING,
  ACPE_EPCT_DP_DIR_DISABLE,
  ACPE_EPCT_DP_DIR,
  ACPE_EPCT_DP_PATH,
  ACPE_SRC_DB_USER,
  ACPE_SRC_DB_PASSWORD,
  ACPE_SRC_DB_INSTANCE,
  ACPE_SRC_DB_USER_DISABLE,
  ACPE_SRC_DB_PASSWORD_DISABLE,
  ACPE_SRC_DB_INSTANCE_DISABLE,
  ACPE_TRG_DB_CONN_STRING,
} = require('../installation consts/installationConsts');

/**
 * @desc    Adds configuration commands for a specific client to the execution string
 *          based on the provided client configuration and form data. If the client
 *          is included in the installation configuration, the relevant commands are
 *          added; otherwise, disabling commands are appended.
 * @access  Public
 *
 * @param   {string} execString - The current string of execution commands to be
 *                                 modified.
 * @param   {string} clientConfig - The identifier for the client whose configuration
 *                                  is being added.
 * @param   {object} formData - An object containing form data, including connection
 *                               strings and paths.
 * @param   {object} constants - An object containing constants used in the execution
 *                                commands.
 * @param   {object} disableConstants - An object containing constants for disabling
 *                                       commands when the client configuration is not
 *                                       included.
 * @param   {array} installationConfiguration - An object containing installation
 *                                             configurations, including a list of
 *                                             clients.
 *
 * @returns {string} - The modified execution string with the added or disabled
 *                     client configuration commands.
 */
function addClientConfig(
  execString,
  clientConfig,
  formData,
  constants,
  disableConstants,
  installationConfiguration
) {
  if (installationConfiguration.clients.includes(clientConfig)) {
    execString = addToExecString(
      execString,
      constants.DIR,
      `${clientConfig}_EPCT_DP_DIR`,
      formData.ORACLE_DATA_PUMP_DIR,
      `(Profiles_Configuration/${clientConfig}/${clientConfig}.profile/${clientConfig.toLowerCase()}.EPCT_DP_DIR=)`
    );
    execString = addToExecString(
      execString,
      constants.PATH,
      `${clientConfig}_EPCT_DP_PATH`,
      formData.ORACLE_DATA_PUMP_DIR_PATH,
      `(Profiles_Configuration/${clientConfig}/${clientConfig}.profile/${clientConfig.toLowerCase()}.EPCT_DP_PATH=)`
    );
    execString = addToExecString(
      execString,
      constants.SRC_DB_USER,
      `${clientConfig}_SRC_DB_USER`,
      getUser(formData.SRC_DB_CONN_STRING),
      `(Profiles_Configuration/${clientConfig}/${clientConfig}.profile/Source.ref.DB/${clientConfig.toLowerCase()}.src_ref_db_user=)`
    );
    execString = addToExecString(
      execString,
      constants.SRC_DB_PASSWORD,
      `${clientConfig}_SRC_DB_PASSWORD`,
      getPassword(formData.SRC_DB_CONN_STRING),
      `(Profiles_Configuration/${clientConfig}/${clientConfig}.profile/Source.ref.DB/${clientConfig.toLowerCase()}.src_ref_db_password=)`
    );
    execString = addToExecString(
      execString,
      constants.SRC_DB_INSTANCE,
      `${clientConfig}_SRC_DB_INSTANCE`,
      getInstance(formData.SRC_DB_CONN_STRING),
      `(Profiles_Configuration/${clientConfig}/${clientConfig}.profile/Source.ref.DB/${clientConfig.toLowerCase()}.src_ref_db_instance=)`
    );
    execString = addToExecString(
      execString,
      constants.TRG_DB_CONN_STRING,
      `${clientConfig}_TRG_DB_CONN_STRING`,
      formData.TRG_DB_CONN_STRING,
      `(Profiles_Configuration/${clientConfig}/${clientConfig}.profile/${clientConfig.toLowerCase()}.trg_db_conn_string=)`
    );
  } else {
    execString = addDisableToExecString(
      execString,
      disableConstants.DIR_DISABLE
    );
    execString = addDisableToExecString(
      execString,
      disableConstants.SRC_DB_USER_DISABLE
    );
    execString = addDisableToExecString(
      execString,
      disableConstants.SRC_DB_PASSWORD_DISABLE
    );
    execString = addDisableToExecString(
      execString,
      disableConstants.SRC_DB_INSTANCE_DISABLE
    );
    execString = addDisableToExecString(
      execString,
      disableConstants.CLIENT_DISABLE
    );
  }
  return execString;
}

/**
 * @desc    Extracts the user information from a database connection string
 *          by splitting the string at the '/' character. The user is expected
 *          to be the first segment of the string.
 * @access  Public
 *
 * @param   {string} dbString - The database connection string from which the user
 *                               information is to be extracted.
 *
 * @returns {string} - The extracted user information from the database connection
 *                     string.
 */
function getUser(dbString) {
  return dbString.split('/')[0];
}

/**
 * @desc    Extracts the password from a database connection string
 *          by splitting the string at the '/' character to isolate the
 *          password and then further splitting at the '@' character
 *          to retrieve the password part.
 * @access  Public
 *
 * @param   {string} dbString - The database connection string from which the
 *                               password information is to be extracted.
 *
 * @returns {string} - The extracted password from the database connection
 *                     string.
 */
function getPassword(dbString) {
  return dbString.split('/')[1].split('@')[0];
}

/**
 * @desc    Extracts the database instance name from a database connection string
 *          by splitting the string at the '@' character to isolate the instance
 *          information.
 * @access  Public
 *
 * @param   {string} dbString - The database connection string from which the
 *                               instance information is to be extracted.
 *
 * @returns {string} - The extracted instance name from the database connection
 *                     string.
 */
function getInstance(dbString) {
  return dbString.split('@')[1];
}

/**
 * @desc    Constructs an execution string for the installation configuration by
 *          appending various client configurations and other related parameters
 *          based on the provided installation data.
 * @access  Public
 *
 * @param   {string} execString - The initial execution string to which commands
 *                                 will be added.
 * @param   {object} installationConfiguration - The configuration data for
 *                                              installation, including form data
 *                                              for different clients.
 *
 * @returns {string} - The updated execution string containing all the appended
 *                     commands and configurations.
 */
function InstallationExecString(execString, installationConfiguration) {
  execString = addToExecString(
    execString,
    OVERRIDE_DATA_PUMP_FILE,
    'OVERRIDE_DATA_PUMP_FILE',
    installationConfiguration.formData.overrideDataPumpFile ? 'YES' : 'NO',
    '(Profiles_Configuration/override_datapump_file=)'
  );

  execString = addToExecString(
    execString,
    REMOTE_DB_USER,
    'REMOTE_DB_USER',
    installationConfiguration.formData.remoteDBUser,
    '(Profiles_Configuration/epct.remote_db_usr=)'
  );

  execString = addClientConfig(
    execString,
    'ABP',
    installationConfiguration.formData.ABP,
    {
      DIR: ABP_EPCT_DP_DIR,
      PATH: ABP_EPCT_DP_PATH,
      SRC_DB_USER: ABP_SRC_DB_USER,
      SRC_DB_PASSWORD: ABP_SRC_DB_PASSWORD,
      SRC_DB_INSTANCE: ABP_SRC_DB_INSTANCE,
      TRG_DB_CONN_STRING: ABP_TRG_DB_CONN_STRING,
    },
    {
      DIR_DISABLE: ABP_EPCT_DP_DIR_DISABLE,
      SRC_DB_USER_DISABLE: ABP_SRC_DB_USER_DISABLE,
      SRC_DB_PASSWORD_DISABLE: ABP_SRC_DB_PASSWORD_DISABLE,
      SRC_DB_INSTANCE_DISABLE: ABP_SRC_DB_INSTANCE_DISABLE,
      CLIENT_DISABLE: ABP_CLIENT_DISABLE,
    },
    installationConfiguration
  );

  execString = addClientConfig(
    execString,
    'OMS',
    installationConfiguration.formData.OMS,
    {
      DIR: OMS_EPCT_DP_DIR,
      PATH: OMS_EPCT_DP_PATH,
      SRC_DB_USER: OMS_SRC_DB_USER,
      SRC_DB_PASSWORD: OMS_SRC_DB_PASSWORD,
      SRC_DB_INSTANCE: OMS_SRC_DB_INSTANCE,
      TRG_DB_CONN_STRING: OMS_TRG_DB_CONN_STRING,
    },
    {
      DIR_DISABLE: OMS_EPCT_DP_DIR_DISABLE,
      SRC_DB_USER_DISABLE: OMS_SRC_DB_USER_DISABLE,
      SRC_DB_PASSWORD_DISABLE: OMS_SRC_DB_PASSWORD_DISABLE,
      SRC_DB_INSTANCE_DISABLE: OMS_SRC_DB_INSTANCE_DISABLE,
      CLIENT_DISABLE: OMS_CLIENT_DISABLE,
    },
    installationConfiguration
  );

  execString = addClientConfig(
    execString,
    'OMS_SE',
    installationConfiguration.formData.OMS_SE,
    {
      DIR: OMS_SE_EPCT_DP_DIR,
      PATH: OMS_SE_EPCT_DP_PATH,
      SRC_DB_USER: OMS_SE_SRC_DB_USER,
      SRC_DB_PASSWORD: OMS_SE_SRC_DB_PASSWORD,
      SRC_DB_INSTANCE: OMS_SE_SRC_DB_INSTANCE,
      TRG_DB_CONN_STRING: OMS_SE_TRG_DB_CONN_STRING,
    },
    {
      DIR_DISABLE: OMS_SE_EPCT_DP_DIR_DISABLE,
      SRC_DB_USER_DISABLE: OMS_SE_SRC_DB_USER_DISABLE,
      SRC_DB_PASSWORD_DISABLE: OMS_SE_SRC_DB_PASSWORD_DISABLE,
      SRC_DB_INSTANCE_DISABLE: OMS_SE_SRC_DB_INSTANCE_DISABLE,
      CLIENT_DISABLE: OMS_SE_CLIENT_DISABLE,
    },
    installationConfiguration
  );

  execString = addClientConfig(
    execString,
    'MCSS_SE',
    installationConfiguration.formData.MCSS_SE,
    {
      DIR: MCSS_SE_EPCT_DP_DIR,
      PATH: MCSS_SE_EPCT_DP_PATH,
      SRC_DB_USER: MCSS_SE_SRC_DB_USER,
      SRC_DB_PASSWORD: MCSS_SE_SRC_DB_PASSWORD,
      SRC_DB_INSTANCE: MCSS_SE_SRC_DB_INSTANCE,
      TRG_DB_CONN_STRING: MCSS_SE_TRG_DB_CONN_STRING,
    },
    {
      DIR_DISABLE: MCSS_SE_EPCT_DP_DIR_DISABLE,
      SRC_DB_USER_DISABLE: MCSS_SE_SRC_DB_USER_DISABLE,
      SRC_DB_PASSWORD_DISABLE: MCSS_SE_SRC_DB_PASSWORD_DISABLE,
      SRC_DB_INSTANCE_DISABLE: MCSS_SE_SRC_DB_INSTANCE_DISABLE,
      CLIENT_DISABLE: MCSS_SE_CLIENT_DISABLE,
    },
    installationConfiguration
  );

  execString = addClientConfig(
    execString,
    'ACPE',
    installationConfiguration.formData.ACPE,
    {
      DIR: ACPE_EPCT_DP_DIR,
      PATH: ACPE_EPCT_DP_PATH,
      SRC_DB_USER: ACPE_SRC_DB_USER,
      SRC_DB_PASSWORD: ACPE_SRC_DB_PASSWORD,
      SRC_DB_INSTANCE: ACPE_SRC_DB_INSTANCE,
      TRG_DB_CONN_STRING: ACPE_TRG_DB_CONN_STRING,
    },
    {
      DIR_DISABLE: ACPE_EPCT_DP_DIR_DISABLE,
      SRC_DB_USER_DISABLE: ACPE_SRC_DB_USER_DISABLE,
      SRC_DB_PASSWORD_DISABLE: ACPE_SRC_DB_PASSWORD_DISABLE,
      SRC_DB_INSTANCE_DISABLE: ACPE_SRC_DB_INSTANCE_DISABLE,
      CLIENT_DISABLE: ACPE_CLIENT_DISABLE,
    },
    installationConfiguration
  );

  return execString;
}

module.exports = InstallationExecString;
