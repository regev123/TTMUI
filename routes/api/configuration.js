const express = require('express');
const router = express.Router();
const config = require('config');
const path = require('path');
const fs = require('fs').promises; // Use fs.promises for cleaner async code
const { Client } = require('ssh2');

// Helper function to fetch configuration values
const getConfigurationValues = () => ({
  TTMhost: config.get('TTMhost'),
  TTMport: config.get('TTMport'),
  TTMusername: config.get('TTMusername'),
  TTMpassword: config.get('TTMpassword'),
  TTMHome: config.get('TTMHome'),
  TTMPackagerCommand: config.get('TTMPackagerCommand'),
  TTMDeployerCommand: config.get('TTMDeployerCommand'),
});

// @route    GET /api/configuration/getConfiguration
// @desc     TTM send all the configuration to the client
// @access   Public
router.get('/getConfiguration', (req, res) => {
  res.status(200).json(getConfigurationValues());
});

// Simplified route for getting specific config values
const getSingleConfig = (key) => async (req, res) => {
  try {
    res.status(200).json({ [key]: config.get(key) });
  } catch (error) {
    res.status(500).json({ error: `Failed to retrieve ${key}` });
  }
};

router.get('/getwsPackagerPort', getSingleConfig('wsPackagerPort'));
router.get('/getwsDeployerPort', getSingleConfig('wsDeployerPort'));

// Helper function for reading and updating config file
const updateConfigFile = async (newConfig) => {
  const configPath = path.join(__dirname, '../../config/default.json');
  try {
    const data = await fs.readFile(configPath, 'utf8');
    const configData = JSON.parse(data);

    // Merge new data with the existing configuration
    const updatedConfig = { ...configData, ...newConfig };

    // Write updated config back to the file
    await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2));
    return { message: 'Configuration updated successfully' };
  } catch (error) {
    throw new Error('Failed to update configuration file');
  }
};

// @route    POST /api/configuration/setConfiguration
// @desc     Update TTM configuration
// @access   Public
router.post('/setConfiguration', async (req, res) => {
  const formData = req.body;
  if (!formData || typeof formData !== 'object') {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  try {
    const result = await updateConfigFile(formData);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reusable function to execute SSH commands
const executeSSHCommand = (commands, res) => {
  const conn = new Client();
  conn.on('ready', () => {
    conn.exec(commands, (err, stream) => {
      if (err) {
        console.error('Command execution error:', err);
        return res.status(500).send('Command execution failed');
      }
      stream.on('close', () => conn.end());
      stream.stdout.on('data', (data) =>
        console.log('STDOUT:', data.toString())
      );
      stream.stderr.on('data', (data) =>
        console.error('STDERR:', data.toString())
      );
    });
  });

  conn.on('error', (err) => {
    console.error('SSH connection error:', err);
    res.status(500).send('SSH connection failed, check connection details');
  });

  conn.connect({
    host: config.get('TTMhost'),
    port: config.get('TTMport'),
    username: config.get('TTMusername'),
    password: config.get('TTMpassword'),
  });
};

// @route    POST /api/configuration/changeReportEmail
// @desc     Change the report email configuration
// @access   Public
router.post('/changeReportEmail', (req, res) => {
  const { EmailString } = req.body;
  if (!EmailString) {
    return res.status(400).json({ error: 'Email string is required' });
  }

  const execEmailString = `sed -i 's|^export MEC_EMAIL_LIST="[^"]*"|export MEC_EMAIL_LIST="${EmailString}"|' MEC.profile.ksh`;
  const execEmailCheckedString = `sed -i 's|^export EMAIL_ZIP_ATTACHED_REPORT=[^"]*|export EMAIL_ZIP_ATTACHED_REPORT=Y|' MEC.profile.ksh`;

  const commands = `cd ${config.get(
    'TTMHome'
  )}WORK_DIR/ && ${execEmailString} && ${execEmailCheckedString}`;
  executeSSHCommand(commands, res);
});

module.exports = router;
