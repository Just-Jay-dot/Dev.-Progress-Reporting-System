import React, { useState, useEffect } from 'react';
import { githubAPI } from '../utils/api';
import './GitHub.css';

function GitHub() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [repoData, setRepoData] = useState(null);
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [branches, setBranches] = useState([]);
  const [commits, setCommits] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');
  const [isCommitsMaximized, setIsCommitsMaximized] = useState(false);
  const [showMaximizeButton, setShowMaximizeButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for GitHub token from OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('github_token');
    const user = urlParams.get('github_user');
    
    if (token) {
      localStorage.setItem('github_token', token);
      localStorage.setItem('github_user', user);
      setIsAuthenticated(true);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      loadRepos();
    } else {
      const storedToken = localStorage.getItem('github_token');
      if (storedToken) {
        setIsAuthenticated(true);
        loadRepos();
      }
    }
  }, []);

  useEffect(() => {
    if (selectedRepo) {
      loadRepoData();
    }
  }, [selectedRepo, selectedBranch]);

  const handleGitHubLogin = async () => {
    try {
      const { authUrl } = await githubAPI.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      console.error('GitHub login error:', error);
      setError('Failed to initiate GitHub login. Please check backend configuration.');
    }
  };

  const loadRepos = async () => {
    const token = localStorage.getItem('github_token');
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const reposList = await githubAPI.getRepos(token);
      setRepos(reposList);
      if (reposList.length > 0 && !selectedRepo) {
        setSelectedRepo(reposList[0]);
      }
    } catch (error) {
      console.error('Error loading repos:', error);
      setError('Failed to load repositories. Please check your token.');
    } finally {
      setLoading(false);
    }
  };

  const loadRepoData = async () => {
    if (!selectedRepo) return;

    const token = localStorage.getItem('github_token');
    setLoading(true);
    setError(null);

    try {
      // Load repo details
      const repo = await githubAPI.getRepo(selectedRepo.owner.login, selectedRepo.name, token);
      setRepoData(repo);

      // Load branches
      const branchesList = await githubAPI.getBranches(selectedRepo.owner.login, selectedRepo.name, token);
      setBranches(branchesList);

      // Load commits
      const sha = selectedBranch === 'all' ? null : selectedBranch;
      const commitsList = await githubAPI.getCommits(selectedRepo.owner.login, selectedRepo.name, sha, token);
      setCommits(commitsList);
    } catch (error) {
      console.error('Error loading repo data:', error);
      setError('Failed to load repository data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRepo = async () => {
    if (!newRepoName.trim()) return;

    const token = localStorage.getItem('github_token');
    if (!token) {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newRepo = await githubAPI.createRepo(token, newRepoName, newRepoDescription, false);
      setNewRepoName('');
      setNewRepoDescription('');
      setShowCreateRepo(false);
      await loadRepos();
      setSelectedRepo(newRepo);
    } catch (error) {
      console.error('Error creating repo:', error);
      setError('Failed to create repository. ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredCommits = selectedBranch === 'all' 
    ? commits 
    : commits.filter(c => c.commit?.message?.includes(selectedBranch) || false);

  return (
    <div className="content-section">
      <div className="github-container">
        {error && (
          <div className="github-error" style={{ padding: '1rem', background: 'var(--error)', color: 'white', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {!isAuthenticated ? (
          <div className="github-auth-section">
            <div className="github-auth-card">
              <i className="fa-brands fa-github github-auth-icon"></i>
              <h2 className="github-auth-title">Connect to GitHub</h2>
              <p className="github-auth-description">
                Connect your GitHub account to manage repositories, view commits, and track changes directly from the dashboard.
              </p>
              <button className="github-login-button" onClick={handleGitHubLogin} disabled={loading}>
                <i className="fa-brands fa-github"></i>
                {loading ? 'Connecting...' : 'Login with GitHub'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="github-header">
              <div className="github-header-content">
                <div className="github-repo-info">
                  <i className="fa-brands fa-github"></i>
                  <div>
                    {repos.length > 0 && (
                      <select 
                        value={selectedRepo?.id || ''} 
                        onChange={(e) => {
                          const repo = repos.find(r => r.id === parseInt(e.target.value));
                          setSelectedRepo(repo);
                        }}
                        className="github-repo-select"
                        style={{ 
                          background: 'var(--bg-secondary)', 
                          border: '1px solid var(--border)', 
                          borderRadius: '8px', 
                          padding: '0.5rem',
                          color: 'var(--text-primary)',
                          fontSize: '1rem',
                          marginBottom: '0.5rem'
                        }}
                      >
                        {repos.map(repo => (
                          <option key={repo.id} value={repo.id}>
                            {repo.full_name}
                          </option>
                        ))}
                      </select>
                    )}
                    <h1 className="github-repo-name">{repoData?.full_name || selectedRepo?.full_name || 'No repository'}</h1>
                    <p className="github-repo-description">{repoData?.description || selectedRepo?.description || ''}</p>
                  </div>
                </div>
                <button 
                  className="github-create-repo-button"
                  onClick={() => setShowCreateRepo(!showCreateRepo)}
                >
                  <i className="fa-solid fa-plus"></i>
                  Create Repository
                </button>
              </div>
            </div>

            {showCreateRepo && (
              <div className="github-create-repo-card">
                <h3 className="github-create-repo-title">Create New Repository</h3>
                <div className="github-create-repo-form">
                  <input
                    type="text"
                    placeholder="Repository name"
                    value={newRepoName}
                    onChange={(e) => setNewRepoName(e.target.value)}
                    className="github-repo-input"
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={newRepoDescription}
                    onChange={(e) => setNewRepoDescription(e.target.value)}
                    className="github-repo-input"
                  />
                  <div className="github-create-repo-actions">
                    <button 
                      className="github-cancel-button"
                      onClick={() => {
                        setShowCreateRepo(false);
                        setNewRepoName('');
                        setNewRepoDescription('');
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="github-create-button"
                      onClick={handleCreateRepo}
                      disabled={loading || !newRepoName.trim()}
                    >
                      {loading ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {repoData && (
              <>
                <div className="github-branches-section">
                  <h3 className="github-section-title">Branches</h3>
                  <div className="github-branches-list">
                    <button
                      className={`github-branch-item ${selectedBranch === 'all' ? 'active' : ''}`}
                      onClick={() => setSelectedBranch('all')}
                    >
                      <i className="fa-solid fa-code-branch"></i>
                      <span>All Branches</span>
                    </button>
                    {branches.map((branch, index) => (
                      <button
                        key={index}
                        className={`github-branch-item ${selectedBranch === branch.name ? 'active' : ''}`}
                        onClick={() => setSelectedBranch(branch.name)}
                      >
                        <i className="fa-solid fa-code-branch"></i>
                        <span>{branch.name}</span>
                        {branch.protected && (
                          <i className="fa-solid fa-lock" title="Protected branch"></i>
                        )}
                        <span className="github-branch-timestamp">
                          {formatTimestamp(branch.commit?.commit?.author?.date || new Date())}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div 
                  className="github-commits-section"
                  onMouseEnter={() => setShowMaximizeButton(true)}
                  onMouseLeave={() => setShowMaximizeButton(false)}
                >
                  <div className="github-commits-header">
                    <h3 className="github-section-title">Commits</h3>
                    <button 
                      className={`github-maximize-button ${showMaximizeButton ? 'visible' : ''}`}
                      onClick={() => setIsCommitsMaximized(!isCommitsMaximized)}
                      title={isCommitsMaximized ? 'Minimize' : 'Maximize'}
                    >
                      <i className={`fa-solid ${isCommitsMaximized ? 'fa-minimize' : 'fa-maximize'}`}></i>
                    </button>
                  </div>
                  <div className="github-commits-list">
                    {loading ? (
                      <div className="github-empty-state">
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <p>Loading commits...</p>
                      </div>
                    ) : filteredCommits.length > 0 ? (
                      filteredCommits.map((commit, index) => (
                        <div key={index} className="github-commit-item">
                          <div className="github-commit-header">
                            <div className="github-commit-sha">{commit.sha?.substring(0, 7) || 'N/A'}</div>
                            <div className="github-commit-branch">
                              <i className="fa-solid fa-code-branch"></i>
                              {selectedBranch === 'all' ? 'main' : selectedBranch}
                            </div>
                            <div className="github-commit-timestamp">
                              <i className="fa-regular fa-clock"></i>
                              {formatTimestamp(commit.commit?.author?.date || commit.commit?.committer?.date || new Date())}
                            </div>
                          </div>
                          <div className="github-commit-message">{commit.commit?.message || 'No message'}</div>
                          <div className="github-commit-footer">
                            <div className="github-commit-author">
                              <i className="fa-regular fa-user"></i>
                              {commit.commit?.author?.name || commit.author?.login || 'Unknown'}
                            </div>
                            {commit.comments > 0 && (
                              <div className="github-commit-comments">
                                <i className="fa-regular fa-comment"></i>
                                {commit.comments} {commit.comments === 1 ? 'comment' : 'comments'}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="github-empty-state">
                        <i className="fa-solid fa-inbox"></i>
                        <p>No commits found for this branch</p>
                      </div>
                    )}
                  </div>
                </div>

                {isCommitsMaximized && (
                  <div className="github-commits-modal-overlay" onClick={() => setIsCommitsMaximized(false)}>
                    <div 
                      className="github-commits-modal-content"
                      onClick={(e) => e.stopPropagation()}
                      onMouseEnter={() => setShowMaximizeButton(true)}
                      onMouseLeave={() => setShowMaximizeButton(false)}
                    >
                      <div className="github-commits-header">
                        <h3 className="github-section-title">Commits</h3>
                        <button 
                          className="github-maximize-button visible"
                          onClick={() => setIsCommitsMaximized(false)}
                          title="Minimize"
                        >
                          <i className="fa-solid fa-minimize"></i>
                        </button>
                      </div>
                      <div className="github-commits-list">
                        {filteredCommits.length > 0 ? (
                          filteredCommits.map((commit, index) => (
                            <div key={index} className="github-commit-item">
                              <div className="github-commit-header">
                                <div className="github-commit-sha">{commit.sha?.substring(0, 7) || 'N/A'}</div>
                                <div className="github-commit-branch">
                                  <i className="fa-solid fa-code-branch"></i>
                                  {selectedBranch === 'all' ? 'main' : selectedBranch}
                                </div>
                                <div className="github-commit-timestamp">
                                  <i className="fa-regular fa-clock"></i>
                                  {formatTimestamp(commit.commit?.author?.date || commit.commit?.committer?.date || new Date())}
                                </div>
                              </div>
                              <div className="github-commit-message">{commit.commit?.message || 'No message'}</div>
                              <div className="github-commit-footer">
                                <div className="github-commit-author">
                                  <i className="fa-regular fa-user"></i>
                                  {commit.commit?.author?.name || commit.author?.login || 'Unknown'}
                                </div>
                                {commit.comments > 0 && (
                                  <div className="github-commit-comments">
                                    <i className="fa-regular fa-comment"></i>
                                    {commit.comments} {commit.comments === 1 ? 'comment' : 'comments'}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="github-empty-state">
                            <i className="fa-solid fa-inbox"></i>
                            <p>No commits found for this branch</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default GitHub;
