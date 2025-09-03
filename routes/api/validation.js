const express = require('express');
const router = express.Router();
const loadConfigFile = require('../../utils/getConfigurationFile');
const linuxConnectionClient = require('../../utils/linuxConnectionClient');

const ERROR_MESSAGE =
  'The TTM Home path is incorrect, or TTM is not installed. Please update it on the Configuration tab!';
/**
 * @desc    Validates the correctness of the TTM (Topological Task Manager) Home path
 *          by checking if the specified directory contains a "WORK_DIR". This is
 *          done by executing a command to list the contents of the TTMHome directory.
 * @access  Public
 *
 * @route   POST api/validation/validateTTMHomeCorrectPath
 *
 * @param   {object} req - The HTTP request object containing the configuration data.
 * @param   {object} res - The HTTP response object used to send back the validation
 *                         status or an error message.
 *
 * @returns {void} - Sends a JSON response indicating whether the TTM Home path is
 *                   correct or an error message if validation fails.
 */
router.post('/validateTTMHomeCorrectPath', async (req, res) => {
  try {
    const config = await loadConfigFile();
    const { TTMHome } = config.configData;
    const response = await linuxConnectionClient(`cd ${TTMHome} && ls`);
    if (response.code !== 0 || !response.stdout.includes('WORK_DIR')) {
      return res.status(500).send(ERROR_MESSAGE);
    }
    res.status(200).json('TTM Home path is correct');
  } catch (error) {
    res.status(500).json(error.errorMessage);
  }
});

/**
 * @desc    Checks the connection to the TTM (Topological Task Manager) environment
 *          by attempting to establish an SSH connection without executing any command.
 *          This serves to verify that the connection details are correct and that the
 *          environment is reachable.
 * @access  Public
 *
 * @route   GET api/validation/checkEnvironmentConnection
 *
 * @param   {object} req - The HTTP request object (not used in this case).
 * @param   {object} res - The HTTP response object used to send back the connection
 *                         status or an error message.
 *
 * @returns {void} - Sends a JSON response indicating whether the connection was
 *                   successful or an error message if the connection fails.
 */
router.get('/checkEnvironmentConnection', async (req, res) => {
  try {
    await linuxConnectionClient('');
    res.status(200).json('Connection Succeeded!');
  } catch (error) {
    res.status(500).json(error.errorMessage);
  }
});

router.get('/isEnvironmentObfuscated', async (req, res) => {
  try {
    const config = await loadConfigFile();
    const { TTMHome } = config.configData;
    const response = await linuxConnectionClient(
      `cd ${TTMHome}../.obs/ && grep '^IS_ENV_OBFUSCATED=' obfs | cut -d'=' -f2`
    );
    res.status(200).json({ isEnvObfs: response.stdout.trim() });
  } catch (error) {
    res.status(500).json(error.errorMessage);
  }
});

module.exports = router;
