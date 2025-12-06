import React, { useState, useEffect } from 'react';
import { serverAPI } from '../utils/api';
import './ServerStatus.css';

function ServerStatus({ onSettingsClick }) {
  const [servers, setServers] = useState([
    {
      id: 'progress-dashboard',
      name: 'Progress Dashboard',
      url: 'http://flurr.progress:8080',
      port: 8080,
      status: 'unknown',
      type: 'frontend',
      icon: 'fa-solid fa-chart-line',
      responseTime: null
    },
    {
      id: 'main-frontend',
      name: 'Main Application (Frontend)',
      url: 'http://flurr.app:5173',
      port: 5173,
      status: 'unknown',
      type: 'frontend',
      icon: 'fa-solid fa-cube',
      responseTime: null
    },
    {
      id: 'main-prod',
      name: 'Main Application (Production)',
      url: 'http://flurr.app:3000',
      port: 3000,
      status: 'unknown',
      type: 'frontend',
      icon: 'fa-solid fa-rocket',
      responseTime: null
    },
    {
      id: 'backend-api',
      name: 'Backend API',
      url: 'http://localhost:3001',
      port: 3001,
      status: 'unknown',
      type: 'backend',
      icon: 'fa-solid fa-server',
      responseTime: null
    }
  ]);

  const [uptimes, setUptimes] = useState({});
  const [showSettingsButton, setShowSettingsButton] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Register servers and check health
    checkServerHealth();
    const interval = setInterval(checkServerHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const checkServerHealth = async () => {
    setLoading(true);
    try {
      const healthChecks = await Promise.all(
        servers.map(async (server) => {
          try {
            const health = await serverAPI.checkStatus(server.url, server.port);
            return {
              ...server,
              status: health.health?.status === 'online' ? 'online' : 'offline',
              responseTime: health.health?.responseTime || null
            };
          } catch (error) {
            return {
              ...server,
              status: 'offline',
              responseTime: null
            };
          }
        })
      );

      setServers(healthChecks);

      // Get uptimes
      const uptimePromises = servers.map(async (server) => {
        try {
          const uptime = await serverAPI.getUptime(server.id);
          return { id: server.id, uptime };
        } catch {
          return { id: server.id, uptime: null };
        }
      });

      const uptimeResults = await Promise.all(uptimePromises);
      const uptimeMap = {};
      uptimeResults.forEach(({ id, uptime }) => {
        if (uptime && uptime.uptime) {
          try {
            const { days, hours, minutes, seconds } = uptime.uptime;
            uptimeMap[id] = `${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;
          } catch (e) {
            // Handle missing uptime data gracefully
            uptimeMap[id] = 'N/A';
          }
        } else {
          uptimeMap[id] = 'N/A';
        }
      });
      setUptimes(uptimeMap);
    } catch (error) {
      console.error('Error checking server health:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (serverId) => {
    return uptimes[serverId] || '0s';
  };

  return (
    <div 
      className="server-status-container"
      onMouseEnter={() => setShowSettingsButton(true)}
      onMouseLeave={() => setShowSettingsButton(false)}
    >
      <div className="server-status-header">
        <h3 className="server-status-title">Server Status</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {loading && (
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}></i>
          )}
          {onSettingsClick && (
            <button 
              className={`server-status-settings-button ${showSettingsButton ? 'visible' : ''}`}
              onClick={onSettingsClick}
              title="DNS Settings"
            >
              <i className="fa-solid fa-gear"></i>
            </button>
          )}
        </div>
      </div>
      <div className="server-status-list">
        {servers.map((server, index) => (
          <div key={index} className="server-status-item">
            <i className={`${server.icon} server-icon`}></i>
            <span className={`server-status-indicator ${server.status}`}></span>
            <span className="server-name">{server.name}</span>
            <span className="server-port">{server.port}</span>
            <span className="server-url">{server.url}</span>
            {server.responseTime && (
              <span className="server-response-time" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {server.responseTime}ms
              </span>
            )}
            <span className="server-uptime">{formatUptime(server.id)}</span>
            <a 
              href={server.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="server-link-icon"
              title={`Open ${server.name}`}
            >
              <i className="fa-solid fa-external-link"></i>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ServerStatus;
