import express from 'express';
import fs from 'fs-extra';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const router = express.Router();
const execAsync = promisify(exec);

// Get hosts file path based on OS
function getHostsFilePath() {
  const platform = os.platform();
  if (platform === 'win32') {
    return 'C:\\Windows\\System32\\drivers\\etc\\hosts';
  }
  return '/etc/hosts';
}

// Read hosts file
router.get('/entries', async (req, res) => {
  try {
    const hostsPath = getHostsFilePath();
    const content = await fs.readFile(hostsPath, 'utf-8');
    
    const entries = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 2) {
          const ip = parts[0];
          const domain = parts[1];
          entries.push({ ip, domain, enabled: true });
        }
      }
    }
    
    res.json(entries);
  } catch (error) {
    console.error('Error reading hosts file:', error);
    res.status(500).json({ error: 'Failed to read hosts file. Administrator privileges may be required.' });
  }
});

// Add DNS entry
router.post('/entries', async (req, res) => {
  const { domain, ip = '127.0.0.1' } = req.body;
  
  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  // Validate domain format
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!domainRegex.test(domain)) {
    return res.status(400).json({ error: 'Invalid domain format' });
  }

  // Validate IP format
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(ip)) {
    return res.status(400).json({ error: 'Invalid IP address format' });
  }

  try {
    const hostsPath = getHostsFilePath();
    
    // Backup hosts file
    const backupPath = `${hostsPath}.backup.${Date.now()}`;
    await fs.copyFile(hostsPath, backupPath);
    
    // Read current content
    const content = await fs.readFile(hostsPath, 'utf-8');
    
    // Check if entry already exists
    if (content.includes(domain)) {
      return res.status(400).json({ error: 'Domain entry already exists' });
    }
    
    // Add new entry
    const newEntry = `${ip}\t${domain}\n`;
    const newContent = content + newEntry;
    
    // Write to hosts file (requires admin privileges)
    const platform = os.platform();
    if (platform === 'win32') {
      // Windows: Use PowerShell with admin privileges
      await execAsync(`powershell -Command "Start-Process powershell -ArgumentList '-Command', 'Set-Content -Path \\\"${hostsPath}\\\" -Value \\\"${newContent.replace(/"/g, '\\"')}\\\"' -Verb RunAs"`);
    } else {
      // Unix/Linux/macOS: Use sudo
      await execAsync(`echo '${newContent.replace(/'/g, "'\\''")}' | sudo tee ${hostsPath} > /dev/null`);
    }
    
    res.json({ success: true, message: 'DNS entry added successfully' });
  } catch (error) {
    console.error('Error adding DNS entry:', error);
    res.status(500).json({ error: 'Failed to add DNS entry. Administrator privileges may be required.' });
  }
});

// Update DNS entry
router.put('/entries/:domain', async (req, res) => {
  const { domain } = req.params;
  const { ip, enabled } = req.body;
  
  try {
    const hostsPath = getHostsFilePath();
    const content = await fs.readFile(hostsPath, 'utf-8');
    const lines = content.split('\n');
    
    let found = false;
    const newLines = lines.map(line => {
      if (line.includes(domain) && !line.trim().startsWith('#')) {
        found = true;
        if (enabled === false) {
          return `# ${line}`; // Comment out to disable
        } else {
          return `${ip || '127.0.0.1'}\t${domain}`;
        }
      }
      return line;
    });
    
    if (!found) {
      return res.status(404).json({ error: 'DNS entry not found' });
    }
    
    // Write updated content
    const platform = os.platform();
    if (platform === 'win32') {
      await execAsync(`powershell -Command "Start-Process powershell -ArgumentList '-Command', 'Set-Content -Path \\\"${hostsPath}\\\" -Value \\\"${newLines.join('\n').replace(/"/g, '\\"')}\\\"' -Verb RunAs"`);
    } else {
      await execAsync(`echo '${newLines.join('\n').replace(/'/g, "'\\''")}' | sudo tee ${hostsPath} > /dev/null`);
    }
    
    res.json({ success: true, message: 'DNS entry updated successfully' });
  } catch (error) {
    console.error('Error updating DNS entry:', error);
    res.status(500).json({ error: 'Failed to update DNS entry. Administrator privileges may be required.' });
  }
});

// Delete DNS entry
router.delete('/entries/:domain', async (req, res) => {
  const { domain } = req.params;
  
  try {
    const hostsPath = getHostsFilePath();
    const content = await fs.readFile(hostsPath, 'utf-8');
    const lines = content.split('\n');
    
    const newLines = lines.filter(line => !line.includes(domain) || line.trim().startsWith('#'));
    
    // Write updated content
    const platform = os.platform();
    if (platform === 'win32') {
      await execAsync(`powershell -Command "Start-Process powershell -ArgumentList '-Command', 'Set-Content -Path \\\"${hostsPath}\\\" -Value \\\"${newLines.join('\n').replace(/"/g, '\\"')}\\\"' -Verb RunAs"`);
    } else {
      await execAsync(`echo '${newLines.join('\n').replace(/'/g, "'\\''")}' | sudo tee ${hostsPath} > /dev/null`);
    }
    
    res.json({ success: true, message: 'DNS entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting DNS entry:', error);
    res.status(500).json({ error: 'Failed to delete DNS entry. Administrator privileges may be required.' });
  }
});

// Test DNS resolution
router.post('/test', async (req, res) => {
  const { domain } = req.body;
  
  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }
  
  try {
    const { stdout } = await execAsync(`ping -c 1 ${domain} 2>&1 || ping -n 1 ${domain} 2>&1`);
    const resolved = stdout.includes('127.0.0.1') || stdout.includes('::1');
    res.json({ resolved, output: stdout });
  } catch (error) {
    res.json({ resolved: false, output: error.message });
  }
});

export default router;

