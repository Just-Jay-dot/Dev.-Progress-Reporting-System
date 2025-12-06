import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { connectWebSocket } from '../utils/api';
import './CursorRules.css';

function CursorRules() {
  const [rules, setRules] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/.cursorrules');
      if (!response.ok) throw new Error('Failed to load file');
      const text = await response.text();
      setRules(text);
      
      // Render as markdown for better readability
      const html = marked.parse(text);
      setHtmlContent(html);
    } catch (error) {
      console.error('Error loading cursor rules:', error);
      setError('Failed to load cursor rules file. Please check if .cursorrules exists.');
      setRules('Error loading cursor rules file.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
    
    // Connect WebSocket for auto-refresh
    const ws = connectWebSocket((data) => {
      if (data.type === 'file-changed' && data.file === '.cursorrules') {
        loadRules();
      }
    });

    return () => {
      if (ws) ws.close();
    };
  }, []);

  return (
    <div className="content-section cursor-rules-section">
      <div className="cursor-rules-container">
        <h1 className="cursor-rules-title">Cursor Rules</h1>
        <div className="cursor-rules-content-wrapper">
          {loading ? (
            <div className="cursor-rules-loading">
              <i className="fa-solid fa-spinner fa-spin"></i>
              <p>Loading cursor rules...</p>
            </div>
          ) : error ? (
            <div className="cursor-rules-error">
              <i className="fa-solid fa-circle-exclamation"></i>
              <p>{error}</p>
            </div>
          ) : (
            <div 
              className="cursor-rules-content markdown-content" 
              dangerouslySetInnerHTML={{ __html: htmlContent }} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CursorRules;

