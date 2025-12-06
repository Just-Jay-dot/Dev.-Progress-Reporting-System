#!/bin/bash

echo "🔧 Setting up DNS entries for flurr.progress and flurr.app..."
echo ""

# Check if entries already exist
if grep -q "flurr.progress" /etc/hosts && grep -q "flurr.app" /etc/hosts; then
    echo "✅ DNS entries already exist in /etc/hosts"
    grep -E "flurr\.(progress|app)" /etc/hosts
else
    echo "Adding DNS entries (requires sudo password)..."
    sudo bash -c 'echo "127.0.0.1 flurr.progress" >> /etc/hosts'
    sudo bash -c 'echo "127.0.0.1 flurr.app" >> /etc/hosts'
    
    if [ $? -eq 0 ]; then
        echo "✅ DNS entries added successfully!"
        echo ""
        echo "Added entries:"
        grep -E "flurr\.(progress|app)" /etc/hosts
    else
        echo "❌ Failed to add DNS entries. Please run manually:"
        echo "  sudo bash -c 'echo \"127.0.0.1 flurr.progress\" >> /etc/hosts'"
        echo "  sudo bash -c 'echo \"127.0.0.1 flurr.app\" >> /etc/hosts'"
    fi
fi

echo ""
echo "📝 URLs configured:"
echo "  - Progress Dashboard: http://flurr.progress:8080"
echo "  - Main App (Dev): http://flurr.app:5173"
echo "  - Main App (Prod): http://flurr.app:3000"
echo ""
echo "💡 Note: You may need to restart your browser for changes to take effect."
