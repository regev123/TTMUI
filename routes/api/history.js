const express = require('express');
const router = express.Router();
const config = require('config');
const { Client } = require('ssh2');

// @route    POST api/history/getLatestPackagerLog
// @desc     get the latest packager history log
// @access   Public
router.post('/getPackagerLogList', async (req, res) => {
  let stdout = '';
  let stderr = '';
  try {
    const conn = new Client();
    conn.on('ready', () => {
      console.log('Client :: ready');
      const sshCommand = `
      cd ${config.get('TTMHome')}WORK_DIR/ &&
      echo "[" &&
      find . -type f -name "MEC-Packager*.log" | while read -r file; do
        echo "  {";
        echo "    \\"fileName\\": \\"$(basename "$file")\\",";
        echo "    \\"fileContent\\": \\"$(sed ':a;N;$!ba;s/\\\\/\\\\\\\\/g;s/\\n/\\\\n/g;s/\\"/\\\\\\"/g' "$file")\\"";
        echo "  },";
      done | sed '$ s/,$//' &&
      echo "]"
    `;
      conn.exec(sshCommand, (err, stream) => {
        if (err) {
          console.error('Command execution error:', err);
          return res.status(500).send('Command execution failed');
        }

        stream.on('close', (code, signal) => {
          conn.end();
          res.status(200).json({ stdout });
        });

        stream.stdout.on('data', (data) => {
          stdout += data.toString(); // Capture the stdout data
        });

        stream.stderr.on('data', (data) => {
          stderr += data.toString(); // Capture the stderr data
        });
      });
    });

    conn.on('error', (err) => {
      console.error('SSH connection error:', err);
      res
        .status(500)
        .send(
          'SSH connection failed, Check connection details to TTM Environment'
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

// @route    POST api/history/getLatestDeployerLog
// @desc     get the latest deployer history log
// @access   Public
router.post('/getDeployerLogList', async (req, res) => {
  let stdout = '';
  let stderr = '';
  try {
    const conn = new Client();
    conn.on('ready', () => {
      console.log('Client :: ready');
      const sshCommand = `
      cd ${config.get('TTMHome')}WORK_DIR/ &&
      echo "[" &&
      find . -type f -name "MEC-Deployer*.log" | while read -r file; do
        echo "  {";
        echo "    \\"fileName\\": \\"$(basename "$file")\\",";
        echo "    \\"fileContent\\": \\"$(sed ':a;N;$!ba;s/\\\\/\\\\\\\\/g;s/\\n/\\\\n/g;s/\\"/\\\\\\"/g' "$file")\\"";
        echo "  },";
      done | sed '$ s/,$//' &&
      echo "]"
    `;
      conn.exec(sshCommand, (err, stream) => {
        if (err) {
          console.error('Command execution error:', err);
          return res.status(500).send('Command execution failed');
        }

        stream.on('close', (code, signal) => {
          conn.end();
          res.status(200).json({ stdout });
        });

        stream.stdout.on('data', (data) => {
          stdout += data.toString(); // Capture the stdout data
        });

        stream.stderr.on('data', (data) => {
          stderr += data.toString(); // Capture the stderr data
        });
      });
    });

    conn.on('error', (err) => {
      console.error('SSH connection error:', err);
      res
        .status(500)
        .send(
          'SSH connection failed, Check connection details to TTM Environment'
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
