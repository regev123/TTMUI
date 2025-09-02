import api from '../utils/api';

/**
 * @function validateConncetionString
 * @desc    Validates the connection strings for the provided clients.
 *          First, it checks if the connection strings are in the correct format.
 *          Then, it verifies whether the connections can be established to the database.
 * @param {Array} connectionStrings - The list of connection strings to be validated.
 * @throws {string} - Throws an error message if the connection string format is invalid or the DB connection fails.
 */
const validateConncetionString = async (connectionStrings) => {
  for (const { connString, type, client } of connectionStrings) {
    if (!validateUserPasswordInstance(connString)) {
      throw `${client} ${type} DB Connection String must be in this format User/Password@Instance`;
    }
  }

  for (const { connString, type, client } of connectionStrings) {
    if (!(await validateDBConnections(connString))) {
      throw `On ${client} ${type} DB connection failed. Check connection details.`;
    }
  }
};

/**
 * @function validateUserPasswordInstance
 * @desc    Validates the format of a connection string. The expected format is:
 *          User/Password@Instance. The function checks this pattern using a regular expression.
 * @param {string} input - The connection string to be validated.
 * @returns {boolean} - Returns true if the connection string matches the format, otherwise false.
 */
function validateUserPasswordInstance(input) {
  const pattern = /^[A-Za-z0-9_]+\/[A-Za-z0-9_]+@[A-Za-z0-9_]+$/;
  return pattern.test(input);
}

/**
 * @function validateDBConnections
 * @desc    Validates whether a database connection can be established using the provided connection string.
 *          Sends a request to the server to check the connection status.
 * @param {string} connectionString - The connection string to be validated.
 * @returns {boolean} - Returns true if the connection was successful, otherwise false.
 */
const validateDBConnections = async (connectionString) => {
  try {
    await api.post('/environmentValidation/checkDBConnection', {
      DBConnectionString: connectionString,
    });
  } catch {
    return false;
  }
  return true;
};

export default validateConncetionString;
