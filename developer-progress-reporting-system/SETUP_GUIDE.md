# Developer Progress Report System - Setup Guide

## 🚀 Quick Start

### For New Projects

1. **Clone the Developer Progress Report System**
   ```bash
   git clone <repository-url>
   cd developer-progress-report-system
   ```

2. **Install Dependencies**
   ```bash
   cd docs
   npm install
   cd server
   npm install
   ```

3. **Start the System**
   ```bash
   # Terminal 1: Start backend server
   cd server
   npm start
   
   # Terminal 2: Start frontend
   cd docs
   npm run dev
   ```

4. **Access the System**
   - Open `http://localhost:8080` in your browser
   - Set your Gemini API key in Settings
   - Start chatting with AI to create your blueprint!

---

## 📋 Complete Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Gemini API key (get from [Google AI Studio](https://ai.google.dev/))
- Git (for version control)

### Step 1: Repository Setup

**Option A: Use as Template for New Project**

```bash
# Clone the system
git clone <repository-url> my-project
cd my-project

# Initialize your project
git remote set-url origin <your-repo-url>
git push -u origin main
```

**Option B: Add to Existing Project**

```bash
# In your existing project root
git clone <repository-url> temp-docs
cp -r temp-docs/docs ./docs
cp temp-docs/.cursorrules ./
rm -rf temp-docs
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
cd docs
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 3: Configure

1. **Set API Key**
   - Start the system (see Step 4)
   - Go to Settings
   - Enter your Gemini API key
   - Click "Save"

2. **Verify Files**
   - Ensure `docs/BLUEPRINT.md` and `docs/PROGRESS.md` exist (or will be created)
   - Ensure `.cursorrules` is in project root

### Step 4: Start the System

**Development Mode:**

```bash
# Terminal 1: Backend Server
cd docs/server
npm start
# Server runs on http://localhost:3001

# Terminal 2: Frontend
cd docs
npm run dev
# Frontend runs on http://localhost:8080
```

**Production Mode:**

```bash
# Build frontend
cd docs
npm run build

# Start backend (serves built files)
cd server
npm start
```

---

## 🎯 First-Time Usage

### 1. Create Your First Blueprint

1. Open `http://localhost:8080`
2. Go to AI Chat section
3. Start chatting about your project idea
4. After substantial discussion, AI will offer to create blueprint
5. Say "yes" or "create blueprint"
6. System creates `BLUEPRINT.md` and `PROGRESS.md` automatically

### 2. Use in Cursor IDE

1. Open your project in Cursor IDE
2. Cursor automatically reads `.cursorrules`
3. Cursor reads `docs/BLUEPRINT.md` and `docs/PROGRESS.md`
4. Say "follow the blueprint" to start development
5. Cursor updates `PROGRESS.md` automatically as you code

### 3. Track Progress

1. View progress in Developer Progress Report System
2. See completion percentages
3. Track milestones
4. Monitor activity log

---

## 🔧 Configuration

### Port Configuration

**Frontend Port** (default: 8080)
- Edit `docs/vite.config.js`:
  ```javascript
  server: {
    port: 8080  // Change to your preferred port
  }
  ```

**Backend Port** (default: 3001)
- Edit `docs/server/server.js`:
  ```javascript
  const PORT = process.env.PORT || 3001;  // Change default port
  ```

### Environment Variables

Create `.env` file in `docs/server/`:

```env
PORT=3001
NODE_ENV=development
```

---

## 📁 Project Structure

```
your-project/
├── .cursorrules          # Cursor IDE integration rules
├── docs/                 # Developer Progress Report System
│   ├── BLUEPRINT.md      # Project blueprint (created by AI)
│   ├── PROGRESS.md       # Progress tracking (created by AI)
│   ├── LOG.md            # Activity log
│   ├── src/              # Frontend React app
│   ├── server/           # Backend Express server
│   ├── package.json      # Frontend dependencies
│   └── vite.config.js    # Vite configuration
├── src/                  # Your project source code
└── ...
```

---

## 🐛 Troubleshooting

### Issue: "API key not found"

**Solution:**
1. Go to Settings in the web viewer
2. Enter your Gemini API key
3. Click "Save"
4. Refresh the page

### Issue: "Failed to read file"

**Solution:**
1. Ensure `docs/BLUEPRINT.md` and `docs/PROGRESS.md` exist
2. Check file permissions
3. Verify backend server is running

### Issue: "Backend server not responding"

**Solution:**
1. Check if backend is running: `cd docs/server && npm start`
2. Verify port 3001 is not in use
3. Check server logs for errors

### Issue: "File watcher not working"

**Solution:**
1. Ensure backend server is running
2. Check WebSocket connection in browser console
3. Verify file paths are correct

---

## 🔒 Security Notes

- API keys are stored in browser localStorage (base64 encoded)
- Files are written to local filesystem only
- No data is sent to external servers except Gemini API
- Backend server should only run locally or behind authentication

---

## 📚 Next Steps

1. **Create Your Blueprint**: Chat with AI about your project
2. **Start Development**: Use Cursor IDE to follow the blueprint
3. **Track Progress**: Monitor progress in the web viewer
4. **Update Documentation**: Cursor IDE updates docs automatically

---

## 🆘 Support

For issues or questions:
1. Check the `INTEGRATION_GUIDE.md` for workflow details
2. Check the `ROBUST_INTEGRATION.md` for architecture
3. Review `.cursorrules` for Cursor IDE integration

---

**You're all set! Start planning your project with the Developer Progress Report System.**

