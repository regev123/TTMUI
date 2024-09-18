const express = require('express');
const router = express.Router();
const config = require('config');
const { Client } = require('ssh2');

// @route    POST api/environmentValidation/clientsValidation
// @desc     Validate all clients source target and ssh
// @access   Public
router.post('/clientsValidation', async (req, res) => {
  try {
    const conn = new Client();

    conn.on('ready', () => {
      console.log('Client :: ready');

      // Define SQL command to test connection
      const sqlCommand = `
        WHENEVER SQLERROR EXIT SQL.SQLCODE
        BEGIN
          NULL; -- Just a placeholder command to test the connection
        END;
        /
      `;

      // Execute the SQL command with sqlplus
      conn.exec(
        `cd ${config.get('TTMHome')} && ` +
          `source ~/.profile && ` +
          `echo "${sqlCommand}" | sqlplus -S ${req.body.body}`,
        (err, stream) => {
          if (err) {
            console.error('Command execution error:', err);
            return res.status(500).send('Command execution failed');
          }

          let stdoutData = '';
          let stderrData = '';

          stream.on('close', (code, signal) => {
            conn.end();

            if (stderrData.includes('ORA-') || stdoutData.includes('ERROR')) {
              console.error('SQL Error:', stderrData);
              return res.status(400).send('Validation failed');
            }

            if (
              stdoutData.includes('PL/SQL procedure successfully completed') ||
              stdoutData.includes('Connected')
            ) {
              res.status(200).json('Validation successful');
            } else {
              res.status(400).send('Validation failed');
            }
          });

          stream.stdout.on('data', (data) => {
            stdoutData += data.toString();
            console.log('STDOUT:', data.toString());
          });

          stream.stderr.on('data', (data) => {
            stderrData += data.toString();
            console.error('STDERR:', data.toString());
          });
        }
      );
    });

    conn.on('error', (err) => {
      console.error('SSH connection error:', err);
      res
        .status(500)
        .send(
          'SSH connection failed. Check connection details to TTM Environment.'
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
