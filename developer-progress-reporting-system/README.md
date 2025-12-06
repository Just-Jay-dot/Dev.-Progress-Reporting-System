# RigForge Studio - Documentation Viewer

A modern React-based documentation viewer for monitoring project progress, blueprint, and activity logs.

## Features

- **Overview Dashboard**: Real-time progress tracking with greeting header, stats, and phase stepper
- **Progress Tracking**: View detailed progress markdown with Mermaid diagram support
- **Blueprint**: Structured project blueprint with enhanced markdown rendering
- **Activity Log**: Chronological log of all project activities
- **AI Assistant**: Context-aware chatbot with:
  - Voice input (speech-to-text)
  - Live speaking mode (continuous conversation)
  - Real-time streaming responses
  - Chat persistence (localStorage)
  - Copy and read-aloud actions
- **Settings**: API key management and token usage tracking

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will start on `http://localhost:8080`

### Build

```bash
npm run build
```

## Project Structure

```
docs/
├── src/
│   ├── components/      # React components
│   │   ├── Overview.jsx
│   │   ├── Progress.jsx
│   │   ├── Blueprint.jsx
│   │   ├── ActivityLog.jsx
│   │   ├── AIChat.jsx
│   │   ├── Settings.jsx
│   │   └── ...
│   ├── hooks/          # Custom React hooks
│   │   └── useChatStore.js
│   ├── utils/          # Utility functions
│   │   ├── markdownParser.js
│   │   └── aiService.js
│   ├── styles/         # CSS files
│   │   ├── index.css
│   │   └── App.css
│   ├── App.jsx
│   └── main.jsx
├── BLUEPRINT.md        # Project blueprint
├── PROGRESS.md         # Progress tracking
├── LOG.md              # Activity log
├── index.html
├── package.json
└── vite.config.js
```

## Features Details

### Layout
- All components match sidebar height with internal scrolling
- Stepper component bottom-aligned with sidebar
- Consistent rounded corners (16px) throughout

### Chat UI
- Rounded input bar with integrated buttons
- Attachment button (paperclip icon)
- Microphone button for voice input
- Waveform button for live speaking mode
- Send button
- Hover actions on messages (copy, read aloud, timestamp)
- Tooltips on all interactive elements

### AI Integration
- Gemini API integration with streaming
- Context-aware responses using BLUEPRINT.md and PROGRESS.md
- Token usage tracking
- Live speaking mode with real-time text appearance
- Chat history persistence

## Notes

- Chat history is saved to localStorage
- API key is stored in localStorage
- Token usage is tracked and displayed in Settings
- All markdown files are loaded from the docs root directory
