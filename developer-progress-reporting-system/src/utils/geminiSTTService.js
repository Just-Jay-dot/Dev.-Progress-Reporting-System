// Gemini STT Service for accurate transcription
import { getApiKey } from './aiService';

/**
 * Transcribe audio using Gemini API
 * This provides higher accuracy than browser STT but requires API calls
 * Best used for post-processing final transcripts
 */
export async function transcribeWithGemini(audioBlob, conversationContext = []) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('API key not found');
  }

  try {
    // Convert audio blob to base64
    const audioBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]; // Remove data:audio/...;base64, prefix
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    // Get audio MIME type
    const mimeType = audioBlob.type || 'audio/webm';

    // Get conversation context for better accuracy
    const contextText = conversationContext.length > 0
      ? conversationContext.slice(-5).map(msg => 
          `${msg.role}: ${msg.content}`
        ).join('\n')
      : 'No previous conversation.';

    // Use Gemini with audio input
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Transcribe the following audio accurately. Consider the conversation context:\n\n${contextText}\n\nProvide only the transcribed text, nothing else.`
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: audioBase64
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1, // Low temperature for accurate transcription
            maxOutputTokens: 500
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    }

    throw new Error('No transcription received from Gemini');
  } catch (error) {
    console.error('Gemini STT error:', error);
    throw error;
  }
}

/**
 * Improve transcript accuracy using Gemini (lightweight post-processing)
 * This uses fewer tokens than full audio transcription
 */
export async function improveTranscriptWithGemini(transcript, conversationContext = []) {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return transcript; // Return as-is if no API key
  }

  try {
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

Conversation context:
${contextText}

Improve this transcript to be:
1. Grammatically correct
2. Contextually appropriate
3. Clear and meaningful
4. Preserving the user's intent

Return ONLY the improved text, nothing else.`
            }]
          }],
          generationConfig: {
            temperature: 0.2, // Low temperature for accuracy
            maxOutputTokens: 100 // Keep it concise
          }
        })
      }
    );

    const data = await response.json();
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    }
  } catch (error) {
    console.warn('Gemini transcript improvement failed:', error);
  }

  return transcript; // Fallback to original
}

