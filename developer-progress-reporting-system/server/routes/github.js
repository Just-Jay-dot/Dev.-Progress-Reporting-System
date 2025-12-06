import express from 'express';
import axios from 'axios';

const router = express.Router();

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || 'http://localhost:8080/api/github/callback';

// Store user tokens (in production, use database)
const userTokens = new Map();

// Step 1: Initiate OAuth flow
router.get('/auth', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  req.session = req.session || {};
  req.session.githubState = state;
  
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=repo,read:user&state=${state}`;
  res.json({ authUrl, state });
});

// Step 2: Handle OAuth callback
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code missing' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_REDIRECT_URI
      },
      {
        headers: { Accept: 'application/json' }
      }
    );

    const { access_token } = tokenResponse.data;
    
    if (!access_token) {
      return res.status(400).json({ error: 'Failed to obtain access token' });
    }

    // Get user info
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${access_token}` }
    });

    const userId = userResponse.data.id.toString();
    userTokens.set(userId, access_token);

    // Redirect to frontend with token
    res.redirect(`http://localhost:8080/?github_token=${access_token}&github_user=${encodeURIComponent(userResponse.data.login)}`);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ error: 'OAuth authentication failed' });
  }
});

// Get repositories
router.get('/repos', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No access token provided' });
  }

  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `token ${token}` },
      params: {
        sort: 'updated',
        per_page: 100
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('GitHub API error:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Get repository details
router.get('/repos/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;
  const token = req.headers.authorization?.replace('Bearer ', '');

  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: token ? { Authorization: `token ${token}` } : {}
    });

    res.json(response.data);
  } catch (error) {
    console.error('GitHub API error:', error);
    res.status(500).json({ error: 'Failed to fetch repository' });
  }
});

// Create repository
router.post('/repos', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const { name, description, private: isPrivate } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'No access token provided' });
  }

  try {
    const response = await axios.post(
      'https://api.github.com/user/repos',
      {
        name,
        description,
        private: isPrivate || false
      },
      {
        headers: { Authorization: `token ${token}` }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('GitHub API error:', error);
    res.status(500).json({ error: 'Failed to create repository' });
  }
});

// Get branches
router.get('/repos/:owner/:repo/branches', async (req, res) => {
  const { owner, repo } = req.params;
  const token = req.headers.authorization?.replace('Bearer ', '');

  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      headers: token ? { Authorization: `token ${token}` } : {},
      params: { per_page: 100 }
    });

    res.json(response.data);
  } catch (error) {
    console.error('GitHub API error:', error);
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
});

// Get commits
router.get('/repos/:owner/:repo/commits', async (req, res) => {
  const { owner, repo } = req.params;
  const { sha, per_page = 30, page = 1 } = req.query;
  const token = req.headers.authorization?.replace('Bearer ', '');

  try {
    const params = { per_page, page };
    if (sha) params.sha = sha;

    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
      headers: token ? { Authorization: `token ${token}` } : {},
      params
    });

    // Get commit comments
    const commitsWithComments = await Promise.all(
      response.data.map(async (commit) => {
        try {
          const commentsResponse = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/commits/${commit.sha}/comments`,
            {
              headers: token ? { Authorization: `token ${token}` } : {}
            }
          );
          return {
            ...commit,
            comments: commentsResponse.data.length
          };
        } catch {
          return { ...commit, comments: 0 };
        }
      })
    );

    res.json(commitsWithComments);
  } catch (error) {
    console.error('GitHub API error:', error);
    res.status(500).json({ error: 'Failed to fetch commits' });
  }
});

// Get commit details
router.get('/repos/:owner/:repo/commits/:sha', async (req, res) => {
  const { owner, repo, sha } = req.params;
  const token = req.headers.authorization?.replace('Bearer ', '');

  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits/${sha}`, {
      headers: token ? { Authorization: `token ${token}` } : {}
    });

    res.json(response.data);
  } catch (error) {
    console.error('GitHub API error:', error);
    res.status(500).json({ error: 'Failed to fetch commit details' });
  }
});

export default router;

