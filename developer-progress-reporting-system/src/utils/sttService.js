// Enhanced STT Service with Gemini context understanding
import { getApiKey } from './aiService';

let recognitionInstance = null;

// Initialize speech recognition
export function initSpeechRecognition(onResult, onError) {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    throw new Error('Speech recognition not supported');
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognitionInstance = new SpeechRecognition();
  recognitionInstance.continuous = false;
  recognitionInstance.interimResults = false;
  recognitionInstance.lang = 'en-US';

  recognitionInstance.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    
    // Process with Gemini for context understanding
    try {
      // Get conversation context from messages if available
      const conversationContext = window.chatMessages || [];
      const processedText = await processWithContext(transcript, conversationContext);
      if (onResult) {
        onResult(processedText);
      }
    } catch (error) {
      console.error('STT processing error:', error);
      // Fallback to raw transcript
      if (onResult) {
        onResult(transcript);
      }
    }
  };

  recognitionInstance.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (onError) {
      onError(event.error);
    }
  };

  return recognitionInstance;
}

// Process transcript with Gemini for context understanding
export async function processWithContext(transcript, conversationContext = []) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return transcript; // Return as-is if no API key
  }

  try {
    // Get recent conversation for context
    const contextText = conversationContext.length > 0
      ? conversationContext.slice(-5).map(msg => 
          `${msg.role}: ${msg.content}`
        ).join('\n')
      : 'No previous conversation.';

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `The user spoke: "${transcript}"

Recent conversation context:
${contextText}

Please rewrite the spoken text to be:
1. Clear and grammatically correct
2. Contextually appropriate based on the conversation
3. Meaningful and well-structured
4. Preserving the user's intent and meaning

Return ONLY the improved text, nothing else.`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    }
  } catch (error) {
    console.error('Error processing STT with context:', error);
  }

  return transcript; // Fallback to original
}

// Start recognition
export function startRecognition() {
  if (recognitionInstance) {
    recognitionInstance.start();
  }
}

// Stop recognition
export function stopRecognition() {
  if (recognitionInstance) {
    recognitionInstance.stop();
  }
}

// Get recognition instance
export function getRecognitionInstance() {
  return recognitionInstance;
}

