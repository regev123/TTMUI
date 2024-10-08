// Import utility functions for constructing execution strings
const {
  addToExecString,
  addDisableToExecString,
} = require('../utils/addToExecString');

// Import constants for client configurations and database settings
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

// Helper function for adding execution strings for client configurations
// This function adds the necessary configuration data for each client (ABP, OMS, etc.) to the execution string.
function addClientConfig(
  execString,
  clientConfig, // The name of the client (ABP, OMS, etc.)
  formData, // Data from the installation form related to the client
  constants, // Constants specific to the client (e.g., directory, database user)
  disableConstants, // Constants to disable certain client settings if not configured
  installationConfiguration // The full installation configuration object
) {
  // Check if the client is included in the installation configuration
  if (installationConfiguration.clients.includes(clientConfig)) {
    // Add configuration to execution string for each relevant database setting (directory, path, user, etc.)
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
      formData.SRC_DB_USER,
      `(Profiles_Configuration/${clientConfig}/${clientConfig}.profile/Source.ref.DB/${clientConfig.toLowerCase()}.src_ref_db_user=)`
    );
    execString = addToExecString(
      execString,
      constants.SRC_DB_PASSWORD,
      `${clientConfig}_SRC_DB_PASSWORD`,
      formData.SRC_DB_PASSWORD,
      `(Profiles_Configuration/${clientConfig}/${clientConfig}.profile/Source.ref.DB/${clientConfig.toLowerCase()}.src_ref_db_password=)`
    );
    execString = addToExecString(
      execString,
      constants.SRC_DB_INSTANCE,
      `${clientConfig}_SRC_DB_INSTANCE`,
      formData.SRC_DB_INSTANCE,
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
    // If the client is not included, add disabled configurations
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
  return execString; // Return the updated execution string
}

// Main function to build the full installation execution string
function InstallationExecString(execString, installationConfiguration) {
  // Add override data pump file configuration
  execString = addToExecString(
    execString,
    OVERRIDE_DATA_PUMP_FILE,
    'OVERRIDE_DATA_PUMP_FILE',
    installationConfiguration.overrideDataPumpFile ? 'YES' : 'NO',
    '(Profiles_Configuration/override_datapump_file=)'
  );
  // Add remote database user configuration
  execString = addToExecString(
    execString,
    REMOTE_DB_USER,
    'REMOTE_DB_USER',
    installationConfiguration.remoteDBUser,
    '(Profiles_Configuration/epct.remote_db_usr=)'
  );

  // Add ABP client configuration
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

  // Add OMS client configuration
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

  // Add OMS_SE client configuration
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

  // Add MCSS_SE client configuration
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

  // Add ACPE client configuration
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

  return execString; // Return the final execution string with all configurations
}

module.exports = InstallationExecString;
