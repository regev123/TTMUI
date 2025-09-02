const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { exec } = require('child_process');
const { Client } = require('ssh2');

const loadConfigFile = require('../../utils/getConfigurationFile');
const InstallationExecString = require('../../utils/InstallationExecString');
const linuxConnectionClient = require('../../utils/linuxConnectionClient');

/**
 * @async
 * @route   POST /api/installation/install
 * @desc    Handles the installation of the Topological Task Manager (TTM) by executing a series of commands on a remote server via SSH.
 *          It performs the following steps:
 *          1. Downloads the specified tar file from the provided URL.
 *          2. Extracts the downloaded tar files and creates the necessary property file.
 *          3. Overrides installation properties based on the provided configuration.
 *          4. Executes the installation process using the generated properties.
 * @access  Public
 *
 * @param {Object} req - The request object containing the installation configuration in the body.
 * @param {Object} res - The response object used to send back the status of the installation process.
 *
 * @returns {Promise<void>} - A promise that resolves when the installation is complete and the response is sent.
 */
router.post('/install', async (req, res) => {
  try {
    const installationConfiguration = req.body;
    const config = await loadConfigFile();
    const { TTMHome } = config.configData;
    const { URL, tarName, xpiName, jarName, obfuscationTar } =
      installationConfiguration.matchedVersion;
    const preCommand = `cd ${TTMHome} && source ~/.profile &&`;
    if (installationConfiguration.tarOnEnvironment) {
      await executeDeleteAllOtherFilesExceptTar(TTMHome, tarName);
    } else {
      await executeDownloadTar(preCommand, URL);
    }
    await executeExtractAndCreateProperties(
      preCommand,
      tarName,
      xpiName,
      jarName,
      obfuscationTar,
      TTMHome
    );
    await executeOverrideProperties(installationConfiguration, TTMHome);
    await executeInstallation(preCommand, jarName, TTMHome);

    res.status(200).send('Installation Finished Successfully');
  } catch (error) {
    console.error('Installation process encountered an error:', error);
    res.status(400).send('Installation failed');
  }
});

/**
 * @async
 * @desc    Executes a command to download a tar file from a specified URL on a remote server.
 *          The command first cleans the current directory by deleting all files before
 *          downloading the new tar file. It uses the provided preCommand to navigate to
 *          the correct directory and source the necessary environment variables.
 *
 * @param {string} preCommand - The command prefix that includes directory change and environment sourcing.
 * @param {string} url - The URL of the tar file to be downloaded from the nexus repository.
 *
 * @throws {Error} If the download command fails, an error is thrown indicating the failure.
 *
 * @returns {Promise<void>} - A promise that resolves when the download command is executed successfully.
 */
async function executeDownloadTar(preCommand, url) {
  const command = `${preCommand} find . -mindepth 1 -delete && wget ${url}`;
  const response = await linuxConnectionClient(command);
  if (response.code !== 0) {
    throw new Error('Failed to download the tar file from nexus');
  }
  console.log('Succeeded in downloading file from nexus');
}

/**
 * @function executeDeleteAllOtherFilesExceptTar
 * @desc    Deletes all files in the specified directory except the file with the given tar name.
 *          It uses the `find` command to locate and remove files, skipping the one specified by `tarName`.
 * @access  Private
 *
 * @param {string} TTMHome - The base directory where the search for files to delete begins.
 * @param {string} tarName - The name of the tar file that should not be deleted.
 *
 * @returns {Promise<void>} - Resolves when all files except the tar file are deleted.
 */
async function executeDeleteAllOtherFilesExceptTar(TTMHome, tarName) {
  const command = `find ${TTMHome} -mindepth 1 ! -name '${tarName}' -exec rm -rf {} +`;
  await linuxConnectionClient(command);
  console.log('Succeeded in delete all files');
}

/**
 * @async
 * @desc    Executes a command to extract tar files and create property files on a remote server.
 *          This function performs the following steps:
 *          1. Extracts the specified tar and xpi files.
 *          2. Extracts the specified jar file to obtain a topology file.
 *          3. Changes the directory to the installer/bin and executes a script to create property files
 *             based on the extracted topology and jar files.
 *
 * @param {string} preCommand - The command prefix that includes directory change and environment sourcing.
 * @param {string} tarName - The name of the tar file to be extracted.
 * @param {string} xpiName - The name of the xpi file to be extracted.
 * @param {string} jarName - The name of the jar file to be extracted.
 * @param {string} ttmHome - The home directory for TTM, used in the property file creation command.
 *
 * @throws {Error} If the extraction or property file creation command fails, an error is thrown indicating the failure.
 *
 * @returns {Promise<void>} - A promise that resolves when the extraction and property file creation command is executed successfully.
 */
async function executeExtractAndCreateProperties(
  preCommand,
  tarName,
  xpiName,
  jarName,
  obfuscationTar,
  ttmHome
) {
  const command = `${preCommand} tar -xvf ${tarName} && tar -xvf ${obfuscationTar} && tar -xvf ${xpiName} && jar -xvf ${jarName} product/template-topologies/EPC_TTM.topology && cd installer/bin/ && ./xpi_create_silent_property.sh --details all ${ttmHome}product/template-topologies/EPC_TTM.topology ${ttmHome}${jarName}`;
  const response = await linuxConnectionClient(command);
  if (response.code !== 0) {
    throw new Error('Failed to extract tars or create property file');
  }
  console.log('Succeeded in extracting tars and creating property files');
}

