const express = require('express'); // Importing Express framework
const router = express.Router(); // Initializing an Express Router to handle API routes
const { Client } = require('ssh2'); // Importing the SSH2 Client for executing SSH commands on a remote server
const loadConfigFile = require('./getConfigurationFile'); // Loading a configuration file module

const InstallationExecString = require('../../utils/InstallationExecString'); // Custom utility to generate execution strings for the installation process

// @route    POST api/installation/install
// @desc     Install TTM (Topological Task Manager)
// @access   Public
router.post('/install', async (req, res) => {
  const installationConfiguration = req.body; // Getting installation configuration from the request body
  const config = await loadConfigFile(); // Loading configuration from an external file
  let stdout = ''; // Variable to capture standard output from SSH commands
  let stderr = ''; // Variable to capture standard error output from SSH commands
  ttmHome = config.configData.TTMHome; // Accessing the TTM home directory from the configuration

  try {
    const conn = new Client(); // Creating a new SSH client instance

    conn.on('ready', () => {
      // Event handler triggered when the SSH connection is ready
      // Execute the first command (download and extract files)
      conn.exec(
        `cd ${ttmHome} && source ~/.profile && find . -mindepth 1 -delete && wget http://illin3301:28080/nexus/service/local/repositories/amd-core-fnd-Releases/content/com/amdocs/mec/packager/10.24.0.0/2024052607/10.24.0.0-2024052607.tar && tar -xvf 10.24.0.0-2024052607.tar && tar -xvf xpi-packaging-9.22.1.0.tar && jar -xvf ttm-packager-10.24.0.0-general-package-2024052607.jar product/template-topologies/EPC_TTM.topology && cd installer/bin/ && ./xpi_create_silent_property.sh  --details all ${ttmHome}product/template-topologies/EPC_TTM.topology ${ttmHome}ttm-packager-10.24.0.0-general-package-2024052607.jar`,
        (err, stream) => {
          if (err) {
            console.error('Command execution error:', err); // Log if there is an error during execution
            return res.status(500).send('Command execution failed'); // Send error response
          }

          stream.on('data', (data) => {
            stdout += data.toString(); // Capture the stdout data from the SSH command
          });

          stream.stderr.on('data', (data) => {
            stderr += data.toString(); // Capture the stderr data from the SSH command
          });

          stream.on('close', (code, signal) => {
            // When the first command completes, check its exit code
            console.log(stderr);
            if (code !== 0) {
              console.error(
                'Failed download the tar file from nexus, extract it, and create a property file...'
              );
              return res.status(500).send('Installation failed'); // Send error response if the command fails
            }
            console.log(
              'Succeeded in downloading, extracting, and creating the property file'
            );

            // Prepare execution string for the second command
            let execString = `cd ${ttmHome}product/template-topologies/ `;
            execString = InstallationExecString(
              execString,
              installationConfiguration
            ); // Generate the exec string with additional configurations

            // Execute the second command only after the first has completed
            conn.exec(execString, (err, stream) => {
              if (err) {
                console.error('Command execution error:', err); // Log error during the second command execution
                return res.status(500).send('Command execution failed');
              }

              stream.on('data', (data) => {
                stdout += data.toString(); // Capture stdout from the second command
              });

              stream.stderr.on('data', (data) => {
                stderr += data.toString(); // Capture stderr from the second command
              });

              stream.on('close', (code, signal) => {
                // Check if the second command was successful
                if (code !== 0) {
                  console.error('Failed to override all properties');
                  return res.status(500).send('Installation failed'); // Send error response if the second command fails
                }
                console.log('Succeeded in overriding all properties');

                // Execute the third command only after the second has completed
                conn.exec(
                  `source ~/.profile && cd ${ttmHome}installer/bin/ && ./xpi_installer.sh -i -p ttm-packager-10.24.0.0-general-package-2024052607.jar -t ${ttmHome}product/template-topologies/EPC_TTM.topology -pr ${ttmHome}product/template-topologies/EPC_TTM.properties`,
                  (err, stream) => {
                    if (err) {
                      console.error('Command execution error:', err); // Log error during the third command execution
                      return res.status(500).send('Command execution failed');
                    }

                    stream.on('data', (data) => {
                      stdout += data.toString(); // Capture stdout from the third command
                    });

                    stream.stderr.on('data', (data) => {
                      stderr += data.toString(); // Capture stderr from the third command
                    });

                    stream.on('close', (code, signal) => {
                      // Final check to confirm successful installation
                      console.log(stderr);
                      if (code !== 0) {
                        return res.status(500).send('Installation failed');
                      }
                      console.log('Installation finished successfully');
                      conn.end(); // Close the SSH connection
                      res.status(200).json({ data: stdout }); // Send successful response with captured stdout
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
      // Event handler for SSH connection errors
      console.error('SSH connection error:', err);
      res
        .status(500)
        .send(
          'SSH connection failed, check connection details of TTM Environment'
        ); // Respond with an error if SSH connection fails
    });

    // Establish SSH connection using credentials from the config file
    conn.connect({
      host: config.configData.TTMhost, // TTM host address
      port: config.configData.TTMport, // SSH port
      username: config.configData.TTMusername, // SSH username
      password: config.configData.TTMpassword, // SSH password
    });
  } catch (error) {
    console.error('Unexpected error:', error); // Catch and log unexpected errors
    res.status(500).send('Unexpected error occurred'); // Respond with a generic error message
  }
});

module.exports = router; // Export the router to be used in the Express app
