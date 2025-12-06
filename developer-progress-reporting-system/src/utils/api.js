const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// WebSocket connection for real-time updates
let ws = null;
let wsReconnectTimeout = null;

export function connectWebSocket(onMessage) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    return ws;
  }

  const wsUrl = (API_BASE_URL.replace('/api', '')).replace('http', 'ws');
  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('WebSocket connected');
    if (wsReconnectTimeout) {
      clearTimeout(wsReconnectTimeout);
      wsReconnectTimeout = null;
    }
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (onMessage) onMessage(data);
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket disconnected, reconnecting...');
    wsReconnectTimeout = setTimeout(() => {
      connectWebSocket(onMessage);
    }, 3000);
  };

  return ws;
}

// GitHub API
export const githubAPI = {
  async getAuthUrl() {
    const response = await fetch(`${API_BASE_URL}/github/auth`);
    return response.json();
  },

  async getRepos(token) {
    const response = await fetch(`${API_BASE_URL}/github/repos`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  },

  async getRepo(owner, repo, token) {
    const response = await fetch(`${API_BASE_URL}/github/repos/${owner}/${repo}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.json();
  },

  async createRepo(token, name, description, isPrivate) {
    const response = await fetch(`${API_BASE_URL}/github/repos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, description, private: isPrivate })
    });
    return response.json();
  },

  async getBranches(owner, repo, token) {
    const response = await fetch(`${API_BASE_URL}/github/repos/${owner}/${repo}/branches`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.json();
  },

  async getCommits(owner, repo, sha, token, page = 1) {
    const params = new URLSearchParams({ page, per_page: 30 });
    if (sha) params.append('sha', sha);
    
    const response = await fetch(`${API_BASE_URL}/github/repos/${owner}/${repo}/commits?${params}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.json();
  }
};

// DNS API
export const dnsAPI = {
  async getEntries() {
    const response = await fetch(`${API_BASE_URL}/dns/entries`);
    return response.json();
  },

  async addEntry(domain, ip) {
    const response = await fetch(`${API_BASE_URL}/dns/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, ip })
    });
    return response.json();
  },

  async updateEntry(domain, ip, enabled) {
    const response = await fetch(`${API_BASE_URL}/dns/entries/${domain}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, enabled })
    });
    return response.json();
  },

  async deleteEntry(domain) {
    const response = await fetch(`${API_BASE_URL}/dns/entries/${domain}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  async testResolution(domain) {
    const response = await fetch(`${API_BASE_URL}/dns/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain })
    });
    return response.json();
  }
};

// Server API
export const serverAPI = {
  async checkStatus(url, port) {
    const params = new URLSearchParams();
    if (url) params.append('url', url);
    if (port) params.append('port', port);
    
    const response = await fetch(`${API_BASE_URL}/servers/status?${params}`);
    return response.json();
  },

  async getUptime(serverId) {
    const response = await fetch(`${API_BASE_URL}/servers/uptime/${serverId}`);
    return response.json();
  },

  async registerServer(serverId, name, url, port) {
    const response = await fetch(`${API_BASE_URL}/servers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serverId, name, url, port })
    });
    return response.json();
  },

  async batchHealthCheck(servers) {
    const response = await fetch(`${API_BASE_URL}/servers/health-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ servers })
    });
    return response.json();
  }
};

// Stripe API
export const stripeAPI = {
  async createCheckoutSession(amount, currency = 'usd') {
    const response = await fetch(`${API_BASE_URL}/stripe/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency })
    });
    return response.json();
  },

  async verifySession(sessionId) {
    const response = await fetch(`${API_BASE_URL}/stripe/verify-session/${sessionId}`);
    return response.json();
  }
};

// File API
export const fileAPI = {
  async readFile(filename) {
    const response = await fetch(`${API_BASE_URL}/files/read/${filename}`);
    return response.json();
  },

  async writeFile(filename, content) {
    const response = await fetch(`${API_BASE_URL}/files/write/${filename}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    return response.json();
  },

  async listFiles() {
    const response = await fetch(`${API_BASE_URL}/files/list`);
    return response.json();
  }
};

// Search API
export const searchAPI = {
  async search(query, files = ['PROGRESS.md', 'BLUEPRINT.md', 'LOG.md']) {
    const response = await fetch(`${API_BASE_URL}/search/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, files })
    });
    return response.json();
  }
};

// Export API
export const exportAPI = {
  async exportJSON(filename) {
    const response = await fetch(`${API_BASE_URL}/export/json/${filename}`);
    return response.blob();
  },

  async exportHTML(filename) {
    const response = await fetch(`${API_BASE_URL}/export/html/${filename}`);
    return response.blob();
  }
};

