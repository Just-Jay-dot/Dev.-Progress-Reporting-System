// Get API key from secure storage
export function getApiKey() {
  if (localStorage.getItem('gemini_api_key_secure') === 'true') {
    try {
      const encoded = localStorage.getItem('gemini_api_key_enc');
      if (encoded) {
        return atob(encoded);
      }
    } catch (error) {
      console.error('Error decoding API key:', error);
    }
  }
  return localStorage.getItem('gemini_api_key');
}

export async function getProjectContext() {
  try {
    const [progressRes, blueprintRes] = await Promise.all([
      fetch('/PROGRESS.md'),
      fetch('/BLUEPRINT.md')
    ]);
    
    const progress = await progressRes.text();
    const blueprint = await blueprintRes.text();
    
    // Return full context (increased limit for better understanding)
    return `PROGRESS:\n${progress}\n\nBLUEPRINT:\n${blueprint}`;
  } catch (error) {
    return 'Project context unavailable.';
  }
}

// Enhanced context with file status
export async function getEnhancedProjectContext() {
  try {
    const { getFullProjectContext } = await import('./documentService');
    const context = await getFullProjectContext();
    
    if (!context.hasBlueprint && !context.hasProgress) {
      return {
        context: 'No project documentation found. This appears to be a new project. You should help the user create a BLUEPRINT.md and PROGRESS.md file.',
        blueprint: '',
        progress: '',
        hasBlueprint: false,
        hasProgress: false,
        isNewProject: true
      };
    }
    
    return {
      context: `PROGRESS:\n${context.progress}\n\nBLUEPRINT:\n${context.blueprint}`,
      blueprint: context.blueprint,
      progress: context.progress,
      hasBlueprint: context.hasBlueprint,
      hasProgress: context.hasProgress,
      isNewProject: false
    };
  } catch (error) {
    return {
      context: 'Project context unavailable.',
      blueprint: '',
      progress: '',
      hasBlueprint: false,
      hasProgress: false,
      isNewProject: false
    };
  }
}

// Helper function to extract text from Gemini API response
function extractTextFromResponse(data) {
  let text = '';
  
  if (data.candidates && Array.isArray(data.candidates) && data.candidates.length > 0) {
    const candidate = data.candidates[0];
    
    // Extract text from content.parts
    if (candidate.content) {
      if (candidate.content.parts && Array.isArray(candidate.content.parts)) {
        for (const part of candidate.content.parts) {
          if (part.text) {
            text += part.text;
          }
        }
      } else if (candidate.content.text) {
        text += candidate.content.text;
      }
    }
    
    // Also check for direct text in candidate (some API versions)
    if (candidate.text) {
      text += candidate.text;
    }
  }
  
  return text;
}

