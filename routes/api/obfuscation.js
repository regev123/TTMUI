const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const loadConfigFile = require('../../utils/getConfigurationFile');
const linuxConnectionClient = require('../../utils/linuxConnectionClient');
const Client = require('ssh2-sftp-client');

router.post('/createObfuscationInputFile', async (req, res) => {
  try {
    const configData = await loadConfigFile();
    const TTMHome = configData.configData.TTMHome;
    const { encryptionKey, clients } = req.body;
    const filePath = path.join(process.cwd(), 'input.yaml');
    let content = `encryption_key : ${encryptionKey}\n\n`;
    content +=
      'extension:\n\n-   old_ext : yaml\n\n    new_ext : obsymll\n\n-   old_ext : json\n\n    new_ext : obsjsnn\n\n-   old_ext : ppt\n\n    new_ext : obsppt\n\n-   old_ext : xml\n\n    new_ext : obsxml\n\n-   old_ext : properties\n\n    new_ext : obsprp\n\ninput_files:\n\n';
    clients.forEach((client) => {
      content += `-   isDir : false\n\n    input : ${TTMHome}WORK_DIR/MEC.profile.${client}.properties\n    output: ${TTMHome}WORK_DIR/MEC.profile.${client}.obsprp\n\n`;
    });
    fs.writeFile(filePath, content, (err) => {
      if (err) {
        console.error('Error writing file:', err);
      }
      console.log('input.yaml File created successfully at:', filePath);
    });
    res.status(200).json('File created successfully');
  } catch (error) {
    console.error('Error during file create process:', error);
    res.status(500).json({ error: 'Failed to create file ' });
  }
});

router.post('/copyObfuscationInputFileToEnvironment', async (req, res) => {
  try {
    const configData = await loadConfigFile();
    const { TTMusername, TTMpassword, TTMhost, TTMHome } =
      configData.configData;

    const filePath = path.join(process.cwd(), 'input.yaml');
    const targetFilePath = `${TTMHome}core/sharedFiles/Obfuscation/`;

    const sftp = new Client();

    await sftp.connect({
      host: TTMhost,
      port: 22,
      username: TTMusername,
      password: TTMpassword,
    });

    await sftp.mkdir(targetFilePath, true);

    const remoteFilePath = path.posix.join(
      targetFilePath,
      path.basename(filePath)
    );

    await sftp.put(filePath, remoteFilePath);

    sftp.end();

    res.status(200).json('File created successfully');
  } catch (error) {
    console.error('Error during file copy process:', error);
    res.status(500).json({ error: 'Failed to copy file to environment' });
  }
});

router.post('/removeObfuscationInputFileFromEnvironment', async (req, res) => {
  const configData = await loadConfigFile();
  const TTMHome = configData.configData.TTMHome;
  const command = `rm -f ${TTMHome}core/sharedFiles/Obfuscation/input.yaml`;
  const responseObject = await linuxConnectionClient(command);
  if (responseObject.code !== 0)
    return res.status(500).send(responseObject.stderr);
  res.status(200).json('File removed successfully');
});

router.post('/obfuscateEnvironment', async (req, res) => {
  const configData = await loadConfigFile();
  const TTMHome = configData.configData.TTMHome;
  const command = `cd ${TTMHome} && source ~/.profile && cd ${TTMHome}scripts/ && ./obfuscationCLI.sh -op obfuscate --input_file ${TTMHome}core/sharedFiles/Obfuscation/input.yaml`;
  const responseObject = await linuxConnectionClient(command);
  if (responseObject.code !== 0)
    return res.status(500).send(responseObject.stderr);
  res.status(200).json('File created successfully');
});

router.post('/deobfuscateEnvironment', async (req, res) => {
  const configData = await loadConfigFile();
  const TTMHome = configData.configData.TTMHome;
  const command = `cd ${TTMHome} && source ~/.profile && cd ${TTMHome}scripts/ && ./obfuscationCLI.sh -op deobfuscate --input_file ${TTMHome}core/sharedFiles/Obfuscation/input.yaml`;
  const responseObject = await linuxConnectionClient(command);
  if (responseObject.code !== 0)
    return res.status(500).send(responseObject.stderr);
  res.status(200).json('File created successfully');
});

module.exports = router;
