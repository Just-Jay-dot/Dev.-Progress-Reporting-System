import { useState, useEffect } from 'react';

const CHAT_STORAGE_KEY = 'rigforge_chat_history';

export function useChatStore() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    // Always save messages immediately
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const addMessage = (role, content, isStreaming = false, attachments = []) => {
    const newMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      role,
      content: content || '',
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      isStreaming,
      attachments: attachments || []
    };
    
    // Use functional update to ensure we have the latest state
    setMessages(prev => {
      const updated = [...prev, newMessage];
      // Save immediately
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
      console.log('💾 Message saved to localStorage:', updated.length, 'messages');
      return updated;
    });
    
    console.log('✅ Message added to state:', newMessage.id, role, content.substring(0, 50));
    return newMessage.id;
  };

  const updateLastMessage = (messageId, content) => {
    setMessages(prev => {
      const updated = [...prev];
      const index = messageId 
        ? updated.findIndex(m => m.id === messageId)
        : updated.length - 1;
      
      if (index >= 0 && updated[index].role === 'ai') {
        updated[index] = {
          ...updated[index],
          content: updated[index].content + content,
          isStreaming: false
        };
      }
      // Save immediately
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
  };

  return { messages, addMessage, updateLastMessage, clearMessages };
}