// Helper function to process streaming response
// Handles both SSE (Server-Sent Events) and complete JSON responses
async function processStreamingResponse(response, onChunk, message) {
  const contentType = response.headers.get('content-type') || '';
  console.log('📡 Content-Type:', contentType);
  
  // Check if response is complete JSON or SSE
  const isJSON = contentType.includes('application/json');
  const isSSE = contentType.includes('text/event-stream') || contentType.includes('text/plain');
  
  let fullResponse = '';
  let hasReceivedData = false;
  
  try {
    if (isJSON) {
      // Handle complete JSON response (non-streaming)
      console.log('📦 Parsing as complete JSON response');
      const responseText = await response.text();
      console.log('📄 Raw response preview (first 500 chars):', responseText.substring(0, 500));
      
      try {
        const data = JSON.parse(responseText);
        console.log('📦 Parsed JSON structure keys:', Object.keys(data));
        
        // Handle array of responses (streaming format returned as array)
        if (Array.isArray(data)) {
          console.log('📦 Response is an array with', data.length, 'items');
          for (const item of data) {
            const text = extractTextFromResponse(item);
            if (text) {
              fullResponse += text;
              hasReceivedData = true;
              if (onChunk) {
                onChunk(text);
              }
            }
          }
        } else {
          // Single JSON object
          const text = extractTextFromResponse(data);
          if (text) {
            fullResponse = text;
            hasReceivedData = true;
            if (onChunk) {
              onChunk(text);
            }
          }
        }
      } catch (parseError) {
        console.error('❌ Failed to parse JSON:', parseError);
        console.error('📄 Response text (first 1000 chars):', responseText.substring(0, 1000));
        throw new Error(`Failed to parse JSON response: ${parseError.message}`);
      }
    } else if (isSSE) {
      // Handle Server-Sent Events (streaming)
      console.log('📦 Parsing as SSE (Server-Sent Events)');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('📊 Stream ended. Total chunks:', chunkCount, 'Has data:', hasReceivedData);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine === '') continue;
          
          // Server-Sent Events format: "data: {json}"
          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonStr = trimmedLine.slice(6).trim();
              
              // Skip empty data or [DONE] markers
              if (jsonStr === '' || jsonStr === '[DONE]') {
                continue;
              }
              
              const data = JSON.parse(jsonStr);
              chunkCount++;
              
              const text = extractTextFromResponse(data);
              if (text) {
                fullResponse += text;
                hasReceivedData = true;
                if (onChunk) {
                  onChunk(text);
                }
              }
            } catch (e) {
              console.warn('⚠️ Failed to parse SSE chunk:', e.message, 'Line preview:', trimmedLine.substring(0, 200));
            }
          }
        }
      }
    } else {
      // Unknown format, try to parse as JSON first
      console.log('⚠️ Unknown content-type, attempting JSON parse');
      const responseText = await response.text();
      try {
        const data = JSON.parse(responseText);
        const text = extractTextFromResponse(data);
        if (text) {
          fullResponse = text;
          hasReceivedData = true;
          if (onChunk) {
            onChunk(text);
          }
        }
      } catch (parseError) {
        throw new Error(`Unknown response format. Content-Type: ${contentType}`);
      }
    }
    
    console.log('✅ Response processing complete. Has data:', hasReceivedData, 'Response length:', fullResponse.length);
    
    if (!hasReceivedData || fullResponse === '') {
      throw new Error('No response received from API. The API key might be invalid or the model might not be available.');
    }
  } catch (error) {
    console.error('❌ Response processing error:', error.message);
    throw error;
  }

  // Update token usage
  const estimatedTokens = Math.ceil((message.length + fullResponse.length) / 4);
  const currentUsage = parseInt(localStorage.getItem('token_usage') || '0');
  localStorage.setItem('token_usage', (currentUsage + estimatedTokens).toString());

  return fullResponse;
}

// Mode-specific system prompts
const MODE_PROMPTS = {
  default: `You are an AI assistant for the Developer Progress Report System. Your role is to help developers plan, track, and manage their projects through comprehensive documentation.

CRITICAL CAPABILITIES:
1. **Blueprint Creation**: When the user discusses a project idea, you should:
   - Ask clarifying questions about the project vision, features, and architecture
   - Help structure the idea into a comprehensive plan
   - Once the discussion is substantial (3+ messages about the project), offer to create BLUEPRINT.md
   - The system will automatically create the blueprint when user confirms

2. **Progress Tracking**: You can help users understand and update PROGRESS.md:
   - Explain current progress status
   - Suggest what to track
   - Note: The system automatically updates PROGRESS.md when code changes in Cursor IDE

3. **Documentation Context**: You have access to:
   - Current BLUEPRINT.md content (if exists)
   - Current PROGRESS.md content (if exists)
   - Full conversation history
   - Use this context to provide accurate, relevant responses

WORKFLOW:
- If user is brainstorming a NEW project → Guide discussion, then offer to create BLUEPRINT.md
- If user asks about project → Reference BLUEPRINT.md and PROGRESS.md
- If user wants to update progress → Explain that Cursor IDE updates it automatically
- Always maintain consistency between both files in your responses

IMPORTANT:
- You cannot directly write files - the system handles file creation/updates automatically
- When user says "create blueprint" or "yes" after you offer, the system will create it
- Focus on understanding the project and providing helpful guidance
- Be proactive in offering to create blueprint after substantial discussion

Provide helpful, accurate answers based on the project context and conversation history. Be context-aware and remember previous exchanges.`,
  
  thinking: `You are an AI assistant in Thinking Mode. Think deeply and step-by-step about the problem. Show your reasoning process, consider multiple perspectives, and provide a well-thought-out analysis. Be thorough and methodical.`,
  
  brainstorm: `You are an AI assistant in Brainstorm Mode. Your goal is to help users explore project ideas and create comprehensive blueprints.

When brainstorming:
- Ask clarifying questions about the project vision
- Explore different approaches and architectures
- Consider technical requirements and constraints
- Help structure the idea into a detailed blueprint
- Once finalized, offer to create the BLUEPRINT.md file

Generate creative ideas, explore possibilities, and think outside the box. Provide multiple options, variations, and innovative approaches. Be imaginative and open-minded.`,
  
  tech: `You are an AI assistant in Technical Engineering Mode. Provide detailed technical explanations, code examples, architecture insights, and engineering solutions. Be precise, technical, and solution-oriented.`,
  
  research: `You are an AI assistant in Deep Research Mode. Conduct thorough research, analyze information deeply, provide comprehensive insights, cite relevant information, and explore the topic extensively. Be thorough, analytical, and well-researched.`
};

