import React, { useState, useEffect } from 'react';
import { connectWebSocket } from '../utils/api';
import './ActivityLog.css';

function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/LOG.md');
      if (!response.ok) throw new Error('Failed to load file');
      const markdown = await response.text();
      
      const logEntries = [];
      // Enhanced regex to handle multiple formats
      const logRegex = /###\s*(\d{4}-\d{2}-\d{2}[\s:]?\d{2}:\d{2}:\d{2})\s*\n\*\*Type\*\*:\s*(\w+)\s*\n\*\*Action\*\*:\s*(.+?)\s*\n\*\*Details\*\*:\s*(.+?)(?=\n###|\n*$)/gs;
      let match;
      
      while ((match = logRegex.exec(markdown)) !== null) {
        logEntries.push({
          timestamp: match[1].trim(),
          type: match[2].toLowerCase().trim(),
          action: match[3].trim(),
          details: match[4].trim()
        });
      }
      
      // Fallback: try simpler format if no matches
      if (logEntries.length === 0) {
        const simpleRegex = /###\s*(.+?)\n\*\*Type\*\*:\s*(\w+)\n\*\*Action\*\*:\s*(.+?)\n\*\*Details\*\*:\s*(.+?)(?=\n###|$)/gs;
        let simpleMatch;
        while ((simpleMatch = simpleRegex.exec(markdown)) !== null) {
          logEntries.push({
            timestamp: simpleMatch[1].trim(),
            type: simpleMatch[2].toLowerCase().trim(),
            action: simpleMatch[3].trim(),
            details: simpleMatch[4].trim()
          });
        }
      }
      
      setLogs(logEntries);
    } catch (error) {
      console.error('Error loading logs:', error);
      setError('Failed to load activity log. Please check if LOG.md exists.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    
    // Connect WebSocket for auto-refresh
    const ws = connectWebSocket((data) => {
      if (data.type === 'file-changed' && data.file === 'LOG.md') {
        loadLogs();
      }
    });

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const typeIcons = {
    feature: 'fa-solid fa-star',
    documentation: 'fa-solid fa-file-lines',
    enhancement: 'fa-solid fa-wand-magic-sparkles',
    organization: 'fa-solid fa-folder-tree',
    integration: 'fa-solid fa-puzzle-piece',
    rebranding: 'fa-solid fa-palette'
  };

  return (
    <div className="content-section">
      <div className="log-container">
        {loading ? (
          <div className="log-loading">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <p>Loading activity log...</p>
          </div>
        ) : error ? (
          <div className="log-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            <p>{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="log-empty">
            <i className="fa-solid fa-inbox"></i>
            <p>No activity logs found. Start working on your project to see activity here.</p>
          </div>
        ) : (
          logs.map((entry, index) => {
            const icon = typeIcons[entry.type] || 'fa-solid fa-circle';
            return (
              <div key={index} className="log-entry">
                <div className={`log-icon ${entry.type}`}>
                  <i className={icon}></i>
                </div>
                <div className="log-content">
                  <div className="log-header">
                    <span className={`log-type ${entry.type}`}>{entry.type}</span>
                    <span className="log-action">{entry.action}</span>
                  </div>
                  <div className="log-timestamp">{entry.timestamp}</div>
                  <div className="log-details">{entry.details}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ActivityLog;

