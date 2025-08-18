# Spiritual Guidance App

A React-based spiritual guidance application featuring The Hidden Words of Bahá'u'lláh and AI-powered spiritual conversations.

## Project info

**URL**: https://lovable.dev/projects/bd921d37-7172-4e1a-9a17-14db2172a67f

## Ubuntu EC2 Server Deployment (Recommended)

### System Requirements
- Ubuntu 24.04 LTS
- 4 vCPU, 16GB RAM, 200GB storage
- No GPU required

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx (optional, for reverse proxy)
sudo apt install nginx -y

# Install Git
sudo apt install git -y
```

### Step 2: Clone and Setup Application

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# Install dependencies
npm install

# Build the application
npm run build
```

### Step 3: Environment Configuration

```bash
# Create environment file
cp .env.example .env

# Edit environment variables (add your Supabase and OpenRouter keys)
nano .env
```

Required environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
- `OPENROUTER_API_KEY`: Your OpenRouter API key (for Supabase edge function)

### Step 4: Setup Systemd Service

```bash
# Create systemd service file
sudo nano /etc/systemd/system/spiritual-app.service
```

Add the following content:

```ini
[Unit]
Description=Spiritual Guidance App
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/YOUR_REPO_NAME
ExecStart=/usr/bin/npm run preview -- --host 0.0.0.0 --port 3000
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### Step 5: Start and Enable Service

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable spiritual-app

# Start the service
sudo systemctl start spiritual-app

# Check status
sudo systemctl status spiritual-app
```

### Step 6: Configure Nginx (Optional)

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/spiritual-app
```

Add:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/spiritual-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Useful Commands

```bash
# View logs
sudo journalctl -u spiritual-app -f

# Restart service
sudo systemctl restart spiritual-app

# Update application
git pull
npm run build
sudo systemctl restart spiritual-app
```

## Alternative Development Methods

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/bd921d37-7172-4e1a-9a17-14db2172a67f) and start prompting.

**Local Development**

Requirements: Node.js 18+ & npm

```bash
# Clone and setup
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install

# Start development server
npm run dev
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/bd921d37-7172-4e1a-9a17-14db2172a67f) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
