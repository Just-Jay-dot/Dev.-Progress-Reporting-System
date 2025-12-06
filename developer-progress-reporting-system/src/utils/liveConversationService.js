// Optimized real-time conversational mode
// Uses Browser STT for instant transcription + Gemini for AI response (combined, token-efficient)
import { getApiKey } from './aiService';
import { speakText, stopTTS } from './ttsService';

let liveConnection = null;
let audioStream = null;
let isActive = false;
let recognitionTimeout = null;
let conversationContext = [];

// Initialize real-time conversational mode
export async function startLiveConversation(onUserTranscript, onAITranscript, onError) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    onError(new Error('API key not found. Please set it in Settings.'));
    return;
  }

  try {
    // Get user's microphone with optimal settings
    audioStream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000
      }
    });
    
    // Get conversation context
    try {
      const stored = localStorage.getItem('rigforge_chat_history');
      if (stored) {
        conversationContext = JSON.parse(stored).slice(-5); // Last 5 for efficiency
      }
    } catch (e) {
      conversationContext = [];
    }
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // CRITICAL: Configure for continuous, real-time transcription
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      // State management - accumulate ALL transcripts
      let accumulatedFinalText = '';  // All final transcripts accumulated
      let currentInterimText = '';     // Current interim result
      let isProcessingAI = false;      // Prevent concurrent AI calls
      let lastFinalIndex = -1;          // Track processed final results

      const startRecognitionWithDelay = () => {
        if (isActive && !recognitionTimeout) {
          recognitionTimeout = setTimeout(() => {
            if (isActive) {
              try {
                recognition.start();
                recognitionTimeout = null;
              } catch (e) {
                console.warn('Failed to restart recognition:', e);
                recognitionTimeout = null;
                if (isActive) startRecognitionWithDelay();
              }
            }
          }, 100);
        }
      };

      recognition.onstart = () => {
        clearTimeout(recognitionTimeout);
        recognitionTimeout = null;
      };

      recognition.onresult = async (event) => {
        // Process ALL results from event.resultIndex to end
        let newInterim = '';
        let newFinal = '';
        let hasNewFinal = false;

        // Process all results in the event
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript.trim();
          
          if (!transcript) continue; // Skip empty transcripts
          
          if (result.isFinal) {
            // Only process if we haven't seen this final result before
            if (i > lastFinalIndex) {
              newFinal += (newFinal ? ' ' : '') + transcript;
              hasNewFinal = true;
              lastFinalIndex = i;
            }
          } else {
            // Interim result - use the latest one
            newInterim = transcript;
          }
        }

        // Update accumulated final text
        if (hasNewFinal && newFinal) {
          accumulatedFinalText += (accumulatedFinalText ? ' ' : '') + newFinal;
        }

        // Show interim results instantly (browser STT - no API call)
        if (newInterim) {
          currentInterimText = newInterim;
          const displayText = accumulatedFinalText + (accumulatedFinalText && newInterim ? ' ' : '') + newInterim;
          if (onUserTranscript) {
            onUserTranscript(displayText, false); // false = interim
          }
        } else if (hasNewFinal) {
          // No interim, but we have final - show accumulated text
          if (onUserTranscript) {
            onUserTranscript(accumulatedFinalText, false); // Show immediately
          }
        }

        // Process final transcript with AI (only if we have new final text and not already processing)
        if (hasNewFinal && accumulatedFinalText && !isProcessingAI) {
          isProcessingAI = true;
          const userMessage = accumulatedFinalText;
          
          // Show final transcript immediately
          if (onUserTranscript) {
            onUserTranscript(userMessage, true); // true = final
          }

          // Send to Gemini for AI response (optimized, single call)
          try {
            // Build conversation history efficiently
            const historyText = conversationContext.length > 0
              ? conversationContext.slice(-3).map(msg => 
                  `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content.substring(0, 150)}`
                ).join('\n')
              : 'No previous conversation.';

            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{
                    parts: [{
                      text: `Natural conversation. Recent context:\n${historyText}\n\nUser: "${userMessage}"\n\nRespond briefly (1-2 sentences), naturally, as if speaking.`
                    }]
                  }],
                  generationConfig: {
                    maxOutputTokens: 80,  // Keep very short for speed
                    temperature: 0.7
                  }
                })
              }
            );

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error?.message || `API Error: ${response.status}`);
            }

            // Process streaming response instantly
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let aiResponseBuffer = '';
            let hasStartedSpeaking = false;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data: ')) {
                  const jsonStr = trimmed.slice(6).trim();
                  if (jsonStr && jsonStr !== '[DONE]') {
                    try {
                      const data = JSON.parse(jsonStr);
                      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                        const chunk = data.candidates[0].content.parts[0].text;
                        aiResponseBuffer += chunk;
                        
                        // Update transcript immediately for instant feedback
                        if (onAITranscript) {
                          onAITranscript(aiResponseBuffer, false);
                        }
                        
                        // Start speaking on first meaningful chunk (instant response)
                        if (aiResponseBuffer.length > 10 && !hasStartedSpeaking) {
                          hasStartedSpeaking = true;
                          speakText(aiResponseBuffer, null, () => {
                            // Speaking finished
                          }).catch(() => {});
                        }
                      }
                    } catch (e) {
                      // Skip invalid JSON
                    }
                  }
                }
              }
            }

            // Final AI response
            if (aiResponseBuffer) {
              if (onAITranscript) {
                onAITranscript(aiResponseBuffer, true);
              }
              
              // Speak final response if not already started
              if (!hasStartedSpeaking) {
                speakText(aiResponseBuffer, null, () => {
                  // Ready for next input
                }).catch(() => {});
              } else {
                // Update speaking with final text
                stopTTS();
                speakText(aiResponseBuffer, null, () => {
                  // Ready for next input
                }).catch(() => {});
              }
            }

            // Update conversation context
            if (userMessage && aiResponseBuffer) {
              conversationContext.push(
                { role: 'user', content: userMessage },
                { role: 'ai', content: aiResponseBuffer }
              );
              // Keep only last 5 pairs
              if (conversationContext.length > 10) {
                conversationContext = conversationContext.slice(-10);
              }
            }

            // Reset for next user input (only after successful AI response)
            accumulatedFinalText = '';
            currentInterimText = '';
            lastFinalIndex = -1;
            isProcessingAI = false;
          } catch (error) {
            console.error('Live conversation AI response error:', error);
            // Don't reset text on error - keep it for retry
            isProcessingAI = false;
            if (onError) {
              onError(error);
            }
          }
        }
      };

      recognition.onerror = (event) => {
        // Handle errors gracefully
        if (event.error === 'no-speech' || event.error === 'aborted') {
          if (isActive) {
            startRecognitionWithDelay();
          }
          return;
        }
        
        console.error('Recognition error:', event.error);
        if (onError && event.error !== 'no-speech' && event.error !== 'aborted') {
          onError(new Error(`Speech recognition error: ${event.error}`));
        }
      };

      recognition.onend = () => {
        // Auto-restart if still active
        if (isActive && liveConnection === recognition) {
          startRecognitionWithDelay();
        }
      };

      // Start recognition
      recognition.start();
      liveConnection = recognition;
      isActive = true;

      return recognition;
    } else {
      throw new Error('Speech recognition not supported in this browser');
    }
  } catch (error) {
    console.error('Failed to start live conversation:', error);
    onError(error);
    throw error;
  }
}

// Stop live conversation
export function stopLiveConversation() {
  isActive = false;
  
  if (recognitionTimeout) {
    clearTimeout(recognitionTimeout);
    recognitionTimeout = null;
  }

  if (liveConnection) {
    try {
      if (liveConnection.stop) {
        liveConnection.stop();
      }
      if (liveConnection.abort) {
        liveConnection.abort();
      }
    } catch (e) {
      console.warn('Error stopping recognition:', e);
    }
    liveConnection = null;
  }

  if (audioStream) {
    try {
      audioStream.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.warn('Error stopping audio stream:', e);
    }
    audioStream = null;
  }

  stopTTS();
}

// Check if live conversation is active
export function isLiveConversationActive() {
  return isActive;
}
