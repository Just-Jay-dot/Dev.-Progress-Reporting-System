import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import mermaid from 'mermaid';
import { connectWebSocket, exportAPI } from '../utils/api';
import { error } from '../utils/modal';
import FileEditor from './FileEditor';
import './Blueprint.css';

function Blueprint() {
  const [content, setContent] = useState('<div class="loading">Loading blueprint...</div>');
  const [showEditor, setShowEditor] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadBlueprint();
    
    // Connect WebSocket for auto-refresh
    const ws = connectWebSocket((data) => {
      if (data.type === 'file-changed' && data.file === 'BLUEPRINT.md') {
        loadBlueprint();
      }
    });

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const loadBlueprint = async () => {
    try {
      const response = await fetch('/BLUEPRINT.md');
      if (!response.ok) throw new Error('Failed to load file');
      const markdown = await response.text();
      
      let html = marked.parse(markdown);
      html = html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, (match, content) => {
        const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
        return `<div class="mermaid" id="${id}">${content.trim()}</div>`;
      });
      
      setContent(html);
      
      setTimeout(() => {
        mermaid.initialize({ 
          startOnLoad: true,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#888888',
            primaryTextColor: '#e0e0e0',
            primaryBorderColor: '#3a3a3a',
            lineColor: '#888888',
            secondaryColor: '#242424',
            tertiaryColor: '#2d2d2d'
          }
        });
        mermaid.run();
      }, 100);
    } catch (error) {
      setContent(`<div style="padding: 2rem; color: var(--error);">Error loading BLUEPRINT.md: ${error.message}</div>`);
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const blob = format === 'json' 
        ? await exportAPI.exportJSON('BLUEPRINT.md')
        : await exportAPI.exportHTML('BLUEPRINT.md');
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BLUEPRINT.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      await error('Failed to export file', 'Export Error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="content-section">
      <div className="markdown-header">
        <h1 className="markdown-title">Blueprint</h1>
        <div className="markdown-actions">
          <button 
            className="markdown-action-button"
            onClick={() => setShowEditor(true)}
            title="Edit"
          >
            <i className="fa-solid fa-pencil"></i>
            Edit
          </button>
          <button 
            className="markdown-action-button"
            onClick={() => handleExport('json')}
            disabled={exporting}
            title="Export as JSON"
          >
            <i className="fa-solid fa-download"></i>
            {exporting ? 'Exporting...' : 'Export JSON'}
          </button>
          <button 
            className="markdown-action-button"
            onClick={() => handleExport('html')}
            disabled={exporting}
            title="Export as HTML"
          >
            <i className="fa-solid fa-download"></i>
            {exporting ? 'Exporting...' : 'Export HTML'}
          </button>
        </div>
      </div>
      <div className="markdown-container">
        <div className="markdown-content-wrapper">
          <div className="markdown-content" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </div>
      {showEditor && (
        <FileEditor filename="BLUEPRINT.md" onClose={() => {
          setShowEditor(false);
          loadBlueprint();
        }} />
      )}
    </div>
  );
}

export default Blueprint;

