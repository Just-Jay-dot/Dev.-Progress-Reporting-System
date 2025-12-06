import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import chokidar from 'chokidar';
import fs from 'fs-extra';
import { exec } from 'child_process';
import { promisify } from 'util';

import githubRoutes from './routes/github.js';
import dnsRoutes from './routes/dns.js';
import serverRoutes from './routes/servers.js';
import stripeRoutes from './routes/stripe.js';
import fileRoutes from './routes/files.js';
import searchRoutes from './routes/search.js';
import exportRoutes from './routes/export.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;
const DOCS_DIR = join(__dirname, '..');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(DOCS_DIR, 'dist')));

// WebSocket clients
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('WebSocket client connected');

  ws.on('close', () => {
    clients.delete(ws);
    console.log('WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Broadcast to all clients
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(message);
    }
  });
}

// File watcher for auto-updates
const watchedFiles = [
  join(DOCS_DIR, 'PROGRESS.md'),
  join(DOCS_DIR, 'BLUEPRINT.md'),
  join(DOCS_DIR, 'LOG.md')
];

const watcher = chokidar.watch(watchedFiles, {
  persistent: true,
  ignoreInitial: true
});

watcher.on('change', (path) => {
  console.log(`File changed: ${path}`);
  const filename = path.split('/').pop();
  broadcast({
    type: 'file-changed',
    file: filename,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/github', githubRoutes);
app.use('/api/dns', dnsRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/export', exportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📁 Watching files in: ${DOCS_DIR}`);
});

