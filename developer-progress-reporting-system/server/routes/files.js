import express from 'express';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DOCS_DIR = join(__dirname, '..');

// Read file
router.get('/read/:filename', async (req, res) => {
  const { filename } = req.params;
  const allowedFiles = ['PROGRESS.md', 'BLUEPRINT.md', 'LOG.md', '.cursorrules'];
  
  if (!allowedFiles.includes(filename)) {
    return res.status(403).json({ error: 'File not allowed' });
  }

  try {
    const filePath = join(DOCS_DIR, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    res.json({ content, filename, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// Write file
router.post('/write/:filename', async (req, res) => {
  const { filename } = req.params;
  const { content } = req.body;
  const allowedFiles = ['PROGRESS.md', 'BLUEPRINT.md', 'LOG.md'];
  
  if (!allowedFiles.includes(filename)) {
    return res.status(403).json({ error: 'File not allowed' });
  }

  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Content must be a string' });
  }

  try {
    const filePath = join(DOCS_DIR, filename);
    
    // Create backup
    const backupPath = `${filePath}.backup.${Date.now()}`;
    if (await fs.pathExists(filePath)) {
      await fs.copyFile(filePath, backupPath);
    }
    
    // Write new content
    await fs.writeFile(filePath, content, 'utf-8');
    
    res.json({ success: true, message: 'File saved successfully', backupPath });
  } catch (error) {
    console.error('Error writing file:', error);
    res.status(500).json({ error: 'Failed to write file' });
  }
});

// List files
router.get('/list', async (req, res) => {
  try {
    const files = await fs.readdir(DOCS_DIR);
    const markdownFiles = files.filter(f => f.endsWith('.md'));
    
    const fileList = await Promise.all(
      markdownFiles.map(async (filename) => {
        const filePath = join(DOCS_DIR, filename);
        const stats = await fs.stat(filePath);
        return {
          filename,
          size: stats.size,
          modified: stats.mtime.toISOString()
        };
      })
    );
    
    res.json(fileList);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

export default router;

