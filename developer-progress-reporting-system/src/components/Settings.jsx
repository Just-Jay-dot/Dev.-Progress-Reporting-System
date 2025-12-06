import React, { useState, useEffect } from 'react';
import './Settings.css';

function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [tokenUsage, setTokenUsage] = useState(0);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    // Load saved API key (check for encrypted version first)
    let savedKey = null;
    if (localStorage.getItem('gemini_api_key_secure') === 'true') {
      try {
        const encoded = localStorage.getItem('gemini_api_key_enc');
        if (encoded) {
          savedKey = atob(encoded);
        }
      } catch (error) {
        console.error('Error decoding API key:', error);
        // Fallback to plain storage
        savedKey = localStorage.getItem('gemini_api_key');
      }
    } else {
      savedKey = localStorage.getItem('gemini_api_key');
    }
    
    const savedTokens = parseInt(localStorage.getItem('token_usage') || '0');
    if (savedKey) setApiKey(savedKey);
    setTokenUsage(savedTokens);

    // Listen for token usage updates
    const handleStorageChange = () => {
      const tokens = parseInt(localStorage.getItem('token_usage') || '0');
      setTokenUsage(tokens);
    };

    window.addEventListener('storage', handleStorageChange);
    // Also check periodically for updates from same window
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleApiKeyChange = async (e) => {
    const key = e.target.value;
    setApiKey(key);
    setIsValid(false);
    setValidationError(null);
    
    // Encrypt and store API key securely
    if (key) {
      try {
        // Simple obfuscation (not true encryption, but better than plain text)
        const encoded = btoa(key);
        localStorage.setItem('gemini_api_key_enc', encoded);
        // Also store a flag to indicate encryption
        localStorage.setItem('gemini_api_key_secure', 'true');
        
        // Validate API key (with debounce)
        if (key.length > 20) {
          setIsValidating(true);
          const result = await validateApiKey(key);
          setIsValid(result.valid);
          if (!result.valid && result.error) {
            setValidationError(result.error);
          } else {
            setValidationError(null);
          }
          setIsValidating(false);
        }
      } catch (error) {
        console.error('Error storing API key:', error);
        setValidationError(error.message || 'Validation failed');
        setIsValidating(false);
        // Fallback to plain storage if encoding fails
        localStorage.setItem('gemini_api_key', key);
      }
    } else {
      localStorage.removeItem('gemini_api_key_enc');
      localStorage.removeItem('gemini_api_key_secure');
      localStorage.removeItem('gemini_api_key');
      setValidationError(null);
    }
  };

  const handleTestKey = async () => {
    if (!apiKey || apiKey.length < 20) {
      setValidationError('API key is too short');
      return;
    }
    
    setIsValidating(true);
    setValidationError(null);
    setIsValid(false);
    
    const result = await validateApiKey(apiKey);
    setIsValid(result.valid);
    if (!result.valid && result.error) {
      setValidationError(result.error);
    } else if (result.valid) {
      setValidationError(null);
    }
    setIsValidating(false);
  };

  const validateApiKey = async (key) => {
    try {
      const { validateGeminiApiKey } = await import('../utils/apiKeyValidator');
      const result = await validateGeminiApiKey(key);
      return result;
    } catch (error) {
      console.error('Validation error:', error);
      return {
        valid: false,
        error: error.message || 'Validation failed'
      };
    }
  };

  return (
    <div className="content-section">
      <div className="settings-section">
        <h2 className="settings-title">Settings</h2>
        
        <div className="settings-group">
          <label className="settings-label">
            <i className="fa-solid fa-key"></i> Gemini API Key
          </label>
          <div className="settings-input-wrapper">
            <input 
              type={showApiKey ? "text" : "password"}
              className="settings-input" 
              value={apiKey}
              onChange={handleApiKeyChange}
              placeholder="Enter your Gemini API key"
            />
            <button
              className="settings-toggle-btn"
              onClick={() => setShowApiKey(!showApiKey)}
              type="button"
              title={showApiKey ? "Hide API key" : "Show API key"}
            >
              <i className={`fa-solid ${showApiKey ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
            {apiKey && (
              <>
                <div className="settings-validation">
                  {isValidating ? (
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  ) : isValid ? (
                    <i className="fa-solid fa-check-circle" style={{ color: 'var(--success)' }} title="API key is valid"></i>
                  ) : (
                    <i className="fa-solid fa-times-circle" style={{ color: 'var(--error)' }} title="API key validation failed"></i>
                  )}
                </div>
                <button
                  className="settings-test-btn"
                  onClick={handleTestKey}
                  type="button"
                  disabled={isValidating || !apiKey || apiKey.length < 20}
                  title="Test API key"
                >
                  <i className="fa-solid fa-flask"></i>
                  Test
                </button>
              </>
            )}
          </div>
          {validationError && (
            <div className="settings-error" style={{ 
              marginTop: '0.5rem', 
              padding: '0.75rem', 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: 'var(--error)'
            }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '0.5rem' }}></i>
              {validationError}
            </div>
          )}
          <div className="token-usage">
            <div>
              <div className="token-count">{tokenUsage.toLocaleString()}</div>
              <div className="token-label">Total Tokens Used</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

