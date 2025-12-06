import React, { useState, useEffect, useRef } from 'react';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';
import { useChatStore } from '../hooks/useChatStore';
import { sendMessage, getProjectContext, getEnhancedProjectContext, getApiKey } from '../utils/aiService';
import { getFullProjectContext, writeDocument, isProjectInitialized } from '../utils/documentService';
import { generateBlueprint, generateProgress, shouldCreateBlueprint, extractProjectInfo } from '../utils/blueprintGenerator';
import { success, error as errorModal } from '../utils/modal';
import './AIChat.css';

function AIChat() {
  const { messages, addMessage, updateLastMessage } = useChatStore();
  const messagesEndRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationState, setConversationState] = useState('idle'); // 'idle', 'listening', 'speaking'
  const [currentMode, setCurrentMode] = useState('default');
  const [modeStatus, setModeStatus] = useState('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check project initialization on mount
  useEffect(() => {
    const checkProject = async () => {
      const initialized = await isProjectInitialized();
      if (!initialized && messages.length === 0) {
        // Show welcome message for new projects
        setTimeout(() => {
          addMessage('ai', `👋 **Welcome to Developer Progress Report System!**

I'm here to help you plan and track your project. Here's how we'll work together:

1. **Brainstorm** - Discuss your project idea with me
2. **Create Blueprint** - I'll generate a comprehensive BLUEPRINT.md file
3. **Track Progress** - Update PROGRESS.md as you develop
4. **Cursor IDE Integration** - Cursor IDE will automatically read and follow your blueprint

Let's start! Tell me about your project idea, and I'll help you create a detailed blueprint.`);
        }, 500);
      }
    };
    checkProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async (text, attachments = [], mode = 'default') => {
    if (!text.trim() || isStreaming) return;

    setCurrentMode(mode);
    
    // Set mode status text
    const modeStatusTexts = {
      thinking: 'Thinking...',
      brainstorm: 'Brainstorming...',
      tech: 'Analyzing...',
      research: 'Researching...',
      default: 'Processing...'
    };
    setModeStatus(modeStatusTexts[mode] || 'Processing...');

    // Add user message first - ensure it's added synchronously
    const userMessageId = addMessage('user', text, false, attachments);
    
    // Force a small delay to ensure state update
    await new Promise(resolve => setTimeout(resolve, 10));
    
    setIsStreaming(true);

    const apiKey = getApiKey();
    
    if (!apiKey) {
      addMessage('ai', 'Please set your Gemini API key in Settings first.');
      setIsStreaming(false);
      setModeStatus('');
      return;
    }

    let messageId = null;
    try {
      // Get enhanced context with file status
      const enhancedContext = await getEnhancedProjectContext();
      
      // Get current messages state (should include the user message we just added)
      const getLatestMessages = () => {
        const stored = localStorage.getItem('rigforge_chat_history');
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch (e) {
            return messages;
          }
        }
        return messages;
      };
      
      const latestMessages = getLatestMessages();
      const chatHistory = latestMessages.slice(-10); // Last 10 messages for context
      messageId = addMessage('ai', '', true);

      // Enhanced prompt for new projects
      let enhancedMessage = text;
      if (enhancedContext.isNewProject && !enhancedContext.hasBlueprint) {
        enhancedMessage = `[NEW PROJECT DETECTED] ${text}\n\nNote: This appears to be a new project. After discussing the project idea, you should offer to create a comprehensive BLUEPRINT.md file. Use the blueprintGenerator service to create it.`;
      }

      await sendMessage(apiKey, enhancedMessage, enhancedContext.context, chatHistory, attachments, mode, (chunk) => {
        updateLastMessage(messageId, chunk);
      });

      // After AI responds, check if we should offer to create blueprint
      // Use setTimeout to check after response completes
      setTimeout(async () => {
        const lowerText = text.toLowerCase();
        const shouldCreate = await shouldCreateBlueprint(latestMessages);
        
        // Check if user explicitly requested blueprint creation
        const explicitRequest = lowerText.includes('create blueprint') || 
                               lowerText.includes('generate blueprint') || 
                               lowerText.includes('make blueprint') ||
                               (lowerText.includes('yes') && latestMessages.length > 1 && 
                                latestMessages[latestMessages.length - 2]?.content?.includes('BLUEPRINT'));
        
        if (explicitRequest && !enhancedContext.hasBlueprint) {
          // User explicitly requested - create immediately
          try {
            setModeStatus('Creating blueprint...');
            const projectInfo = extractProjectInfo(latestMessages);
            // Get existing blueprint content if available
            const existingBlueprint = (enhancedContext.hasBlueprint && enhancedContext.blueprint) 
              ? enhancedContext.blueprint 
              : '';
            const newBlueprint = await generateBlueprint(projectInfo.discussion, existingBlueprint);
            await writeDocument('BLUEPRINT.md', newBlueprint);
            
            // Also create PROGRESS.md if it doesn't exist
            if (!enhancedContext.hasProgress) {
              const newProgress = await generateProgress();
              await writeDocument('PROGRESS.md', newProgress);
            }
            
            success('Blueprint created successfully! You can now view it in the Blueprint section.');
            addMessage('ai', '✅ **Blueprint Created!**\n\nI\'ve created a comprehensive BLUEPRINT.md file based on our discussion. You can:\n- View it in the Blueprint section\n- Share it with your team\n- Use it in Cursor IDE (it will automatically read it)\n\nYou can now start development in Cursor IDE, and it will follow this blueprint!');
            setModeStatus('');
          } catch (err) {
            console.error('Error creating blueprint:', err);
            errorModal('Failed to create blueprint. Please try again.');
            setModeStatus('');
          }
        } else if ((mode === 'brainstorm' || shouldCreate) && !enhancedContext.hasBlueprint && !explicitRequest) {
          // Offer to create blueprint after brainstorming
          const projectInfo = extractProjectInfo(latestMessages);
          if (projectInfo.hasProjectDetails) {
            addMessage('ai', '📋 Based on our discussion, I can create a comprehensive BLUEPRINT.md file for your project. Would you like me to generate it now? (Say "yes" or "create blueprint" to proceed)');
          }
        }
      }, 3000); // Wait 3 seconds for AI response to complete

      setIsStreaming(false);
      setModeStatus('');
    } catch (error) {
      console.error('AI Error:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      
      // Show detailed error message
      if (messageId) {
        updateLastMessage(messageId, `❌ Error: ${errorMessage}\n\nPlease check:\n• Your API key is valid in Settings\n• You have internet connection\n• The API key has proper permissions`);
      } else {
        addMessage('ai', `❌ Error: ${errorMessage}\n\nPlease check:\n• Your API key is valid in Settings\n• You have internet connection\n• The API key has proper permissions`);
      }
      setIsStreaming(false);
      setModeStatus('');
    }
  };

  const handleVoiceInput = async (text) => {
    await handleSend(text);
  };

  const handleLiveSpeaking = async (isActive) => {
    if (isActive) {
      // Start live speaking mode
      setConversationState('listening');
      const apiKey = getApiKey();
      if (!apiKey) {
        addMessage('ai', 'Please set your Gemini API key in Settings first.');
        setConversationState('idle');
        return;
      }

      try {
        const { startLiveConversation, stopLiveConversation } = await import('../utils/liveConversationService');
        
        // Use refs to persist message IDs across renders (stored globally for persistence)
        if (!window.liveConversationRefs) {
          window.liveConversationRefs = { userMessageId: null, aiMessageId: null };
        }
        const messageRefs = window.liveConversationRefs;

        await startLiveConversation(
          // onUserTranscript - handles both interim and final results
          (text, isFinal) => {
            setConversationState('listening');
            
            if (!text || !text.trim()) return; // Skip empty text
            
            // Always update/create message for both interim and final
            if (!messageRefs.userMessageId) {
              // Create new message (isStreaming = true for interim, false for final)
              messageRefs.userMessageId = addMessage('user', text.trim(), !isFinal);
            } else {
              // Update existing message - replace content completely
              updateLastMessage(messageRefs.userMessageId, text.trim());
              
              // If final, mark as not streaming and reset for next input
              if (isFinal) {
                // Update streaming status in localStorage
                try {
                  const stored = localStorage.getItem('rigforge_chat_history');
                  if (stored) {
                    const messages = JSON.parse(stored);
                    const index = messages.findIndex(m => m.id === messageRefs.userMessageId);
                    if (index >= 0) {
                      messages[index] = { 
                        ...messages[index], 
                        content: text.trim(), 
                        isStreaming: false 
                      };
                      localStorage.setItem('rigforge_chat_history', JSON.stringify(messages));
                    }
                  }
                } catch (e) {
                  console.warn('Failed to update message streaming status:', e);
                }
                
                // Reset for next user input (but keep message ID until AI responds)
                // Don't reset immediately - wait for AI response
              }
            }
          },
          // onAITranscript
          (text, isFinal) => {
            if (!text || !text.trim()) return; // Skip empty text
            
            setConversationState('speaking');
            if (!messageRefs.aiMessageId) {
              messageRefs.aiMessageId = addMessage('ai', text.trim(), !isFinal);
            } else {
              updateLastMessage(messageRefs.aiMessageId, text.trim());
            }
            if (isFinal) {
              setConversationState('listening');
              // Reset both message IDs for next turn
              messageRefs.aiMessageId = null;
              messageRefs.userMessageId = null; // Reset user message ID after AI responds
            }
          },
          // onError
          (error) => {
            console.error('Live conversation error:', error);
            addMessage('ai', `Error in live conversation: ${error.message || 'Unknown error'}`);
            setConversationState('idle');
            // Reset refs on error
            if (window.liveConversationRefs) {
              window.liveConversationRefs.userMessageId = null;
              window.liveConversationRefs.aiMessageId = null;
            }
          }
        );

        // Store stop function
        window.stopLiveConversation = stopLiveConversation;
      } catch (error) {
        console.error('Failed to start live conversation:', error);
        addMessage('ai', `Failed to start live conversation: ${error.message || 'Please check your microphone permissions.'}`);
        setConversationState('idle');
      }
    } else {
      // Stop live speaking mode
      setConversationState('idle');
      if (window.stopLiveConversation) {
        window.stopLiveConversation();
        window.stopLiveConversation = null;
        if (window.liveConversationRefs) {
          window.liveConversationRefs.userMessageId = null;
          window.liveConversationRefs.aiMessageId = null;
        }
      }
    }
  };

  return (
    <div className="content-section chat-section">
      <div className="chat-container">
        <div className="chat-messages" id="chat-messages">
          {messages.length === 0 ? (
            <ChatMessage
              role="ai"
              content="Hello! I'm your AI assistant for flurr. I can help you understand the project progress, architecture, and answer questions about the application. How can I assist you today?"
              timestamp={new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
            />
          ) : (
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
                messageId={msg.id}
                attachments={msg.attachments}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        {modeStatus && (
          <div className="mode-status-indicator">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <span>{modeStatus}</span>
          </div>
        )}
        <div className={`chat-input-glow ${conversationState}`}>
          <ChatInput
            onSend={handleSend}
            onVoiceInput={handleVoiceInput}
            onLiveSpeaking={handleLiveSpeaking}
            disabled={isStreaming}
            messages={messages}
          />
        </div>
      </div>
    </div>
  );
}

export default AIChat;

