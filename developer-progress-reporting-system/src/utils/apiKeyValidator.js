// API Key validation utility
export async function validateGeminiApiKey(apiKey) {
  if (!apiKey || apiKey.length < 20) {
    return {
      valid: false,
      error: 'API key is too short'
    };
  }

  // First, try to list models (simpler validation)
  try {
    const listResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (listResponse.ok) {
      const listData = await listResponse.json();
      if (listData.models && listData.models.length > 0) {
        // Key is valid, now test with actual generation
        // Try latest models first, with fallbacks
        const modelOptions = [
          'gemini-2.5-flash',
          'gemini-1.5-flash',
          'gemini-1.5-flash-002',
          'gemini-pro'
        ];
        
        for (const model of modelOptions) {
          try {
            const generateResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  contents: [{
                    parts: [{ text: 'test' }]
                  }]
                })
              }
            );

            if (generateResponse.ok) {
              return {
                valid: true,
                message: `API key is valid and working with ${model}!`,
                model: model
              };
            } else {
              const errorData = await generateResponse.json().catch(() => ({}));
              // If 404, try next model
              if (errorData.error?.status === 'NOT_FOUND' || generateResponse.status === 404) {
                console.log(`Model ${model} not found, trying next...`);
                continue;
              }
              
              // For other errors, return failure
              return {
                valid: false,
                error: errorData.error?.message || `Generation failed: ${generateResponse.status}`,
                status: generateResponse.status
              };
            }
          } catch (genError) {
            // Network error - continue to next model
            console.warn(`Error testing model ${model}:`, genError.message);
            continue;
          }
        }
        
        // If listing works but no models work, key is still valid
        return {
          valid: true,
          message: 'API key is valid (can access models)',
          warning: 'Could not test generation with any model'
        };
      }
    }

    // If listing fails, try direct generation test with multiple models
    const modelOptions = [
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-1.5-flash-002',
      'gemini-pro'
    ];
    
    for (const model of modelOptions) {
      try {
        const generateResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: 'test' }]
              }]
            })
          }
        );

        if (generateResponse.ok) {
          return {
            valid: true,
            message: `API key is valid and working with ${model}!`,
            model: model
          };
        } else {
          const errorData = await generateResponse.json().catch(() => ({}));
          // If 404, try next model
          if (generateResponse.status === 404) {
            continue;
          }
          
          // For other errors, return failure
          return {
            valid: false,
            error: errorData.error?.message || `API Error: ${generateResponse.status} ${generateResponse.statusText}`,
            status: generateResponse.status
          };
        }
      } catch (error) {
        // Network error - continue to next model
        continue;
      }
    }
    
    // All models failed
    return {
      valid: false,
      error: 'Could not validate API key with any available model. Please check your API key.'
    };
  } catch (error) {
    console.error('API Key validation error:', error);
    return {
      valid: false,
      error: error.message || 'Network error occurred. Please check your internet connection.'
    };
  }
}
