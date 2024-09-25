const path = require('path'); // Import path module to work with file and directory paths
const fs = require('fs').promises; // Import fs module and use promises for asynchronous file operations

// Function to load the configuration file
const loadConfigFile = async () => {
  // Default path for the config file (in non-packaged environments)
  let configPath = path.join(__dirname, '../../config/default.json');

  // If the application is running in a packaged environment (e.g., with pkg), use a different path
  if (process.pkg) {
    configPath = path.join(process.cwd(), 'config', 'default.json'); // In packaged apps, use the current working directory
  }

  // Read the configuration file asynchronously, returning the file contents as a string
  const data = await fs.readFile(configPath, 'utf8');

  // Return the parsed JSON configuration data and the path from which the config was loaded
  return { configData: JSON.parse(data), configPath };
};

module.exports = loadConfigFile; // Export the loadConfigFile function for use in other parts of the application
