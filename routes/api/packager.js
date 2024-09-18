const { Client } = require('ssh2');
const config = require('config');
const express = require('express');
const router = express.Router();
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store WebSocket connections
const clients = new Set();

// WebSocket connection and events
wss.on('connection', (ws) => {
  console.log('WebSocket connection established');
  clients.add(ws);

  ws.on('message', (message) => console.log('Received:', message));

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    clients.delete(ws);
  });

  ws.on('error', (error) => console.error('WebSocket error:', error));
});

// Broadcast message to WebSocket clients
const broadcastToClients = (message) => {
  const data = JSON.stringify({ stdout: message });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// Abstract SSH connection logic
const executeSSHCommand = (conn, command, stdout, res) => {
  conn.exec(command, (err, stream) => {
    if (err) {
      console.error('Command execution error:', err);
      return res.status(500).send('Command execution failed');
    }

    stream.on('close', () => {
      conn.end();
      const hasSucceeded = stdout.some((str) =>
        str.includes('MEC-Packager Finish Successfully (Status=0)')
      );
      if (hasSucceeded) res.status(200).json('Packager Succeeded');
      else res.status(400).json('Packager Failed');
    });

    stream.stdout.on('data', (data) => {
      const output = data.toString();
      stdout.push(output);
      broadcastToClients(output);
    });

    stream.stderr.on('data', (data) => {
      const output = data.toString();
      stdout.push(output);
      broadcastToClients(output);
    });
  });
};

// @route    POST api/packager/runPackager
// @desc     TTM run the packager job
// @access   Public
router.post('/runPackager', async (req, res) => {
  const activeClientsString = req.body;
  let stdout = [];

  try {
    const conn = new Client();
    const ttmHome = config.get('TTMHome');
    const ttmPackagerCommand = config.get('TTMPackagerCommand');
    const execClientsString = `sed -i 's|^export PRODUCTS_LIST="[^"]*"|export PRODUCTS_LIST="${activeClientsString.activeClientsString}"|' MEC.profile.ksh`;

    conn.on('ready', () => {
      console.log('SSH Client :: ready');
      const command = `cd ${ttmHome}WORK_DIR/ && ${execClientsString} && cd ${ttmHome}packager/ && ${ttmPackagerCommand}`;
      executeSSHCommand(conn, command, stdout, res);
    });

    conn.on('error', (err) => {
      console.error('SSH connection error:', err);
      res
        .status(500)
        .send(
          'SSH connection failed, check connection details to TTM Environment'
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

server.listen(config.get('wsPackagerPort'), () => {
  console.log(`Server is listening on port ${config.get('wsPackagerPort')}`);
});

module.exports = router;
