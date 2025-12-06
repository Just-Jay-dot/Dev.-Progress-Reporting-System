import React, { useState } from 'react';
import { marked } from 'marked';
import { speakText, stopTTS } from '../utils/ttsService';
import './ChatMessage.css';

function ChatMessage({ role, content, timestamp, messageId }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isReading, setIsReading] = useState(false);

  // Format timestamp to HH:MM only
  const formatTimestamp = (ts) => {
    try {
      const date = new Date(`2000-01-01 ${ts}`);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      }
      // If parsing fails, try to extract HH:MM from string
      const match = ts.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        const hours = match[1].padStart(2, '0');
        const minutes = match[2];
        return `${hours}:${minutes}`;
      }
      return ts;
    } catch {
      return ts;
    }
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const readAloud = async () => {
    if (isReading) {
      stopTTS();
      setIsReading(false);
      return;
    }
    
    setIsReading(true);
    
    // Extract text content from markdown/html
    let textContent = content;
    if (role === 'ai') {
      // Remove HTML tags for TTS
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = marked.parse(content);
      textContent = tempDiv.textContent || tempDiv.innerText || content;
    }
    
    await speakText(
      textContent,
      () => {
        // onStart - already set isReading
      },
      () => {
        setIsReading(false);
      }
    );
  };

  // Render markdown content
  const renderContent = () => {
    if (role === 'ai') {
      // Parse markdown for AI responses
      const html = marked.parse(content);
      return <div className="message-content-text" dangerouslySetInnerHTML={{ __html: html }} />;
    }
    return <div className="message-content-text">{content}</div>;
  };

  return (
    <div
      className={`chat-message ${role}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {renderContent()}
      {isHovered && (
        <div className="message-actions">
          <button
            className={`message-action-btn ${isCopying ? 'copied' : ''}`}
            onClick={copyMessage}
            title="Copy message"
          >
            <i className={`fa-solid ${isCopying ? 'fa-check' : 'fa-copy'}`}></i>
          </button>
          <button
            className={`message-action-btn ${isReading ? 'reading' : ''}`}
            onClick={readAloud}
            title={isReading ? 'Stop reading' : 'Read aloud'}
          >
            <i className={`fa-solid ${isReading ? 'fa-stop' : 'fa-volume-high'}`}></i>
          </button>
          <div className="message-timestamp">{formatTimestamp(timestamp)}</div>
        </div>
      )}
    </div>
  );
}

export default ChatMessage;