/**
 * @async
 * @desc    Executes a command to override installation properties in a specified directory on a remote server.
 *          This function constructs a command that:
 *          1. Changes the directory to the specified path where the property files are located.
 *          2. Utilizes the InstallationExecString utility to generate the necessary command for overriding properties.
 *
 * @param {Object} installationConfiguration - The configuration object containing installation properties to be overridden.
 * @param {string} ttmHome - The home directory for TTM, used to build the command for navigating to the correct directory.
 *
 * @throws {Error} If the command to override the installation properties fails, an error is thrown indicating the failure.
 *
 * @returns {Promise<void>} - A promise that resolves when the property overriding command is executed successfully.
 */
async function executeOverrideProperties(installationConfiguration, ttmHome) {
  let command = `cd ${ttmHome}product/template-topologies/ `;
  command = InstallationExecString(command, installationConfiguration);
  const response = await linuxConnectionClient(command);
  if (response.code !== 0) {
    throw new Error('Failed to override installation properties');
  }
  console.log('Succeeded in overriding installation properties');
}

/**
 * @async
 * @desc    Executes the installation script for the specified JAR file on a remote server.
 *          This function constructs a command that:
 *          1. Changes the directory to the installer binaries.
 *          2. Runs the installation script (`xpi_installer.sh`) with the appropriate flags to install the JAR file
 *             using a specified topology and property file.
 *
 * @param {string} preCommand - The command prefix used to navigate to the appropriate directory and set the environment.
 * @param {string} jarName - The name of the JAR file to be installed.
 * @param {string} ttmHome - The home directory for TTM, used to construct paths for the topology and property files.
 *
 * @throws {Error} If the installation command fails, an error is thrown indicating the failure.
 *
 * @returns {Promise<void>} - A promise that resolves when the installation command is executed successfully.
 */
async function executeInstallation(preCommand, jarName, ttmHome) {
  const command = `${preCommand} cd ${ttmHome}installer/bin/ && ./xpi_installer.sh -i -p ${jarName} -t ${ttmHome}product/template-topologies/EPC_TTM.topology -pr ${ttmHome}product/template-topologies/EPC_TTM.properties`;
  const response = await linuxConnectionClient(command);
  if (response.code !== 0) {
    throw new Error('Installation failed');
  }
  console.log('Installation finished successfully');
}

/**
 * @route   POST /api/installation/checkTarOnEnvironment
 * @desc    Checks if a specified tar file version exists in the environment.
 *          It runs a command to search for a tar file with the specified version in the TTMHome directory.
 *          Returns a message indicating whether the tar file is found or not.
 * @access  Public
 *
 * @param {Object} req - Express request object containing:
 *   - {string} selectedInstallationVersion - The version of the tar file to check for in the TTMHome directory.
 *
 * @param {Object} res - Express response object
 *
 * @returns {Object} - JSON response with:
 *   - {string} message - Success or failure message indicating if the tar file is found.
 *   - {string} error - Error message if the tar file is not found.
 */
router.post('/checkTarOnEnvironment', async (req, res) => {
  const { selectedInstallationVersion } = req.body;
  const config = await loadConfigFile();
  const { TTMHome } = config.configData;

  const command = `cd ${TTMHome} && [ -n "$(ls *${selectedInstallationVersion}*.tar 2>/dev/null)" ] && echo "true" || echo "false"`;
  const response = await linuxConnectionClient(command);

  if (response.stdout.trim() === 'false') {
    return res
      .status(400)
      .send(
        `TTM Tar version ${selectedInstallationVersion} not found on the environment`
      );
  }

  res.status(200).send('Tar file found');
});

const upload = multer({
  dest: '/tmp/uploads',
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('Received file upload request.');
    console.log('Uploaded file details:', req.file);

    const config = await loadConfigFile();
    const { TTMHome, TTMhost, TTMport, TTMusername, TTMpassword } =
      config.configData;

    const tempPath = path.normalize(req.file.path).replace(/\\/g, '/');
    const remotePath = path
      .join(TTMHome, req.file.originalname)
      .replace(/\\/g, '/');

    const conn = new Client();

    conn
      .on('ready', () => {
        console.log('SSH connection ready.');
        conn.sftp((err, sftp) => {
          if (err) {
            console.error('SFTP initialization error:', err.message);
            conn.end();
            return res
              .status(500)
              .send(`SFTP connection failed: ${err.message}`);
          }

          console.log('SFTP connection established.');

          const readStream = fs.createReadStream(tempPath);
          const writeStream = sftp.createWriteStream(remotePath);

          writeStream
            .on('close', () => {
              console.log('File successfully transferred');
              fs.unlink(tempPath, (unlinkErr) => {
                if (unlinkErr) {
                  console.error(
                    'Error deleting temporary file:',
                    unlinkErr.message
                  );
                  return res
                    .status(500)
                    .send('Error cleaning up temporary file');
                }

                console.log('Temporary file deleted.');
                res
                  .status(200)
                  .send('File uploaded and transferred successfully!');
              });

              conn.end();
            })
            .on('error', (writeErr) => {
              console.error('Error during file transfer:', writeErr.message);
              conn.end();
              res
                .status(500)
                .send(`Error during file transfer: ${writeErr.message}`);
            });

          readStream.pipe(writeStream);
        });
      })
      .on('error', (err) => {
        console.error('SSH connection error:', err.message);
        res.status(500).send(`SSH connection failed: ${err.message}`);
      });

    conn.connect({
      host: TTMhost,
      port: TTMport,
      username: TTMusername,
      password: TTMpassword,
    });
  } catch (error) {
    console.error('Unexpected error:', error.message);
    res.status(500).send(`Unexpected error: ${error.message}`);
  }
});

module.exports = router;
