const express = require('express');
const router = express.Router();
const config = require('config');
const { Client } = require('ssh2');

// @route    POST api/validation/validateTTMHomeCorrectPath
// @desc     check TTMHome path correct from configuration file
// @access   Public
router.post('/validateTTMHomeCorrectPath', async (req, res) => {
  let stdout = '';
  let stderr = '';

  try {
    const conn = new Client();

    conn.on('ready', () => {
      console.log('Client :: ready');

      conn.exec(`cd ${config.get('TTMHome')} && ls`, (err, stream) => {
        if (err) {
          console.error('Command execution error:', err);
          return res.status(500).send('Command execution failed');
        }

        stream.on('data', (data) => {
          stdout += data.toString();
        });

        stream.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        stream.on('close', (code, signal) => {
          if (code !== 0) {
            console.error('TTM Home path is incorrect:', stderr);
            return res
              .status(500)
              .send(
                'TTM Home path is incorrect, please change on the configuration tab!'
              );
          }

          if (!stdout.includes('WORK_DIR'))
            return res
              .status(500)
              .json(
                'TTM Home path is incorrect, please change on the configuration tab!'
              );
          return res.status(200).json('TTM Home path is correct');
        });
      });
    });

    conn.on('error', (err) => {
      console.error('SSH connection error:', err);
      return res
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
    return res.status(500).send('Unexpected error occurred');
  }
});

module.exports = router;
