import React, { useState, useEffect } from 'react';
import { fileAPI, connectWebSocket } from '../utils/api';
import { success, confirm } from '../utils/modal';
import './FileEditor.css';

function FileEditor({ filename, onClose }) {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadFile();
    
    // Connect WebSocket for auto-refresh
    const ws = connectWebSocket((data) => {
      if (data.type === 'file-changed' && data.file === filename) {
        loadFile();
      }
    });

    return () => {
      if (ws) ws.close();
    };
  }, [filename]);

  const loadFile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fileAPI.readFile(filename);
      setContent(data.content);
      setOriginalContent(data.content);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading file:', error);
      setError('Failed to load file: ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await fileAPI.writeFile(filename, content);
      setOriginalContent(content);
      setHasChanges(false);
      await success('File saved successfully!', 'Success');
    } catch (error) {
      console.error('Error saving file:', error);
      setError('Failed to save file: ' + (error.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setHasChanges(e.target.value !== originalContent);
  };

  const handleCancel = async () => {
    if (hasChanges) {
      const result = await confirm('You have unsaved changes. Are you sure you want to close?', 'Unsaved Changes');
      if (!result) {
        return;
      }
    }
    onClose();
  };

  if (loading) {
    return (
      <div className="file-editor-overlay">
        <div className="file-editor-container">
          <div className="file-editor-loading">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <p>Loading file...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="file-editor-overlay" onClick={handleCancel}>
      <div className="file-editor-container" onClick={(e) => e.stopPropagation()}>
        <div className="file-editor-header">
          <h2 className="file-editor-title">Edit {filename}</h2>
          <button className="file-editor-close" onClick={handleCancel}>
            <i className="fa-solid fa-times"></i>
          </button>
        </div>

        {error && (
          <div className="file-editor-error">
            {error}
          </div>
        )}

        <div className="file-editor-content">
          <textarea
            className="file-editor-textarea"
            value={content}
            onChange={handleContentChange}
            placeholder="File content..."
            spellCheck={false}
          />
        </div>

        <div className="file-editor-footer">
          <div className="file-editor-info">
            {hasChanges && (
              <span className="file-editor-unsaved">
                <i className="fa-solid fa-circle"></i> Unsaved changes
              </span>
            )}
          </div>
          <div className="file-editor-actions">
            <button 
              className="file-editor-cancel"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              className="file-editor-save"
              onClick={handleSave}
              disabled={saving || !hasChanges}
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-save"></i> Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FileEditor;

