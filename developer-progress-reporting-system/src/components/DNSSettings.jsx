import React, { useState, useEffect } from 'react';
import { dnsAPI } from '../utils/api';
import { confirm, alert } from '../utils/modal';
import './DNSSettings.css';

function DNSSettings() {
  const [dnsEntries, setDnsEntries] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [formData, setFormData] = useState({ domain: '', ip: '127.0.0.1', port: '' });
  const [dnsStatus, setDnsStatus] = useState('unknown');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDNSEntries();
  }, []);

  const loadDNSEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const entries = await dnsAPI.getEntries();
      // Add port info from localStorage for display (ports aren't in /etc/hosts)
      const entriesWithPorts = entries.map(entry => {
        const stored = JSON.parse(localStorage.getItem('dns_entries') || '[]');
        const storedEntry = stored.find(e => e.domain === entry.domain);
        return { ...entry, port: storedEntry?.port || 8080 };
      });
      setDnsEntries(entriesWithPorts);
      setDnsStatus(entries.length > 0 ? 'configured' : 'not_configured');
    } catch (error) {
      console.error('Error loading DNS entries:', error);
      setError('Failed to load DNS entries. ' + (error.message || ''));
      // Fallback to localStorage
      const stored = localStorage.getItem('dns_entries');
      if (stored) {
        try {
          setDnsEntries(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing stored entries:', e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddDNS = async () => {
    if (!formData.domain) {
      setError('Domain is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await dnsAPI.addEntry(formData.domain, formData.ip);
      // Store port in localStorage (not in /etc/hosts)
      const stored = JSON.parse(localStorage.getItem('dns_entries') || '[]');
      stored.push({ domain: formData.domain, ip: formData.ip, port: parseInt(formData.port) || 8080, enabled: true });
      localStorage.setItem('dns_entries', JSON.stringify(stored));
      
      setFormData({ domain: '', ip: '127.0.0.1', port: '' });
      setShowAddForm(false);
      await loadDNSEntries();
    } catch (error) {
      console.error('Error adding DNS entry:', error);
      setError('Failed to add DNS entry. ' + (error.message || 'Administrator privileges may be required.'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditDNS = (entry) => {
    setEditingDomain(entry.domain);
    setFormData({ domain: entry.domain, ip: entry.ip, port: entry.port || '' });
    setShowAddForm(true);
  };

  const handleUpdateDNS = async () => {
    if (!formData.domain || editingDomain === null) return;

    setLoading(true);
    setError(null);

    try {
      await dnsAPI.updateEntry(editingDomain, formData.ip, true);
      // Update port in localStorage
      const stored = JSON.parse(localStorage.getItem('dns_entries') || '[]');
      const index = stored.findIndex(e => e.domain === editingDomain);
      if (index !== -1) {
        stored[index] = { ...stored[index], domain: formData.domain, ip: formData.ip, port: parseInt(formData.port) || stored[index].port };
      }
      localStorage.setItem('dns_entries', JSON.stringify(stored));
      
      setFormData({ domain: '', ip: '127.0.0.1', port: '' });
      setEditingDomain(null);
      setShowAddForm(false);
      await loadDNSEntries();
    } catch (error) {
      console.error('Error updating DNS entry:', error);
      setError('Failed to update DNS entry. ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDNS = async (domain) => {
    const result = await confirm(`Delete DNS entry for ${domain}?`, 'Delete DNS Entry');
    if (!result) return;

    setLoading(true);
    setError(null);

    try {
      await dnsAPI.deleteEntry(domain);
      // Remove from localStorage
      const stored = JSON.parse(localStorage.getItem('dns_entries') || '[]');
      const filtered = stored.filter(e => e.domain !== domain);
      localStorage.setItem('dns_entries', JSON.stringify(filtered));
      
      await loadDNSEntries();
    } catch (error) {
      console.error('Error deleting DNS entry:', error);
      setError('Failed to delete DNS entry. ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDNS = async (entry) => {
    setLoading(true);
    setError(null);

    try {
      await dnsAPI.updateEntry(entry.domain, entry.ip, !entry.enabled);
      await loadDNSEntries();
    } catch (error) {
      console.error('Error toggling DNS entry:', error);
      setError('Failed to toggle DNS entry. ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleTestDNS = async (domain) => {
    setLoading(true);
    setError(null);

    try {
      const result = await dnsAPI.testResolution(domain);
      const message = `DNS Test for ${domain}\n\nResolved: ${result.resolved ? 'Yes' : 'No'}\n\n${result.output}`;
      await alert(message, 'DNS Test Result', result.resolved ? 'success' : 'warning');
    } catch (error) {
      console.error('Error testing DNS:', error);
      setError('Failed to test DNS resolution.');
    } finally {
      setLoading(false);
    }
  };

  const servers = [
    {
      name: 'Progress Dashboard',
      url: dnsEntries.find(e => e.domain === 'flurr.progress') 
        ? `http://${dnsEntries.find(e => e.domain === 'flurr.progress').domain}:${dnsEntries.find(e => e.domain === 'flurr.progress').port}`
        : 'http://flurr.progress:8080',
      port: dnsEntries.find(e => e.domain === 'flurr.progress')?.port || 8080,
      status: 'online',
      type: 'frontend',
      icon: 'fa-solid fa-chart-line'
    },
    {
      name: 'Main Application (Frontend)',
      url: dnsEntries.find(e => e.domain === 'flurr.app')
        ? `http://${dnsEntries.find(e => e.domain === 'flurr.app').domain}:5173`
        : 'http://flurr.app:5173',
      port: 5173,
      status: 'online',
      type: 'frontend',
      icon: 'fa-solid fa-cube'
    },
    {
      name: 'Main Application (Production)',
      url: dnsEntries.find(e => e.domain === 'flurr.app')
        ? `http://${dnsEntries.find(e => e.domain === 'flurr.app').domain}:${dnsEntries.find(e => e.domain === 'flurr.app').port}`
        : 'http://flurr.app:3000',
      port: dnsEntries.find(e => e.domain === 'flurr.app')?.port || 3000,
      status: 'online',
      type: 'frontend',
      icon: 'fa-solid fa-rocket'
    }
  ];

  const [startTime] = useState(Date.now());
  const [uptime, setUptime] = useState('0s');

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const days = Math.floor(elapsed / 86400);
      const hours = Math.floor((elapsed % 86400) / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = elapsed % 60;
      
      let uptimeStr = '';
      if (days > 0) uptimeStr += `${days}d `;
      if (hours > 0) uptimeStr += `${hours}h `;
      if (minutes > 0) uptimeStr += `${minutes}m `;
      uptimeStr += `${seconds}s`;
      
      setUptime(uptimeStr.trim());
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="content-section">
      <div className="dns-settings-container">
        {error && (
          <div className="dns-error" style={{ padding: '1rem', background: 'var(--error)', color: 'white', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div className="dns-header">
          <div>
            <h1 className="dns-title">DNS Settings</h1>
            <p className="dns-description">Configure custom domain mappings for local development servers</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Note: DNS operations require administrator privileges. The backend will attempt to modify /etc/hosts (macOS/Linux) or hosts file (Windows).
            </p>
          </div>
          <div className="dns-status-badge">
            <span className={`dns-status-indicator ${dnsStatus === 'configured' ? 'active' : ''}`}></span>
            <span>{dnsStatus === 'configured' ? 'Configured' : 'Not Configured'}</span>
          </div>
        </div>

        <div className="dns-servers-section">
          <h3 className="dns-section-title">Server Status</h3>
          <div className="dns-servers-list">
            {servers.map((server, index) => (
              <div key={index} className="dns-server-item">
                <i className={`${server.icon} dns-server-icon`}></i>
                <span className={`dns-server-status ${server.status}`}></span>
                <span className="dns-server-name">{server.name}</span>
                <span className="dns-server-port">{server.port}</span>
                <span className="dns-server-url">{server.url}</span>
                <span className="dns-server-uptime">{uptime}</span>
                <a 
                  href={server.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="dns-server-link"
                  title={`Open ${server.name}`}
                >
                  <i className="fa-solid fa-external-link"></i>
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="dns-entries-section">
          <div className="dns-entries-header">
            <h3 className="dns-section-title">DNS Entries</h3>
            <button 
              className="dns-add-button"
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingIndex(null);
                setFormData({ domain: '', ip: '127.0.0.1', port: '' });
              }}
            >
              <i className="fa-solid fa-plus"></i>
              {showAddForm && editingIndex === null ? 'Cancel' : 'Add Entry'}
            </button>
          </div>

          {showAddForm && (
            <div className="dns-form-card">
              <h4 className="dns-form-title">
                {editingDomain !== null ? 'Edit DNS Entry' : 'Add New DNS Entry'}
              </h4>
              <div className="dns-form">
                <div className="dns-form-row">
                  <label>Domain</label>
                  <input
                    type="text"
                    placeholder="flurr.progress"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="dns-input"
                  />
                </div>
                <div className="dns-form-row">
                  <label>IP Address</label>
                  <input
                    type="text"
                    placeholder="127.0.0.1"
                    value={formData.ip}
                    onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                    className="dns-input"
                  />
                </div>
                <div className="dns-form-row">
                  <label>Port</label>
                  <input
                    type="number"
                    placeholder="8080"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    className="dns-input"
                  />
                </div>
                <div className="dns-form-actions">
                  <button 
                    className="dns-cancel-button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingDomain(null);
                      setFormData({ domain: '', ip: '127.0.0.1', port: '' });
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="dns-save-button"
                    onClick={editingDomain !== null ? handleUpdateDNS : handleAddDNS}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : (editingDomain !== null ? 'Update' : 'Add')}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="dns-entries-list">
            {loading && dnsEntries.length === 0 ? (
              <div className="dns-empty-state">
                <i className="fa-solid fa-spinner fa-spin"></i>
                <p>Loading DNS entries...</p>
              </div>
            ) : dnsEntries.length > 0 ? (
              dnsEntries.map((entry, index) => (
                <div key={index} className="dns-entry-item">
                  <div className="dns-entry-toggle">
                    <button
                      className={`dns-toggle-switch ${entry.enabled ? 'enabled' : ''}`}
                      onClick={() => handleToggleDNS(entry)}
                      title={entry.enabled ? 'Disable' : 'Enable'}
                      disabled={loading}
                    >
                      <span className="dns-toggle-slider"></span>
                    </button>
                  </div>
                  <div className="dns-entry-content">
                    <div className="dns-entry-domain">{entry.domain}</div>
                    <div className="dns-entry-mapping">
                      <span className="dns-entry-ip">{entry.ip}</span>
                      <i className="fa-solid fa-arrow-right"></i>
                      <span className="dns-entry-url">{entry.domain}:{entry.port || 8080}</span>
                    </div>
                  </div>
                  <div className="dns-entry-actions">
                    <button
                      className="dns-test-button"
                      onClick={() => handleTestDNS(entry.domain)}
                      title="Test DNS"
                      disabled={loading}
                    >
                      <i className="fa-solid fa-flask"></i>
                    </button>
                    <button
                      className="dns-edit-button"
                      onClick={() => handleEditDNS(entry)}
                      title="Edit"
                      disabled={loading}
                    >
                      <i className="fa-solid fa-pencil"></i>
                    </button>
                    <button
                      className="dns-delete-button"
                      onClick={() => handleDeleteDNS(entry.domain)}
                      title="Delete"
                      disabled={loading}
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="dns-empty-state">
                <i className="fa-solid fa-network-wired"></i>
                <p>No DNS entries configured</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DNSSettings;

