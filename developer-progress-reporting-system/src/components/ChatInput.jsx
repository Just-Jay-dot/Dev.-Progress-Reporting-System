import React, { useState, useRef, useEffect } from 'react';
import { error } from '../utils/modal';
import { initSpeechRecognition, startRecognition, stopRecognition } from '../utils/sttService';
import './ChatInput.css';

function ChatInput({ onSend, onVoiceInput, onLiveSpeaking, disabled, messages = [] }) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLiveSpeaking, setIsLiveSpeaking] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentMode, setCurrentMode] = useState('default');
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);

  // Initialize speech recognition with enhanced STT
  useEffect(() => {
    try {
      // Make messages available for STT context
      window.chatMessages = messages;
      
      const recognition = initSpeechRecognition(
        async (processedText) => {
          setIsRecording(false);
          setIsProcessingVoice(false);
          setInput(processedText);
          if (onVoiceInput) {
            await onVoiceInput(processedText);
          }
        },
        (err) => {
          console.error('Speech recognition error:', err);
          setIsRecording(false);
          setIsProcessingVoice(false);
        }
      );
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('Speech recognition not available:', err);
    }
    
    return () => {
      delete window.chatMessages;
    };
  }, [messages, onVoiceInput]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mode options
  const modeOptions = [
    { id: 'default', label: 'Default', icon: 'fa-comments' },
    { id: 'thinking', label: 'Thinking Mode', icon: 'fa-brain' },
    { id: 'brainstorm', label: 'Brainstorm Mode', icon: 'fa-lightbulb' },
    { id: 'tech', label: 'Tech Eng. Mode', icon: 'fa-code' },
    { id: 'research', label: 'Deep Research Mode', icon: 'fa-microscope' }
  ];

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim(), attachments, currentMode);
      setInput('');
      setAttachments([]);
      setCurrentMode('default');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const handleVoiceClick = async () => {
    if (!recognitionRef.current) {
      await error('Speech recognition not supported in this browser', 'Not Supported');
      return;
    }

    if (isRecording) {
      stopRecognition();
      setIsRecording(false);
    } else {
      setIsProcessingVoice(true);
      startRecognition();
      setIsRecording(true);
    }
  };

  const handleLiveSpeakingClick = () => {
    const newState = !isLiveSpeaking;
    setIsLiveSpeaking(newState);
    onLiveSpeaking(newState);
    
    // Visual feedback
    if (newState) {
      // Start animation or visual indicator
      console.log('Live speaking mode activated');
    } else {
      console.log('Live speaking mode deactivated');
    }
  };

  const handlePlusClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleUploadImage = () => {
    imageInputRef.current?.click();
    setShowDropdown(false);
  };

  const handleUploadFile = () => {
    fileInputRef.current?.click();
    setShowDropdown(false);
  };

  const handleModeSelect = (modeId) => {
    setCurrentMode(modeId);
    setShowDropdown(false);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      return file.size <= maxSize;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = {
          name: file.name,
          type: file.type,
          data: event.target.result,
          size: file.size
        };
        setAttachments(prev => [...prev, fileData]);
      };
      reader.readAsDataURL(file);
    });

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      return file.size <= maxSize;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = {
          name: file.name,
          type: file.type,
          data: event.target.result,
          size: file.size
        };
        setAttachments(prev => [...prev, fileData]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="chat-input-area">
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      {attachments.length > 0 && (
        <div className="attachments-preview">
          {attachments.map((file, index) => (
            <div key={index} className="attachment-item">
              <span>{file.name}</span>
              <button
                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                className="attachment-remove"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="chat-input-wrapper">
        <div className="plus-dropdown-wrapper" ref={dropdownRef}>
          <button
            className="chat-input-btn plus-btn"
            onClick={handlePlusClick}
            title="More options"
          >
            <i className="fa-solid fa-plus"></i>
          </button>
          {showDropdown && (
            <div className="plus-dropdown-menu">
              <div className="dropdown-section">
                <div className="dropdown-title">Upload</div>
                <button className="dropdown-item" onClick={handleUploadImage}>
                  <i className="fa-solid fa-image"></i>
                  <span>Upload Image</span>
                </button>
                <button className="dropdown-item" onClick={handleUploadFile}>
                  <i className="fa-solid fa-file"></i>
                  <span>Upload File</span>
                </button>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-section">
                <div className="dropdown-title">Modes</div>
                {modeOptions.map(mode => (
                  <button
                    key={mode.id}
                    className={`dropdown-item ${currentMode === mode.id ? 'active' : ''}`}
                    onClick={() => handleModeSelect(mode.id)}
                  >
                    <i className={`fa-solid ${mode.icon}`}></i>
                    <span>{mode.label}</span>
                    {currentMode === mode.id && <i className="fa-solid fa-check"></i>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {currentMode !== 'default' && (
          <div className="mode-indicator" title={`Mode: ${modeOptions.find(m => m.id === currentMode)?.label}`}>
            <i className={`fa-solid ${modeOptions.find(m => m.id === currentMode)?.icon}`}></i>
          </div>
        )}
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about flurr...."
          rows="1"
          disabled={disabled}
        />
        <button
          className={`chat-input-btn mic-btn ${isRecording ? 'recording' : ''} ${isProcessingVoice ? 'processing' : ''}`}
          onClick={handleVoiceClick}
          title={isRecording ? 'Recording...' : isProcessingVoice ? 'Processing...' : 'Voice input'}
          disabled={isProcessingVoice}
        >
          <i className={`fa-solid ${isProcessingVoice ? 'fa-spinner fa-spin' : 'fa-microphone'}`}></i>
        </button>
        <button
          className={`chat-input-btn waveform-btn ${isLiveSpeaking ? 'active' : ''}`}
          onClick={handleLiveSpeakingClick}
          title="Live speaking mode"
        >
          <i className="fa-solid fa-headset"></i>
        </button>
        <button
          className="chat-input-btn send-btn"
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          title="Send message"
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
}

export default ChatInput;

