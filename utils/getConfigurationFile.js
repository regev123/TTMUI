const path = require('path');
const fs = require('fs').promises;

/**
 * @async
 * @desc    Loads the configuration file from a specified path, handling both packaged and non-packaged environments.
 * @access  Internal
 *
 * @returns {Promise<{ configData: object, configPath: string }>} - An object containing the configuration data and the path of the config file.
 * @throws {Error} - Throws an error if the config file cannot be read or parsed.
 */
const loadConfigFile = async () => {
  const defaultConfigPath = path.join(__dirname, '../config/default.json');
  const packagedConfigPath = path.join(process.cwd(), 'config', 'default.json');

  const configPath = process.pkg ? packagedConfigPath : defaultConfigPath;

  try {
    const fileContent = await fs.readFile(configPath, 'utf8');
    const configData = JSON.parse(fileContent);
    return { configData, configPath };
  } catch (error) {
    throw new Error(`Failed to load configuration file: ${error.message}`);
  }
};

module.exports = loadConfigFile;
