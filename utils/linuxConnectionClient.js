const loadConfigFile = require('./getConfigurationFile');
const { Client } = require('ssh2');

/**
 * @desc    Executes a command on a remote Linux server via SSH, capturing the standard
 *          output, standard error, and exit code of the command execution.
 * @access  Public
 *
 * @param   {string} executionCommand - The command to execute on the remote server.
 *
 * @returns {Promise<object>} - A promise that resolves to an object containing:
 *                              - stdout: The standard output from the executed command.
 *                              - stderr: The standard error output from the executed command.
 *                              - code: The exit code returned by the command execution.
 *                              - errorMessage: An error message if an error occurs during
 *                                connection or execution.
 */
const linuxConnectionClient = async (executionCommand) => {
  const config = await loadConfigFile();
  let stdout = '';
  let stderr = '';

  const responseObject = { stdout: '', stderr: '', code: 0, errorMessage: '' };

  return new Promise((resolve, reject) => {
    try {
      const conn = new Client();

      conn.on('ready', () => {
        conn.exec(executionCommand, (err, stream) => {
          if (err) {
            console.error('Command execution error:', err);
            responseObject.errorMessage = 'Command execution failed!';
            return reject(responseObject);
          }

          stream.on('data', (data) => {
            stdout += data.toString();
          });

          stream.stderr.on('data', (data) => {
            stderr += data.toString();
          });

          stream.on('close', (code, signal) => {
            responseObject.stdout = stdout;
            responseObject.stderr = stderr;
            responseObject.code = code;

            conn.end();
            resolve(responseObject);
          });
        });
      });

      conn.on('error', (err) => {
        responseObject.errorMessage =
          'SSH connection failed, check connection details of TTM Environment';
        reject(responseObject);
      });

      conn.connect({
        host: config.configData.TTMhost,
        port: config.configData.TTMport,
        username: config.configData.TTMusername,
        password: config.configData.TTMpassword,
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      responseObject.errorMessage = 'Unexpected error occurred';
      reject(responseObject);
    }
  });
};

module.exports = linuxConnectionClient;
