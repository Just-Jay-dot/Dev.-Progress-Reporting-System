import React, { useState } from 'react';
import { searchAPI } from '../utils/api';
import './Search.css';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState(['PROGRESS.md', 'BLUEPRINT.md', 'LOG.md']);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await searchAPI.search(query, selectedFiles);
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleFile = (filename) => {
    setSelectedFiles(prev => 
      prev.includes(filename)
        ? prev.filter(f => f !== filename)
        : [...prev, filename]
    );
  };

  const highlightMatch = (text, query) => {
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="content-section">
      <div className="search-container">
        <div className="search-header">
          <h1 className="search-title">Search Documentation</h1>
          <p className="search-description">Search across all documentation files</p>
        </div>

        <div className="search-input-section">
          <div className="search-input-wrapper">
            <i className="fa-solid fa-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Enter search query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button 
              className="search-button"
              onClick={handleSearch}
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : (
                <i className="fa-solid fa-search"></i>
              )}
              Search
            </button>
          </div>

          <div className="search-files-selector">
            <label className="search-files-label">Search in:</label>
            <div className="search-files-checkboxes">
              {['PROGRESS.md', 'BLUEPRINT.md', 'LOG.md'].map(filename => (
                <label key={filename} className="search-file-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(filename)}
                    onChange={() => toggleFile(filename)}
                  />
                  <span>{filename}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {results.length > 0 && (
          <div className="search-results">
            <div className="search-results-header">
              <h3 className="search-results-title">
                Found {results.length} result{results.length !== 1 ? 's' : ''}
              </h3>
            </div>
            <div className="search-results-list">
              {results.map((result, index) => (
                <div key={index} className="search-result-item">
                  <div className="search-result-header">
                    <span className="search-result-file">{result.file}</span>
                    <span className="search-result-line">Line {result.line}</span>
                  </div>
                  <div className="search-result-content">
                    {highlightMatch(result.content, query)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {query && !loading && results.length === 0 && (
          <div className="search-empty">
            <i className="fa-solid fa-inbox"></i>
            <p>No results found for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;

