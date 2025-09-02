const express = require('express');
const config = require('config');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const clients = require('./utils/websocketClients');
const { exec } = require('child_process');

const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  clients.add(ws);

  ws.on('close', () => {
    clients.delete(ws);
  });

  ws.on('error', (error) => console.error('WebSocket error:', error));
});

const hostname = config.get('hostname');
const port = config.get('port');

app.use(cors());

app.use(express.static(path.join(__dirname, 'client/build/')));
app.use(express.json());

// Register API routes
app.use('/api/packagerDeployer', require('./routes/api/packagerDeployer'));
app.use('/api/configuration', require('./routes/api/configuration'));
app.use('/api/installation', require('./routes/api/installation'));
app.use('/api/util', require('./routes/api/util'));
app.use('/api/history', require('./routes/api/history'));
app.use(
  '/api/environmentValidation',
  require('./routes/api/environmentValidation')
);
app.use('/api/validation', require('./routes/api/validation'));
app.use('/api/obfuscation', require('./routes/api/obfuscation'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

server.listen(port, hostname, () => {
  console.log(`Server and WebSocket listening on port ${port}`);

  // for Production: Open the app in the default browser after the server starts
  // const url = `http://localhost:${port}/`;
  // exec(`start ${url}`);
});
