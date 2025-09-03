import api from '../../utils/api';

/**
 * @function fetchLogs
 * @desc    Fetches logs for both Packager and Deployer, processes the logs by parsing and sorting them,
 *          then updates the state with the processed log data. Handles loading state and any errors during the fetch process.
 * @access  Public
 *
 * @param {function} setIsLoading - Callback to set the loading state while fetching logs.
 * @param {function} setLogs - Callback to set the logs' data once fetched and processed.
 * @param {function} setAlertMessage - Callback to display alert messages in case of errors.
 *
 * @returns {Promise<void>} - Resolves once the logs have been fetched, processed, and the state has been updated.
 */
const fetchLogs = async (
  setIsLoading,
  setLogs,
  setAlertMessage,
  setTTMHomePath
) => {
  setIsLoading(true);

  try {
    const logsData = await fetchLogData();
    setLogs({
      packager: parseAndSortLogs(logsData.packager),
      deployer: parseAndSortLogs(logsData.deployer),
    });
    getTTMHomePath(setTTMHomePath);
  } catch (error) {
    handleFetchLogsError(error, setAlertMessage);
  } finally {
    setIsLoading(false);
  }
};

/**
 * @function fetchLogData
 * @desc    Sends parallel API requests to fetch logs for both Packager and Deployer.
 *          Returns the response data for both logs.
 * @access  Private
 *
 * @returns {Object} - An object containing the raw logs for Packager and Deployer.
 * @throws {Error} - Throws an error if any of the API requests fail.
 */
const fetchLogData = async () => {
  const requests = ['Packager', 'Deployer'].map((type) =>
    api.post('/history/getPackagerDeployerLogList', { type })
  );

  const [packagerResponse, deployerResponse] = await Promise.all(requests);

  return {
    packager: packagerResponse.data.stdout,
    deployer: deployerResponse.data.stdout,
  };
};

/**
 * @function handleFetchLogsError
 * @desc    Handles errors during the log fetching process. Sets an appropriate error message
 *          and logs it to the console for debugging purposes.
 * @access  Private
 *
 * @param {Object} error - The error object received during the fetch process.
 * @param {function} setAlertMessage - Callback to set the alert message for the error.
 */
const handleFetchLogsError = (error, setAlertMessage) => {
  const errorMessage =
    error.response?.data ||
    'The TTM Home path is incorrect, or TTM is not installed. Please update it on the Configuration tab!';
  setAlertMessage(errorMessage);
  console.error(error);
};

/**
 * @function parseAndSortLogs
 * @desc    Parses and sorts log data based on the timestamp in the file name.
 *          The logs are first sanitized and parsed, then sorted by timestamp.
 * @access  Private
 *
 * @param {string} rawData - The raw log data to be parsed and sorted.
 * @returns {Array} - A sorted array of log entries.
 */
const parseAndSortLogs = (rawData) =>
  sortLogsByTimestamp(parseLogData(rawData));

/**
 * @function parseLogData
 * @desc    Sanitizes the raw log data and parses it into a structured format (an array of log entries).
 * @access  Private
 *
 * @param {string} rawData - The raw log data to be sanitized and parsed.
 * @returns {Array} - A structured array of log entries.
 */
const parseLogData = (rawData) => {
  const sanitizedData = sanitizeJSONString(rawData);
  const logEntries = JSON.parse(sanitizedData);
  return logEntries.map(formatLogFileName);
};

/**
 * @function sortLogsByTimestamp
 * @desc    Sorts log entries by the timestamp extracted from the file name in descending order.
 * @access  Private
 *
 * @param {Array} logs - An array of log entries to be sorted.
 * @returns {Array} - The sorted array of logs.
 */
const sortLogsByTimestamp = (logs) =>
  logs.sort((a, b) =>
    extractTimestamp(b.fileName).localeCompare(extractTimestamp(a.fileName))
  );

/**
 * @function formatLogFileName
 * @desc    Formats the log file name by appending a success or failure status based on the log content.
 * @access  Private
 *
 * @param {Object} file - The log file object to be formatted.
 * @returns {Object} - The log file object with the formatted file name.
 */
const formatLogFileName = (file) => ({
  ...file,
  fileName: `${file.fileName} - ${getLogStatus(file.fileContent)}`,
});

/**
 * @function getLogStatus
 * @desc    Determines the status (Success or Failure) of the log based on its content.
 * @access  Private
 *
 * @param {string} content - The content of the log file.
 * @returns {string} - 'Success' if the content indicates success, 'Failure' otherwise.
 */
const getLogStatus = (content) =>
  content.includes('Process MEC-Packager Finish Successfully (Status=0)') ||
  content.includes('Process MEC-Deployer Finish Successfully (Status=0)')
    ? 'Success'
    : 'Failure';

/**
 * @function sanitizeJSONString
 * @desc    Sanitizes the JSON string by removing non-printable characters.
 * @access  Private
 *
 * @param {string} str - The raw string to sanitize.
 * @returns {string} - The sanitized string.
 */
const sanitizeJSONString = (str) =>
  str
    .split('')
    .filter((char) => char >= ' ' && char !== '\u007F')
    .join('');

/**
 * @function extractTimestamp
 * @desc    Extracts the timestamp (in YYYYMMDDTHHMMSS format) from the log file name.
 * @access  Private
 *
 * @param {string} fileName - The log file name from which to extract the timestamp.
 * @returns {string} - The extracted timestamp or an empty string if no timestamp is found.
 */
const extractTimestamp = (fileName) => {
  const match = fileName.match(/_(\d{8}T\d{6})\.log/);
  return match ? match[1] : '';
};

const getTTMHomePath = async (setTTMHomePath) => {
  const { data } = await api.get('/util/getTTMHomePath');
  setTTMHomePath(data.TTMHomePath);
};

export default fetchLogs;
