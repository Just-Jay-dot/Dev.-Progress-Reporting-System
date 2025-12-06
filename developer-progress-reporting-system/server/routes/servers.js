import express from 'express';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const router = express.Router();
const execAsync = promisify(exec);

// Server uptime tracking (in production, use database)
const serverUptimes = new Map();

// Health check a server
async function checkServerHealth(url) {
  try {
    const startTime = Date.now();
    const response = await axios.get(url, { timeout: 5000 });
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'online',
      responseTime,
      statusCode: response.status,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'offline',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Check if port is open
async function checkPort(host, port) {
  try {
    const platform = os.platform();
    let command;
    
    if (platform === 'win32') {
      command = `netstat -an | findstr :${port}`;
    } else {
      command = `lsof -i :${port} || nc -z ${host} ${port}`;
    }
    
    await execAsync(command);
    return { open: true };
  } catch {
    return { open: false };
  }
}

// Get server status
router.get('/status', async (req, res) => {
  const { url, port } = req.query;
  
  if (!url && !port) {
    return res.status(400).json({ error: 'URL or port is required' });
  }
  
  try {
    let health;
    let portStatus;
    
    if (url) {
      health = await checkServerHealth(url);
    }
    
    if (port) {
      const host = url ? new URL(url).hostname : 'localhost';
      portStatus = await checkPort(host, parseInt(port));
    }
    
    res.json({
      health,
      port: portStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Server check error:', error);
    res.status(500).json({ error: 'Failed to check server status' });
  }
});

// Get server uptime
router.get('/uptime/:serverId', async (req, res) => {
  const { serverId } = req.params;
  const uptime = serverUptimes.get(serverId);
  
  if (!uptime) {
    return res.status(404).json({ error: 'Server uptime not found' });
  }
  
  const elapsed = Date.now() - uptime.startTime;
  const days = Math.floor(elapsed / 86400000);
  const hours = Math.floor((elapsed % 86400000) / 3600000);
  const minutes = Math.floor((elapsed % 3600000) / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  
  res.json({
    uptime: {
      days,
      hours,
      minutes,
      seconds,
      totalSeconds: Math.floor(elapsed / 1000)
    },
    startTime: uptime.startTime,
    lastCheck: new Date().toISOString()
  });
});

// Register server for uptime tracking
router.post('/register', (req, res) => {
  const { serverId, name, url, port } = req.body;
  
  if (!serverId) {
    return res.status(400).json({ error: 'Server ID is required' });
  }
  
  serverUptimes.set(serverId, {
    name,
    url,
    port,
    startTime: Date.now(),
    lastCheck: Date.now()
  });
  
  res.json({ success: true, message: 'Server registered for uptime tracking' });
});

// Get all registered servers
router.get('/list', (req, res) => {
  const servers = Array.from(serverUptimes.entries()).map(([id, data]) => ({
    id,
    ...data,
    uptime: {
      totalSeconds: Math.floor((Date.now() - data.startTime) / 1000)
    }
  }));
  
  res.json(servers);
});

// Batch health check
router.post('/health-check', async (req, res) => {
  const { servers } = req.body;
  
  if (!Array.isArray(servers)) {
    return res.status(400).json({ error: 'Servers array is required' });
  }
  
  const results = await Promise.all(
    servers.map(async (server) => {
      const health = await checkServerHealth(server.url);
      return {
        ...server,
        health,
        timestamp: new Date().toISOString()
      };
    })
  );
  
  res.json(results);
});

export default router;

