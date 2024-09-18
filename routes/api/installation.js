const express = require('express');
const router = express.Router();
const config = require('config');
const { Client } = require('ssh2');
const {
  addToExecString,
  addDisableToExecString,
} = require('../../utils/addToExecString');
const {
  ABP_CLIENT_DISABLE,
  OMS_CLIENT_DISABLE,
  OMS_SE_CLIENT_DISABLE,
  MCSS_SE_CLIENT_DISABLE,
  ACPE_CLIENT_DISABLE,
  OVERRIDE_DATA_PUMP_FILE,
  ABP_EPCT_DP_DIR_DISABLE,
  ABP_EPCT_DP_PATH,
  ABP_SRC_DB_USER,
  ABP_SRC_DB_PASSWORD,
  ABP_SRC_DB_INSTANCE,
  ABP_SRC_DB_USER_DISABLE,
  ABP_SRC_DB_PASSWORD_DISABLE,
  ABP_SRC_DB_INSTANCE_DISABLE,
  ABP_TRG_DB_CONN_STRING,
  OMS_EPCT_DP_DIR_DISABLE,
  OMS_EPCT_DP_PATH,
  OMS_SRC_DB_USER,
  OMS_SRC_DB_PASSWORD,
  OMS_SRC_DB_INSTANCE,
  OMS_SRC_DB_USER_DISABLE,
  OMS_SRC_DB_PASSWORD_DISABLE,
  OMS_SRC_DB_INSTANCE_DISABLE,
  OMS_TRG_DB_CONN_STRING,
  OMS_SE_EPCT_DP_DIR_DISABLE,
  OMS_SE_EPCT_DP_PATH,
  OMS_SE_SRC_DB_USER,
  OMS_SE_SRC_DB_PASSWORD,
  OMS_SE_SRC_DB_INSTANCE,
  OMS_SE_SRC_DB_USER_DISABLE,
  OMS_SE_SRC_DB_PASSWORD_DISABLE,
  OMS_SE_SRC_DB_INSTANCE_DISABLE,
  OMS_SE_TRG_DB_CONN_STRING,
  MCSS_SE_EPCT_DP_DIR_DISABLE,
  MCSS_SE_EPCT_DP_PATH,
  MCSS_SE_SRC_DB_USER,
  MCSS_SE_SRC_DB_PASSWORD,
  MCSS_SE_SRC_DB_INSTANCE,
  MCSS_SE_SRC_DB_USER_DISABLE,
  MCSS_SE_SRC_DB_PASSWORD_DISABLE,
  MCSS_SE_SRC_DB_INSTANCE_DISABLE,
  MCSS_SE_TRG_DB_CONN_STRING,
  ACPE_EPCT_DP_DIR_DISABLE,
  ACPE_EPCT_DP_PATH,
  ACPE_SRC_DB_USER,
  ACPE_SRC_DB_PASSWORD,
  ACPE_SRC_DB_INSTANCE,
  ACPE_SRC_DB_USER_DISABLE,
  ACPE_SRC_DB_PASSWORD_DISABLE,
  ACPE_SRC_DB_INSTANCE_DISABLE,
  ACPE_TRG_DB_CONN_STRING,
} = require('../../installation consts/installationConsts');
// @route    POST api/installation/install
// @desc     Install TTM
// @access   Public
router.post('/install', async (req, res) => {
  const installationConfiguration = req.body;

  let stdout = '';
  let stderr = '';

  try {
    const conn = new Client();

    conn.on('ready', () => {
      console.log('Client :: ready');

      // Execute the first command
      conn.exec(
        `cd ${config.get(
          'TTMHome'
        )} && find . -mindepth 1 -delete && wget http://illin3301:28080/nexus/service/local/repositories/amd-core-fnd-Releases/content/com/amdocs/mec/packager/10.24.0.0/2024052607/10.24.0.0-2024052607.tar && tar -xvf 10.24.0.0-2024052607.tar && tar -xvf xpi-packaging-9.22.1.0.tar && jar -xvf ttm-packager-10.24.0.0-general-package-2024052607.jar product/template-topologies/EPC_TTM.topology && cd installer/bin/ && ./xpi_create_silent_property.sh  --details all ${config.get(
          'TTMHome'
        )}product/template-topologies/EPC_TTM.topology ${config.get(
          'TTMHome'
        )}ttm-packager-10.24.0.0-general-package-2024052607.jar`,
        (err, stream) => {
          if (err) {
            console.error('Command execution error:', err);
            return res.status(500).send('Command execution failed');
          }

          stream.on('data', (data) => {
            stdout += data.toString(); // Capture the stdout data
          });

          stream.stderr.on('data', (data) => {
            stderr += data.toString(); // Capture the stderr data
          });

          stream.on('close', (code, signal) => {
            console.log(
              'All process until generating the property file finished with code:',
              code
            );

            if (code !== 0) {
              console.error('First command failed with stderr:', stderr);
              return res.status(500).send('First command failed');
            }
            let execString = `cd ${config.get(
              'TTMHome'
            )}product/template-topologies/ && ${OVERRIDE_DATA_PUMP_FILE} `;
            if (installationConfiguration.clients.includes('ABP')) {
              //ABP_EPCT_DP_PATH
              execString = addToExecString(
                execString,
                ABP_EPCT_DP_PATH,
                'ABP_EPCT_DP_PATH',
                installationConfiguration.clientsFormData.ABP_EPCT_DP_PATH,
                '(Profiles_Configuration/ABP/ABP.profile/abp.EPCT_DP_PATH=)'
              );
              //ABP_SRC_DB_USER
              execString = addToExecString(
                execString,
                ABP_SRC_DB_USER,
                'ABP_SRC_DB_USER',
                installationConfiguration.clientsFormData.ABP_SRC_DB_USER,
                '(Profiles_Configuration/ABP/ABP.profile/Source.ref.DB/abp.src_ref_db_user=)'
              );
              //ABP_SRC_DB_PASSWORD
              execString = addToExecString(
                execString,
                ABP_SRC_DB_PASSWORD,
                'ABP_SRC_DB_PASSWORD',
                installationConfiguration.clientsFormData.ABP_SRC_DB_PASSWORD,
                '(Profiles_Configuration/ABP/ABP.profile/Source.ref.DB/abp.src_ref_db_password=)'
              );
              //ABP_SRC_DB_INSTANCE
              execString = addToExecString(
                execString,
                ABP_SRC_DB_INSTANCE,
                'ABP_SRC_DB_INSTANCE',
                installationConfiguration.clientsFormData.ABP_SRC_DB_INSTANCE,
                '(Profiles_Configuration/ABP/ABP.profile/Source.ref.DB/abp.src_ref_db_instance=)'
              );
              //ABP_TRG_DB_CONN_STRING
              execString = addToExecString(
                execString,
                ABP_TRG_DB_CONN_STRING,
                'ABP_TRG_DB_CONN_STRING',
                installationConfiguration.clientsFormData
                  .ABP_TRG_DB_CONN_STRING,
                '(Profiles_Configuration/ABP/ABP.profile/abp.trg_db_conn_string=)'
              );
            } else {
              //ABP_EPCT_DP_DIR_DISABLE
              execString = addDisableToExecString(
                execString,
                ABP_EPCT_DP_DIR_DISABLE
              );
              //ABP_SRC_DB_USER_DISABLE
              execString = addDisableToExecString(
                execString,
                ABP_SRC_DB_USER_DISABLE
              );
              //ABP_SRC_DB_PASSWORD_DISABLE
              execString = addDisableToExecString(
                execString,
                ABP_SRC_DB_PASSWORD_DISABLE
              );
              //ABP_SRC_DB_INSTANCE_DISABLE
              execString = addDisableToExecString(
                execString,
                ABP_SRC_DB_INSTANCE_DISABLE
              );
              //ABP_CLIENT_DISABLE
              execString = addDisableToExecString(
                execString,
                ABP_CLIENT_DISABLE
              );
            }
            if (installationConfiguration.clients.includes('OMS')) {
              //OMS_EPCT_DP_PATH
              execString = addToExecString(
                execString,
                OMS_EPCT_DP_PATH,
                'OMS_EPCT_DP_PATH',
                installationConfiguration.clientsFormData.OMS_EPCT_DP_PATH,
                '(Profiles_Configuration/OMS/OMS.profile/oms.EPCT_DP_PATH=)'
              );
              //OMS_SRC_DB_USER
              execString = addToExecString(
                execString,
                OMS_SRC_DB_USER,
                'OMS_SRC_DB_USER',
                installationConfiguration.clientsFormData.OMS_SRC_DB_USER,
                '(Profiles_Configuration/OMS/OMS.profile/Source.ref.DB/oms.src_ref_db_user=)'
              );
              //OMS_SRC_DB_PASSWORD
              execString = addToExecString(
                execString,
                OMS_SRC_DB_PASSWORD,
                'OMS_SRC_DB_PASSWORD',
                installationConfiguration.clientsFormData.OMS_SRC_DB_PASSWORD,
                '(Profiles_Configuration/OMS/OMS.profile/Source.ref.DB/oms.src_ref_db_password=)'
              );
              //OMS_SRC_DB_INSTANCE
              execString = addToExecString(
                execString,
                OMS_SRC_DB_INSTANCE,
                'OMS_SRC_DB_INSTANCE',
                installationConfiguration.clientsFormData.OMS_SRC_DB_INSTANCE,
                '(Profiles_Configuration/OMS/OMS.profile/Source.ref.DB/oms.src_ref_db_instance=)'
              );
              //OMS_TRG_DB_CONN_STRING
              execString = addToExecString(
                execString,
                OMS_TRG_DB_CONN_STRING,
                'OMS_TRG_DB_CONN_STRING',
                installationConfiguration.clientsFormData
                  .OMS_TRG_DB_CONN_STRING,
                '(Profiles_Configuration/OMS/OMS.profile/oms.trg_db_conn_string=)'
              );
            } else {
              //OMS_EPCT_DP_DIR_DISABLE
              execString = addDisableToExecString(
                execString,
                OMS_EPCT_DP_DIR_DISABLE
              );
              //OMS_SRC_DB_USER_DISABLE
              execString = addDisableToExecString(
                execString,
                OMS_SRC_DB_USER_DISABLE
              );
              //OMS_SRC_DB_PASSWORD_DISABLE
              execString = addDisableToExecString(
                execString,
                OMS_SRC_DB_PASSWORD_DISABLE
              );
              //OMS_SRC_DB_INSTANCE_DISABLE
              execString = addDisableToExecString(
                execString,
                OMS_SRC_DB_INSTANCE_DISABLE
              );
              //OMS_CLIENT_DISABLE
              execString = addDisableToExecString(
                execString,
                OMS_CLIENT_DISABLE
              );
            }
            if (installationConfiguration.clients.includes('OMS_SE')) {
              //OMS_SE_EPCT_DP_PATH
              execString = addToExecString(
                execString,
                OMS_SE_EPCT_DP_PATH,
                'OMS_SE_EPCT_DP_PATH',
                installationConfiguration.clientsFormData.OMS_SE_EPCT_DP_PATH,
                '(Profiles_Configuration/OMS_SE/OMS_SE.profile/oms_se.EPCT_DP_PATH=)'
              );
              //OMS_SE_SRC_DB_USER
              execString = addToExecString(
                execString,
                OMS_SE_SRC_DB_USER,
                'OMS_SE_SRC_DB_USER',
                installationConfiguration.clientsFormData.OMS_SE_SRC_DB_USER,
                '(Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_user=)'
              );
              //OMS_SE_SRC_DB_PASSWORD
              execString = addToExecString(
                execString,
                OMS_SE_SRC_DB_PASSWORD,
                'OMS_SE_SRC_DB_PASSWORD',
                installationConfiguration.clientsFormData
                  .OMS_SE_SRC_DB_PASSWORD,
                '(Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_password=)'
              );
              //OMS_SE_SRC_DB_INSTANCE
              execString = addToExecString(
                execString,
                OMS_SE_SRC_DB_INSTANCE,
                'OMS_SE_SRC_DB_INSTANCE',
                installationConfiguration.clientsFormData
                  .OMS_SE_SRC_DB_INSTANCE,
                '(Profiles_Configuration/OMS_SE/OMS_SE.profile/Source.ref.DB/oms_se.src_ref_db_instance=)'
              );
              //OMS_SE_TRG_DB_CONN_STRING
              execString = addToExecString(
                execString,
                OMS_SE_TRG_DB_CONN_STRING,
                'OMS_SE_TRG_DB_CONN_STRING',
                installationConfiguration.clientsFormData
                  .OMS_SE_TRG_DB_CONN_STRING,
                '(Profiles_Configuration/OMS_SE/OMS_SE.profile/oms_se.trg_db_conn_string=)'
              );
            } else {
              //OMS_SE_EPCT_DP_DIR_DISABLE
              execString = addDisableToExecString(
                execString,
                OMS_SE_EPCT_DP_DIR_DISABLE
              );
              //OMS_SE_SRC_DB_USER_DISABLE
              execString = addDisableToExecString(
                execString,
                OMS_SE_SRC_DB_USER_DISABLE
              );
              //OMS_SE_SRC_DB_PASSWORD_DISABLE
              execString = addDisableToExecString(
                execString,
                OMS_SE_SRC_DB_PASSWORD_DISABLE
              );
              //OMS_SE_SRC_DB_INSTANCE_DISABLE
              execString = addDisableToExecString(
                execString,
                OMS_SE_SRC_DB_INSTANCE_DISABLE
              );
              //OMS_SE_CLIENT_DISABLE
              execString = addDisableToExecString(
                execString,
                OMS_SE_CLIENT_DISABLE
              );
            }
            if (installationConfiguration.clients.includes('MCSS_SE')) {
              //MCSS_SE_EPCT_DP_PATH
              execString = addToExecString(
                execString,
                MCSS_SE_EPCT_DP_PATH,
                'MCSS_SE_EPCT_DP_PATH',
                installationConfiguration.clientsFormData.MCSS_SE_EPCT_DP_PATH,
                '(Profiles_Configuration/MCSS_SE/MCSS_SE.profile/mcss_se.EPCT_DP_PATH=)'
              );
              //MCSS_SE_SRC_DB_USER
              execString = addToExecString(
                execString,
                MCSS_SE_SRC_DB_USER,
                'MCSS_SE_SRC_DB_USER',
                installationConfiguration.clientsFormData.MCSS_SE_SRC_DB_USER,
                '(Profiles_Configuration/MCSS_SE/MCSS_SE.profile/Source.ref.DB/mcss_se.src_ref_db_user=)'
              );
              //MCSS_SE_SRC_DB_PASSWORD
              execString = addToExecString(
                execString,
                MCSS_SE_SRC_DB_PASSWORD,
                'MCSS_SE_SRC_DB_PASSWORD',
                installationConfiguration.clientsFormData
                  .MCSS_SE_SRC_DB_PASSWORD,
                '(Profiles_Configuration/MCSS_SE/MCSS_SE.profile/Source.ref.DB/mcss_se.src_ref_db_password=)'
              );
              //MCSS_SE_SRC_DB_INSTANCE
              execString = addToExecString(
                execString,
                MCSS_SE_SRC_DB_INSTANCE,
                'MCSS_SE_SRC_DB_INSTANCE',
                installationConfiguration.clientsFormData
                  .MCSS_SE_SRC_DB_INSTANCE,
                '(Profiles_Configuration/MCSS_SE/MCSS_SE.profile/Source.ref.DB/mcss_se.src_ref_db_instance=)'
              );
              //MCSS_SE_TRG_DB_CONN_STRING
              execString = addToExecString(
                execString,
                MCSS_SE_TRG_DB_CONN_STRING,
                'MCSS_SE_TRG_DB_CONN_STRING',
                installationConfiguration.clientsFormData
                  .MCSS_SE_TRG_DB_CONN_STRING,
                '(Profiles_Configuration/MCSS_SE/MCSS_SE.profile/mcss_se.trg_db_conn_string=)'
              );
            } else {
              //MCSS_SE_EPCT_DP_DIR_DISABLE
              execString = addDisableToExecString(
                execString,
                MCSS_SE_EPCT_DP_DIR_DISABLE
              );
              //MCSS_SE_SRC_DB_USER_DISABLE
              execString = addDisableToExecString(
                execString,
                MCSS_SE_SRC_DB_USER_DISABLE
              );
              //MCSS_SE_SRC_DB_PASSWORD_DISABLE
              execString = addDisableToExecString(
                execString,
                MCSS_SE_SRC_DB_PASSWORD_DISABLE
              );
              //MCSS_SE_SRC_DB_INSTANCE_DISABLE
              execString = addDisableToExecString(
                execString,
                MCSS_SE_SRC_DB_INSTANCE_DISABLE
              );
              //MCSS_SE_CLIENT_DISABLE
              execString = addDisableToExecString(
                execString,
                MCSS_SE_CLIENT_DISABLE
              );
            }
            if (installationConfiguration.clients.includes('ACPE')) {
              //ACPE_EPCT_DP_PATH
              execString = addToExecString(
                execString,
                ACPE_EPCT_DP_PATH,
                'ACPE_EPCT_DP_PATH',
                installationConfiguration.clientsFormData.ACPE_EPCT_DP_PATH,
                '(Profiles_Configuration/ACPE/ACPE.profile/acpe.EPCT_DP_PATH=)'
              );
              //ACPE_SRC_DB_USER
              execString = addToExecString(
                execString,
                ACPE_SRC_DB_USER,
                'ACPE_SRC_DB_USER',
                installationConfiguration.clientsFormData.ACPE_SRC_DB_USER,
                '(Profiles_Configuration/ACPE/ACPE.profile/Source.ref.DB/acpe.src_ref_db_user=)'
              );
              //ACPE_SRC_DB_PASSWORD
              execString = addToExecString(
                execString,
                ACPE_SRC_DB_PASSWORD,
                'ACPE_SRC_DB_PASSWORD',
                installationConfiguration.clientsFormData.ACPE_SRC_DB_PASSWORD,
                '(Profiles_Configuration/ACPE/ACPE.profile/Source.ref.DB/acpe.src_ref_db_password=)'
              );
              //ACPE_SRC_DB_INSTANCE
              execString = addToExecString(
                execString,
                ACPE_SRC_DB_INSTANCE,
                'ACPE_SRC_DB_INSTANCE',
                installationConfiguration.clientsFormData.ACPE_SRC_DB_INSTANCE,
                '(Profiles_Configuration/ACPE/ACPE.profile/Source.ref.DB/acpe.src_ref_db_instance=)'
              );
              //ACPE_TRG_DB_CONN_STRING
              execString = addToExecString(
                execString,
                ACPE_TRG_DB_CONN_STRING,
                'ACPE_TRG_DB_CONN_STRING',
                installationConfiguration.clientsFormData
                  .ACPE_TRG_DB_CONN_STRING,
                '(Profiles_Configuration/ACPE/ACPE.profile/acpe.trg_db_conn_string=)'
              );
            } else {
              //ACPE_EPCT_DP_DIR_DISABLE
              execString = addDisableToExecString(
                execString,
                ACPE_EPCT_DP_DIR_DISABLE
              );
              //ACPE_SRC_DB_USER_DISABLE
              execString = addDisableToExecString(
                execString,
                ACPE_SRC_DB_USER_DISABLE
              );
              //ACPE_SRC_DB_PASSWORD_DISABLE
              execString = addDisableToExecString(
                execString,
                ACPE_SRC_DB_PASSWORD_DISABLE
              );
              //ACPE_SRC_DB_INSTANCE_DISABLE
              execString = addDisableToExecString(
                execString,
                ACPE_SRC_DB_INSTANCE_DISABLE
              );
              //ACPE_CLIENT_DISABLE
              execString = addDisableToExecString(
                execString,
                ACPE_CLIENT_DISABLE
              );
            }

            // Execute the second command only after the first has completed
            conn.exec(execString, (err, stream) => {
              if (err) {
                console.error('Command execution error:', err);
                return res.status(500).send('Command execution failed');
              }

              stream.on('data', (data) => {
                stdout += data.toString(); // Capture the stdout data
              });

              stream.stderr.on('data', (data) => {
                stderr += data.toString(); // Capture the stderr data
              });

              stream.on('close', (code, signal) => {
                console.log('Second command finished with code:', code);

                if (code !== 0) {
                  console.error('Second command failed with stderr:', stderr);
                  return res.status(500).send('Third command failed');
                }
                // Execute the Third command only after the first has completed
                conn.exec(
                  `cd ${config.get(
                    'TTMHome'
                  )}installer/bin/ && ./xpi_installer.sh -i -p ttm-packager-10.24.0.0-general-package-2024052607.jar -t ${config.get(
                    'TTMHome'
                  )}product/template-topologies/EPC_TTM.topology -pr ${config.get(
                    'TTMHome'
                  )}product/template-topologies/EPC_TTM.properties `,
                  (err, stream) => {
                    if (err) {
                      console.error('Command execution error:', err);
                      return res.status(500).send('Command execution failed');
                    }

                    stream.on('data', (data) => {
                      stdout += data.toString(); // Capture the stdout data
                    });

                    stream.stderr.on('data', (data) => {
                      stderr += data.toString(); // Capture the stderr data
                    });

                    stream.on('close', (code, signal) => {
                      console.log('Third command finished with code:', code);

                      if (code !== 0) {
                        console.error(
                          'Third command failed with stderr:',
                          stderr
                        );
                        return res.status(500).send('Third command failed');
                      }

                      conn.end();
                      res.status(200).json({ data: stdout });
                    });
                  }
                );
              });
            });
          });
        }
      );
    });

    conn.on('error', (err) => {
      console.error('SSH connection error:', err);
      res
        .status(500)
        .send(
          'SSH connection failed, check connection details of TTM Environment'
        );
    });

    conn.connect({
      host: config.get('TTMhost'),
      port: config.get('TTMport'),
      username: config.get('TTMusername'),
      password: config.get('TTMpassword'),
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).send('Unexpected error occurred');
  }
});

module.exports = router;
