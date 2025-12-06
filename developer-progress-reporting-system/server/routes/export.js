import express from 'express';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DOCS_DIR = join(__dirname, '..');

// Export as JSON
router.get('/json/:filename', async (req, res) => {
  const { filename } = req.params;
  const allowedFiles = ['PROGRESS.md', 'BLUEPRINT.md', 'LOG.md'];
  
  if (!allowedFiles.includes(filename)) {
    return res.status(403).json({ error: 'File not allowed' });
  }

  try {
    const filePath = join(DOCS_DIR, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    
    const json = {
      filename,
      content,
      exportedAt: new Date().toISOString(),
      size: content.length
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename.replace('.md', '')}.json"`);
    res.json(json);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Export as HTML
router.get('/html/:filename', async (req, res) => {
  const { filename } = req.params;
  const allowedFiles = ['PROGRESS.md', 'BLUEPRINT.md', 'LOG.md'];
  
  if (!allowedFiles.includes(filename)) {
    return res.status(403).json({ error: 'File not allowed' });
  }

  try {
    const filePath = join(DOCS_DIR, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Simple markdown to HTML conversion (in production, use a proper library)
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${filename}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    pre { background: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    h1, h2, h3 { color: #333; }
    blockquote { border-left: 4px solid #ddd; padding-left: 20px; margin-left: 0; }
  </style>
</head>
<body>
  <h1>${filename}</h1>
  <p><em>Exported on ${new Date().toLocaleString()}</em></p>
  <hr>
  <pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</body>
</html>
    `.trim();
    
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${filename.replace('.md', '')}.html"`);
    res.send(html);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

export default router;

