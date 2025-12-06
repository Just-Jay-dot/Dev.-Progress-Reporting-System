// Gemini TTS Service for instant text-to-speech
import { getApiKey } from './aiService';

let audioContext = null;
let currentAudio = null;
let ttsCache = new Map(); // Cache for instant playback

// Initialize audio context
function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

// Stop current audio playback
export function stopTTS() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// Generate cache key from text
function getCacheKey(text) {
  return text.substring(0, 100).toLowerCase().trim();
}

// Convert L16 PCM audio to WAV format for browser playback
function convertL16ToWav(inputData, mimeType = "audio/L16;codec=pcm;rate=24000", numChannels = 1) {
  const [type, codec, sampleRate] = mimeType.split(";").map(e => 
    e.includes("=") ? e.trim().split("=")[1] : e.trim()
  );
  
  if (type !== "audio/L16" || codec !== "pcm") {
    throw new Error(`Unsupported MIME type: ${mimeType}`);
  }
  
  const bitsPerSample = 16;
  const blockAlign = numChannels * bitsPerSample / 8;
  const byteRate = Number(sampleRate) * blockAlign;
  const dataSize = inputData.length;
  const fileSize = 36 + dataSize;
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  
  // Write WAV header
  const data = [
    { method: "setUint8", value: [..."RIFF"].map(e => e.charCodeAt(0)), add: [0, 1, 2, 3] },
    { method: "setUint32", value: [fileSize], add: [4], littleEndian: true },
    { method: "setUint8", value: [..."WAVE"].map(e => e.charCodeAt(0)), add: [8, 9, 10, 11] },
    { method: "setUint8", value: [..."fmt "].map(e => e.charCodeAt(0)), add: [12, 13, 14, 15] },
    { method: "setUint32", value: [16], add: [16], littleEndian: true },
    { method: "setUint16", value: [1, numChannels], add: [20, 22], littleEndian: true },
    { method: "setUint32", value: [Number(sampleRate), byteRate], add: [24, 28], littleEndian: true },
    { method: "setUint16", value: [blockAlign, bitsPerSample], add: [32, 34], littleEndian: true },
    { method: "setUint8", value: [..."data"].map(e => e.charCodeAt(0)), add: [36, 37, 38, 39] },
    { method: "setUint32", value: [dataSize], add: [40], littleEndian: true },
  ];
  
  data.forEach(({ method, value, add, littleEndian }) =>
    add.forEach((a, i) => view[method](a, value[i], littleEndian || false))
  );
  
  return [...new Uint8Array(header), ...inputData];
}

