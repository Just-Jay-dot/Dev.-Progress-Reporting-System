# DNS Setup Instructions

To use the custom URLs `flurr.progress` and `flurr.app`, you need to add entries to your `/etc/hosts` file.

## Manual Setup

Run these commands in your terminal:

```bash
sudo bash -c 'echo "127.0.0.1 flurr.progress" >> /etc/hosts'
sudo bash -c 'echo "127.0.0.1 flurr.app" >> /etc/hosts'
```

## Automated Setup

You can also run the provided script:

```bash
cd mixamo-clone-v2/docs
./setup-dns.sh
```

## URLs

After setup, you can access:
- **Progress Dashboard**: http://flurr.progress:8080
- **Main App (Dev)**: http://flurr.app:5173
- **Main App (Prod)**: http://flurr.app:3000

## Note

You may need to restart your browser for the DNS changes to take effect.