export async function sendMessage(apiKey, message, context, chatHistory = [], attachments = [], mode = 'default', onChunk) {
  // Build conversation history
  const historyText = chatHistory.length > 0
    ? chatHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n')
    : 'No previous conversation.';

  // Get mode-specific prompt
  const systemPrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.default;

  // Optimize context size for speed - limit to essential information
  const optimizedContext = context.substring(0, 1500); // Reduced from 2000
  const optimizedHistory = chatHistory.length > 5 
    ? chatHistory.slice(-5).map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content.substring(0, 200)}`).join('\n')
    : historyText;

  // Process attachments
  const parts = [{
    text: `${systemPrompt}

Project Context:
${optimizedContext}

Recent Conversation:
${optimizedHistory}

User: ${message}

Respond concisely and directly.`
  }];

  // Add image attachments
  attachments.forEach(attachment => {
    if (attachment.type.startsWith('image/')) {
      parts.push({
        inline_data: {
          mime_type: attachment.type,
          data: attachment.data.split(',')[1] // Remove data:image/...;base64, prefix
        }
      });
    }
  });

  // Use vision model if image attachments exist, otherwise use regular model
  const hasImages = attachments.length > 0 && attachments.some(a => a.type.startsWith('image/'));
  
  // Optimized for speed: Use fastest Flash models only
  // Gemini 2.5 Flash is the fastest and most cost-effective model
  // Based on official Google documentation (Dec 2025):
  // - Gemini 2.5 Flash: Fastest response time, cost-effective, 1M token context
  // - Optimized for speed over other models
  const modelOptions = hasImages 
    ? [
        'gemini-2.5-flash',          // Fastest vision-capable model
        'gemini-1.5-flash',          // Fallback
        'gemini-1.5-pro'             // Last resort
      ]
    : [
        'gemini-2.5-flash',          // Fastest model - use first
        'gemini-1.5-flash'           // Fallback only
      ];
  
  console.log('🤖 Trying models in order:', modelOptions);
  console.log('📝 Message length:', message.length);
  console.log('💬 Chat history length:', chatHistory.length);

  // Try models in order until one works
  let lastError = null;
  for (const tryModel of modelOptions) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${tryModel}:streamGenerateContent?key=${apiKey}`;
    console.log(`🔄 Trying model: ${tryModel}`);
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: parts
          }]
        })
      });

      if (response.ok) {
        console.log(`✅ Success with model: ${tryModel}`);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
        console.log('📡 Response status:', response.status, response.statusText);
        
        // Check content type
        const contentType = response.headers.get('content-type');
        console.log('📡 Content-Type:', contentType);
        
        // Process the successful response
        return await processStreamingResponse(response, onChunk, message);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn(`❌ Model ${tryModel} failed:`, response.status, errorData.error?.message);
        
        // If 404, try next model
        if (response.status === 404) {
          lastError = new Error(`Model '${tryModel}' not found (404). Trying next model...`);
          continue;
        }
        
        // For other errors, throw immediately (auth errors, rate limits, etc.)
        const errorMessage = errorData.error?.message || `API Error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Network errors or non-404 errors - throw immediately
      if (!error.message.includes('404') && !error.message.includes('not found')) {
        throw error;
      }
      lastError = error;
    }
  }
  
  // If all models failed, throw the last error
  throw lastError || new Error(`All model attempts failed. Tried: ${modelOptions.join(', ')}. Please check your API key and model availability.`);
}
