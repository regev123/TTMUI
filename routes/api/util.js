const express = require('express');
const router = express.Router();
const config = require('config');
const { Client } = require('ssh2');

// @route    POST api/util/getExistingClients
// @desc     get the existing clients that was installed on the environemnt
// @access   Public
router.post('/getExistingClients', async (req, res) => {
  let stdout = '';
  let stderr = '';

  try {
    const conn = new Client();

    conn.on('ready', () => {
      console.log('Client :: ready');

      conn.exec(`cd ${config.get('TTMHome')}WORK_DIR && ls`, (err, stream) => {
        if (err) {
          console.error('Command execution error:', err);
          return res.status(500).send('Command execution failed');
        }

        stream.on('data', (data) => {
          stdout += data.toString(); // Capture the stdout data
        });

        stream.stderr.on('data', (data) => {
          stderr += data.toString(); // Capture the stderr data
        });

        stream.on('close', (code, signal) => {
          if (code !== 0) {
            console.error('First command failed with stderr:', stderr);
            return res.status(500).send('First command failed');
          }

          res.status(200).json(stdout);
        });
      });
    });

    conn.on('error', (err) => {
      console.error('SSH connection error:', err);
      res
        .status(500)
        .send(
          'SSH connection failed, check connection details of TTM Environment'
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
