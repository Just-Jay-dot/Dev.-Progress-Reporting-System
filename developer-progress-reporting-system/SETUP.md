# Setup Instructions

## Backend Setup

1. **Install backend dependencies:**
```bash
cd server
npm install
```

2. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and add:
- GitHub OAuth credentials (get from https://github.com/settings/developers)
- Stripe keys (get from https://dashboard.stripe.com/apikeys)

3. **Start the backend server:**
```bash
npm run dev
```

The backend will run on `http://localhost:3001`

## Frontend Setup

1. **Install frontend dependencies:**
```bash
npm install
```

2. **Configure API URL (optional):**
Create `.env` file in the docs root:
```
VITE_API_URL=http://localhost:3001/api
```

3. **Start the frontend:**
```bash
npm run dev
```

The frontend will run on `http://localhost:8080`

## GitHub OAuth Setup

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Set:
   - Application name: "Dev. Progress Report System"
   - Homepage URL: `http://localhost:8080`
   - Authorization callback URL: `http://localhost:8080/api/github/callback`
4. Copy Client ID and Client Secret to `.env`

## Stripe Setup

1. Go to https://dashboard.stripe.com/apikeys
2. Copy Test keys to `.env`
3. For webhooks (production), configure webhook endpoint

## Features Implemented

✅ **Backend API Server** - Express server with WebSocket support
✅ **GitHub Integration** - Real OAuth and API integration
✅ **DNS Management** - `/etc/hosts` file operations (requires admin)
✅ **Server Health Checks** - Real health monitoring
✅ **Stripe Payments** - Payment processing
✅ **File Operations** - Read/write documentation files
✅ **Search** - Full-text search across docs
✅ **Export** - JSON and HTML export
✅ **Auto-Refresh** - WebSocket-based file watching

## Notes

- DNS operations require administrator/sudo privileges
- GitHub OAuth requires backend to be running
- Stripe requires valid API keys
- File operations are restricted to allowed files only

