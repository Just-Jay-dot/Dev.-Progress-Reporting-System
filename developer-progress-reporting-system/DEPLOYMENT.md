# Deployment Guide

## 🚀 Production Deployment

### Build for Production

```bash
# Build frontend
cd docs
npm run build

# The build output will be in docs/dist/
```

### Run Production Server

```bash
# Start backend (serves built files)
cd docs/server
npm start
```

The backend server will:
- Serve the built frontend from `dist/`
- Provide API endpoints
- Handle file operations
- Manage WebSocket connections

---

## 🌐 Deployment Options

### Option 1: Local Network

1. Update `vite.config.js` to allow network access:
   ```javascript
   server: {
     host: '0.0.0.0',
     port: 8080
   }
   ```

2. Access from other devices on your network:
   ```
   http://<your-ip>:8080
   ```

### Option 2: Cloud Hosting

**Recommended Platforms:**
- Vercel (frontend)
- Railway (full stack)
- Render (full stack)
- DigitalOcean (VPS)

**Environment Variables:**
```env
PORT=3001
NODE_ENV=production
```

### Option 3: Docker (Coming Soon)

Docker deployment will be available in a future update.

---

## 🔒 Security Considerations

### Production Checklist

- [ ] Use HTTPS
- [ ] Add authentication for backend
- [ ] Restrict file access
- [ ] Validate all inputs
- [ ] Rate limit API endpoints
- [ ] Secure API keys
- [ ] Enable CORS only for trusted domains

---

## 📝 Notes

- Backend must be accessible for file operations
- WebSocket connections require persistent connection
- File watcher works best on local filesystem
- For cloud deployment, consider using database instead of files

---

**For local development, the current setup is production-ready.**

