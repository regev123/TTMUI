const express = require('express');
const router = express.Router();
const loadConfigFile = require('../../utils/getConfigurationFile');
const linuxConnectionClient = require('../../utils/linuxConnectionClient');

/**
 * @async
 * @desc    Generates a command to list log files based on the specified log type.
 * @access  Internal
 *
 * @param {string} logType - The type of logs to retrieve (e.g., 'Packager' or 'Deployer').
 *
 * @returns {Promise<string>} - A promise that resolves to the generated command string.
 */
async function generateLogListCommand(logType) {
  const config = await loadConfigFile();
  const command = `
    cd ${config.configData.TTMHome}WORK_DIR/ &&
    echo "[" &&
    find . -type f -name "MEC-${logType}*.log" | while read -r file; do
      echo "  {";
      echo "    \\"fileName\\": \\"$(basename "$file")\\","; 
      echo "    \\"fileContent\\": \\"$(sed ':a;N;$!ba;s/\\\\/\\\\\\\\/g;s/\\n/\\\\n/g;s/\\"/\\\\\\"/g' "$file")\\"";
      echo "  },"; 
    done | sed '$ s/,$//' &&
    echo "]"
  `;
  return command.trim(); // Trim to remove any unnecessary whitespace
}

/**
 * @async
 * @route   POST /api/history/getPackagerDeployerLogList
 * @desc    Handles the request to get the list of packager or deployer logs based on the log type specified in the request body.
 * @access  Public
 *
 * @param {Object} req - The request object containing the log type in the body.
 * @param {Object} res - The response object used to send back the log list.
 *
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */
router.post('/getPackagerDeployerLogList', async (req, res) => {
  try {
    const logType = req.body.type;

    const historyCommand = await generateLogListCommand(logType);
    const historyResponse = await linuxConnectionClient(historyCommand);

    return res.status(200).json({ stdout: historyResponse.stdout });
  } catch (error) {
    console.error('Error fetching log list:', error);
    return res.status(500).json({ error: 'Failed to retrieve log list' });
  }
});

/**
 * @route   DELETE /deleteSelectedLog/:logName
 * @desc    Deletes a specified log file from the system based on the provided log name.
 * @access  Public
 *
 * @param {Object} req - Express request object containing:
 *   - {string} logName - The name of the log file to be deleted, passed as a URL parameter.
 *
 * @param {Object} res - Express response object
 *
 * @returns {Object} - JSON response with:
 *   - {string} message - Success message if the file is deleted successfully
 *   - {Object} error - An error message if the deletion fails
 */
router.delete('/deleteSelectedLog/:logName', async (req, res) => {
  try {
    const { logName } = req.params;
    const config = await loadConfigFile();
    const TTMHome = config.configData.TTMHome;
    const command = `rm -f ${TTMHome}WORK_DIR/${logName}`;

    await linuxConnectionClient(command);

    return res.status(200).send('File Deleted');
  } catch (error) {
    console.error('Error fetching log list:', error);
    return res.status(500).send('Failed to delete file');
  }
});

module.exports = router;