// Optimize text for natural, human-like speech
function optimizeTextForSpeech(text) {
  // Remove markdown first
  let optimized = text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1')     // Remove italic
    .replace(/`(.*?)`/g, '$1')       // Remove code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
    .replace(/#{1,6}\s+/g, '')       // Remove headers
    .replace(/\n{3,}/g, '\n\n')      // Limit multiple newlines
    .trim();
  
  // Add natural pauses and breathing points
  optimized = optimized
    // Add pauses after sentences (but not if already there)
    .replace(/\.([A-Z])/g, '. $1')   // Space after period before capital
    .replace(/!([A-Z])/g, '! $1')    // Space after exclamation
    .replace(/\?([A-Z])/g, '? $1')   // Space after question
    
    // Add subtle pauses for commas and semicolons
    .replace(/,([^\s])/g, ', $1')    // Ensure space after comma
    .replace(/;([^\s])/g, '; $1')    // Ensure space after semicolon
    .replace(/:([^\s])/g, ': $1')    // Ensure space after colon
    
    // Fix pronunciation of technical terms (spell them out for clarity)
    .replace(/\bAI\b/gi, 'A I')       // Spell out AI
    .replace(/\bAPI\b/gi, 'A P I')    // Spell out API
    .replace(/\bURL\b/gi, 'U R L')    // Spell out URL
    .replace(/\bHTTP\b/gi, 'H T T P') // Spell out HTTP
    .replace(/\bHTTPS\b/gi, 'H T T P S') // Spell out HTTPS
    .replace(/\b3D\b/gi, 'three D')   // Say "three D"
    .replace(/\bUI\b/gi, 'U I')       // Spell out UI
    .replace(/\bUX\b/gi, 'U X')       // Spell out UX
    .replace(/\bJS\b/gi, 'J S')       // Spell out JS
    .replace(/\bCSS\b/gi, 'C S S')    // Spell out CSS
    .replace(/\bHTML\b/gi, 'H T M L') // Spell out HTML
    .replace(/\bJSON\b/gi, 'J S O N') // Spell out JSON
    .replace(/\bXML\b/gi, 'X M L')    // Spell out XML
    
    // Fix numbers and symbols for natural pronunciation
    .replace(/\b(\d+)%/g, '$1 percent') // Say "percent"
    .replace(/\b(\d+)x\b/gi, '$1 times') // Say "times"
    .replace(/&/g, ' and ')            // Say "and" not "ampersand"
    .replace(/@/g, ' at ')             // Say "at" not "at symbol"
    
    // Add natural pauses around conjunctions for better flow
    .replace(/\b(however|therefore|moreover|furthermore|additionally|meanwhile)\b/gi, ', $1,')
    
    // Add natural emphasis patterns (subtle pauses for important phrases)
    .replace(/\b(please note|important|remember|keep in mind|note that)\b/gi, ', $1,')
    
    // Clean up multiple spaces and trim
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')   // Remove space before punctuation
    .replace(/([.,!?;:])\s{2,}/g, '$1 ') // Ensure single space after punctuation
    .trim();
  
  return optimized;
}

// Get best female voice for natural TTS
function getFemaleVoice() {
  if (!window.speechSynthesis) return null;
  
  const voices = window.speechSynthesis.getVoices();
  
  // Preferred female voices in order of quality (most natural first)
  const preferredVoices = [
    'Samantha',           // macOS - Very natural
    'Victoria',           // macOS - Natural
    'Karen',              // macOS - Natural
    'Google UK English Female',  // Chrome - Natural
    'Google US English Female',  // Chrome - Natural
    'Microsoft Zira',     // Windows - Natural
    'Microsoft Hazel',    // Windows - Natural
    'Samantha Enhanced',  // macOS enhanced
  ];
  
  // Try to find preferred voice
  for (const preferred of preferredVoices) {
    const voice = voices.find(v => 
      v.name.includes(preferred) && 
      (v.gender === 'female' || v.name.toLowerCase().includes('female'))
    );
    if (voice) {
      return voice;
    }
  }
  
  // Fallback: find any female voice
  const femaleVoice = voices.find(v => 
    v.gender === 'female' || 
    v.name.toLowerCase().includes('female') ||
    v.name.toLowerCase().includes('samantha') ||
    v.name.toLowerCase().includes('karen') ||
    v.name.toLowerCase().includes('victoria') ||
    v.name.toLowerCase().includes('zira') ||
    v.name.toLowerCase().includes('hazel')
  );
  
  if (femaleVoice) {
    return femaleVoice;
  }
  
  // Last resort: find a natural-sounding English voice
  const englishVoice = voices.find(v => 
    v.lang.startsWith('en') && 
    (v.name.toLowerCase().includes('natural') || 
     v.name.toLowerCase().includes('enhanced') ||
     !v.name.toLowerCase().includes('compact'))
  ) || voices.find(v => v.lang.startsWith('en'));
  
  if (englishVoice) {
    return englishVoice;
  }
  
  return voices[0] || null;
}

// Instant TTS using Gemini TTS API with caching for speed
export async function speakText(text, onStart, onEnd) {
  // Stop any current playback
  stopTTS();

  const apiKey = getApiKey();
  
  // Extract clean text (remove markdown/HTML)
  let cleanText = text;
  if (text.includes('<') || text.includes('*') || text.includes('`')) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
    cleanText = tempDiv.textContent || tempDiv.innerText || text;
  }
  
  // Limit text length for faster processing
  cleanText = cleanText.substring(0, 5000).trim();
  
  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  // Check cache first for instant playback
  const cacheKey = getCacheKey(cleanText);
  if (ttsCache.has(cacheKey)) {
    const cachedAudio = ttsCache.get(cacheKey);
    try {
      const audio = new Audio(cachedAudio);
      currentAudio = audio;
      
      audio.onplay = () => {
        if (onStart) onStart();
      };
      
      audio.onended = () => {
        if (onEnd) onEnd();
        currentAudio = null;
      };
      
      audio.onerror = () => {
        if (onEnd) onEnd();
        currentAudio = null;
        // Remove from cache if it fails
        ttsCache.delete(cacheKey);
      };
      
      await audio.play();
      return; // Instant playback from cache
    } catch (e) {
      console.warn('Cached audio playback failed:', e);
      ttsCache.delete(cacheKey);
    }
  }

  // Skip Gemini TTS API - it's slow and audio conversion is problematic
  // Use optimized browser TTS directly for instant, natural speech
  // Browser TTS is working great and is instant!

  // Use optimized browser TTS directly for instant, natural human-like voice
  // This is the primary method - it's instant and sounds great!
  if (window.speechSynthesis) {
    // Load voices if not already loaded (do this once, cache it)
    if (window.speechSynthesis.getVoices().length === 0) {
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, 100);
        window.speechSynthesis.onvoiceschanged = () => {
          clearTimeout(timeout);
          resolve();
        };
      });
    }
    
    const voice = getFemaleVoice();
    
    // Optimize text for natural, human-like speech
    const optimizedText = optimizeTextForSpeech(cleanText);
    
    // Cancel any ongoing speech for instant response
    window.speechSynthesis.cancel();
    
    // Small delay to ensure cancellation completes
    await new Promise(resolve => setTimeout(resolve, 20));
    
    // Create utterance with optimized text
    const utterance = new SpeechSynthesisUtterance(optimizedText);
    
    // Natural human-like speech parameters (optimized for maximum realism)
    // These values are tuned based on research for most natural-sounding speech
    utterance.rate = 0.87;      // Slightly slower for naturalness (0.85-0.95 range, lower = more natural, less robotic)
    utterance.pitch = 0.97;     // Slightly lower pitch for more natural female voice (0.8-1.2 range, 0.95-1.0 is most natural)
    utterance.volume = 1.0;     // Full volume
    
    // Use best available voice
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'en-US';
    } else {
      utterance.lang = 'en-US';
    }
    
    utterance.onstart = () => {
      if (onStart) onStart();
    };
    
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    
    utterance.onerror = (error) => {
      // 'interrupted' and 'canceled' are normal when speech is cancelled - don't log as errors
      if (error.error !== 'interrupted' && error.error !== 'canceled') {
        console.warn('Browser TTS Error:', error.error);
      }
      // Only call onEnd for actual errors, not interruptions
      if (error.error !== 'interrupted' && error.error !== 'canceled' && onEnd) {
        onEnd();
      }
    };
    
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Browser TTS not available');
    if (onEnd) onEnd();
  }
}

