import express from 'express';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DOCS_DIR = join(__dirname, '..');

// Search across documentation files
router.post('/search', async (req, res) => {
  const { query, files = ['PROGRESS.md', 'BLUEPRINT.md', 'LOG.md'] } = req.body;
  
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const searchTerm = query.toLowerCase();
    const results = [];

    for (const filename of files) {
      try {
        const filePath = join(DOCS_DIR, filename);
        if (await fs.pathExists(filePath)) {
          const content = await fs.readFile(filePath, 'utf-8');
          const lines = content.split('\n');
          
          lines.forEach((line, index) => {
            if (line.toLowerCase().includes(searchTerm)) {
              results.push({
                file: filename,
                line: index + 1,
                content: line.trim(),
                match: line
              });
            }
          });
        }
      } catch (error) {
        console.error(`Error searching ${filename}:`, error);
      }
    }

    res.json({
      query,
      results,
      count: results.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;

