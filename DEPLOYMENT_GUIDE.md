# Deployment Guide - Hetzner Cloud + GoDaddy Domain

Complete step-by-step guide to deploy the Medical Evaluation System to Hetzner Cloud with domain `evaluaremedicala.services`.

## Prerequisites

- GoDaddy domain: `evaluaremedicala.services` ✓
- Hetzner Cloud account (sign up at https://www.hetzner.com/cloud)
- Credit card for Hetzner payment
- SSH key pair (we'll create if you don't have one)

---

## Part 1: Create SSH Key (if you don't have one)

**On macOS/Linux:**

```bash
# Check if you already have SSH keys
ls -la ~/.ssh/

# If you see id_rsa or id_ed25519, you already have keys. Skip to Part 2.
# Otherwise, create a new key:
ssh-keygen -t ed25519 -C "your_email@example.com"

# Press Enter to accept default location
# Enter a passphrase (optional but recommended)

# Display your public key (you'll need this for Hetzner)
cat ~/.ssh/id_ed25519.pub
```

**Copy the entire output** - it starts with `ssh-ed25519` and ends with your email.

---

## Part 2: Set Up Hetzner Cloud Server

### 2.1 Create Hetzner Account

1. Go to https://www.hetzner.com/cloud
2. Click "Sign Up" and create an account
3. Verify your email
4. Add payment method (credit card)

### 2.2 Create a New Project

1. Log in to Hetzner Cloud Console: https://console.hetzner.cloud/
2. Click "New Project"
3. Name it: `Medical Evaluation`
4. Click "Add Project"

### 2.3 Add Your SSH Key

1. In your project, go to "Security" → "SSH Keys"
2. Click "Add SSH Key"
3. Paste your public key from Part 1
4. Name it: `My MacBook` (or whatever describes your computer)
5. Click "Add SSH Key"

### 2.4 Create Server (VPS)

1. Click "Add Server"
2. **Location:** Choose closest to you:
   - Nuremberg, Germany (eu-central)
   - Helsinki, Finland (eu-north)
   - Falkenstein, Germany
3. **Image:** Ubuntu 22.04
4. **Type:** Standard - **CPX11** (2 vCPU, 2GB RAM) - €4.51/month
   - This is perfect for your app. Can upgrade later if needed.
5. **Networking:**
   - IPv4: ✓ (enabled)
   - IPv6: ✓ (enabled, optional)
6. **SSH Keys:** Select your SSH key from the list
7. **Volume:** None (not needed)
8. **Firewall:** We'll set this up later
9. **Backups:** Can enable later (€0.90/month for automated backups)
10. **Name:** `medical-eval-server`
11. Click "Create & Buy Now"

**Wait 30-60 seconds** for the server to be created.

### 2.5 Note Your Server IP

Once created, you'll see:
- **IPv4:** Something like `78.47.123.456`
- **Copy this IP address** - you'll need it!

---

## Part 3: Configure Domain (GoDaddy DNS)

### 3.1 Add DNS Records

1. Go to https://godaddy.com and log in
2. Go to "My Products" → "Domains"
3. Find `evaluaremedicala.services` and click "DNS"
4. Click "Add" to add new DNS records

**Add these 2 records:**

**Record 1 - Main domain:**
- **Type:** A
- **Name:** @ (means root domain)
- **Value:** Your Hetzner server IP (e.g., `78.47.123.456`)
- **TTL:** 600 seconds

**Record 2 - WWW subdomain:**
- **Type:** A
- **Name:** www
- **Value:** Your Hetzner server IP (same as above)
- **TTL:** 600 seconds

5. Click "Save"

**Note:** DNS changes can take 5-60 minutes to propagate worldwide. Usually it's quick (5-10 min).

### 3.2 Verify DNS (after 10 minutes)

On your Mac, test if DNS is working:

```bash
# Replace with your actual IP
ping evaluaremedicala.services

# Should show your Hetzner IP
# Press Ctrl+C to stop
```

---

## Part 4: Connect to Your Server

### 4.1 SSH Into Server

```bash
# Replace with your actual server IP
ssh root@78.47.123.456

# Type 'yes' when asked about fingerprint
# You should now be connected to your Hetzner server!
```

You'll see a prompt like: `root@medical-eval-server:~#`

---

## Part 5: Server Initial Setup

### 5.1 Update System

```bash
# Update package list
apt update

# Upgrade all packages
apt upgrade -y

# This may take 2-5 minutes
```

### 5.2 Install Docker

```bash
# Install required packages
apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package list again
apt update

# Install Docker
apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
apt install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Start Docker
systemctl start docker
systemctl enable docker
```

### 5.3 Install Additional Tools

```bash
# Install useful tools
apt install -y git nano htop ufw fail2ban

# Git: for cloning your repository
# Nano: simple text editor
# Htop: system monitoring
# UFW: firewall
# Fail2ban: protection against brute force attacks
```

---

## Part 6: Configure Firewall

```bash
# Set default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (important - don't lock yourself out!)
ufw allow 22/tcp

# Allow HTTP (port 80)
ufw allow 80/tcp

# Allow HTTPS (port 443)
ufw allow 443/tcp

# Enable firewall
ufw enable

# Type 'y' and press Enter

# Check status
ufw status
```

---

## Part 7: Deploy Your Application

### 7.1 Create Application Directory

```bash
# Create directory for app
mkdir -p /opt/medical-eval
cd /opt/medical-eval
```

### 7.2 Clone Your Repository

```bash
# Clone from GitHub
git clone https://github.com/briculinos/Dentist_RO.git .

# The . at the end means "clone into current directory"
```

### 7.3 Create Production Environment File

```bash
# Create .env file
nano .env
```

**Paste this content** (modify the values):

```env
# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_THIS_TO_STRONG_PASSWORD_123!@#
POSTGRES_DB=medical_evaluation

# Database URL for Prisma
DATABASE_URL=postgresql://postgres:CHANGE_THIS_TO_STRONG_PASSWORD_123!@#@postgres:5432/medical_evaluation?schema=public

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Secret - MUST BE STRONG AND RANDOM
JWT_SECRET=CHANGE_THIS_TO_VERY_LONG_RANDOM_STRING_AT_LEAST_32_CHARACTERS_abc123xyz789
JWT_EXPIRES_IN=24h

# CORS Configuration - YOUR DOMAIN
ALLOWED_ORIGINS=https://evaluaremedicala.services,https://www.evaluaremedicala.services

# File Upload
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important:**
- Replace `CHANGE_THIS_TO_STRONG_PASSWORD_123!@#` with a strong password (at least 20 characters)
- Replace `CHANGE_THIS_TO_VERY_LONG_RANDOM_STRING_...` with a strong random string (at least 32 characters)

**To save in nano:**
- Press `Ctrl+X`
- Press `Y` (yes)
- Press `Enter`

### 7.4 Generate Strong Passwords

Need help generating secure passwords? Use this:

```bash
# Generate random password for database
openssl rand -base64 32

# Generate random JWT secret
openssl rand -base64 48

# Copy these and paste into your .env file
```

### 7.5 Update Backend .env

```bash
# Copy root .env to backend
cp .env backend/.env

# Verify it copied
cat backend/.env
```

---

## Part 8: Set Up Nginx Reverse Proxy with SSL

### 8.1 Create Nginx Configuration

We need to set up Nginx to:
- Handle HTTPS (SSL certificates)
- Proxy requests to your frontend/backend containers
- Serve your domain

```bash
# Create nginx directory
mkdir -p /opt/medical-eval/nginx
cd /opt/medical-eval/nginx

# Create initial nginx config (for Let's Encrypt verification)
nano nginx-initial.conf
```

Paste this:

```nginx
server {
    listen 80;
    server_name evaluaremedicala.services www.evaluaremedicala.services;

    # Allow Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all other traffic to HTTPS (after we get certificates)
    location / {
        return 301 https://$host$request_uri;
    }
}
```

Save with `Ctrl+X`, `Y`, `Enter`.

### 8.2 Create Full Nginx Configuration (for after SSL)

```bash
nano nginx.conf
```

Paste this:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name evaluaremedicala.services www.evaluaremedicala.services;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name evaluaremedicala.services www.evaluaremedicala.services;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/evaluaremedicala.services/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/evaluaremedicala.services/privkey.pem;

    # SSL configuration (strong security)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Max upload size (for medical documents)
    client_max_body_size 10M;

    # Proxy to frontend (React app)
    location / {
        proxy_pass http://frontend:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy to backend API
    location /api {
        proxy_pass http://backend:5000;
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

Save with `Ctrl+X`, `Y`, `Enter`.

---

## Part 9: Update Docker Compose for Production

```bash
cd /opt/medical-eval
nano docker-compose.yml
```

Replace the entire content with this production version:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: medical_evaluation_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - medical_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: medical_evaluation_backend
    restart: unless-stopped
    env_file:
      - ./backend/.env
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - medical_network
    volumes:
      - ./backend/uploads:/app/uploads
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: https://evaluaremedicala.services
    container_name: medical_evaluation_frontend
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - medical_network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: medical_evaluation_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - frontend
      - backend
    networks:
      - medical_network

  # Certbot for SSL certificates
  certbot:
    image: certbot/certbot:latest
    container_name: medical_evaluation_certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  postgres_data:

networks:
  medical_network:
    driver: bridge
```

Save with `Ctrl+X`, `Y`, `Enter`.

---

## Part 10: Update Backend for Health Check Endpoint

```bash
nano backend/src/index.js
```

Find the line after the routes are defined (around line 40-50), and add this health check endpoint:

```javascript
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

Save the file.

---

## Part 11: Update Frontend API URL

```bash
nano frontend/src/services/api.js
```

Find the `baseURL` and update it:

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://evaluaremedicala.services',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

Save the file.

---

## Part 12: Get SSL Certificates (Let's Encrypt)

### 12.1 Start Nginx with Initial Config

```bash
cd /opt/medical-eval

# Use the initial nginx config first
cp nginx/nginx-initial.conf nginx/nginx.conf

# Start only nginx and certbot first
docker compose up -d nginx
```

### 12.2 Obtain SSL Certificates

```bash
# Get certificates for your domain
docker compose run --rm certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email your_email@example.com \
  --agree-tos \
  --no-eff-email \
  -d evaluaremedicala.services \
  -d www.evaluaremedicala.services

# Replace your_email@example.com with your actual email
```

You should see: "Successfully received certificate"

### 12.3 Update Nginx to Full Config

```bash
# Stop nginx
docker compose down nginx

# Copy the full nginx config
cp nginx/nginx.conf nginx/nginx.conf.bak
# The full config is already in nginx/nginx.conf from Part 8.2
```

---

## Part 13: Build and Start All Services

### 13.1 Build Images

```bash
cd /opt/medical-eval

# Build all containers
docker compose build

# This will take 5-10 minutes the first time
```

### 13.2 Start All Services

```bash
# Start all services in background
docker compose up -d

# Check status
docker compose ps

# All services should show "Up" or "Up (healthy)"
```

### 13.3 Run Database Migrations

```bash
# Wait 30 seconds for database to be ready, then:
docker compose exec backend npx prisma migrate deploy

# Seed the database with initial data
docker compose exec backend node prisma/seed.js
```

### 13.4 Check Logs

```bash
# View all logs
docker compose logs

# View only backend logs
docker compose logs backend

# View only frontend logs
docker compose logs frontend

# Follow logs in real-time
docker compose logs -f
```

---

## Part 14: Test Your Application

### 14.1 Open in Browser

1. Go to: https://evaluaremedicala.services
2. You should see the login page!
3. Test login with:
   - Email: `admin@clinica.ro`
   - Password: `admin123`

### 14.2 Test from Tablet

1. On your Android/iPad tablet, open browser
2. Go to: https://evaluaremedicala.services
3. Login and test the interface
4. **Add to Home Screen** for app-like experience:
   - **Android Chrome:** Menu → "Add to Home screen"
   - **iPad Safari:** Share → "Add to Home Screen"

---

## Part 15: Security Hardening

### 15.1 Change Default Passwords

1. Login to the application
2. Change the default admin password immediately
3. Create new users with strong passwords

### 15.2 Set Up Automatic Security Updates

```bash
# Install unattended upgrades
apt install -y unattended-upgrades

# Enable automatic security updates
dpkg-reconfigure -plow unattended-upgrades
# Select "Yes"
```

### 15.3 Configure Fail2Ban (Protection Against Brute Force)

```bash
# Fail2ban is already installed, configure it:
nano /etc/fail2ban/jail.local
```

Paste this:

```ini
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = 22
```

Save and restart:

```bash
systemctl restart fail2ban
systemctl enable fail2ban
```

---

## Part 16: Set Up Automatic Backups

### 16.1 Create Backup Script

```bash
# Create backup directory
mkdir -p /opt/backups

# Create backup script
nano /opt/backup.sh
```

Paste this:

```bash
#!/bin/bash

# Backup configuration
BACKUP_DIR="/opt/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Backup database
docker compose -f /opt/medical-eval/docker-compose.yml exec -T postgres \
  pg_dump -U postgres medical_evaluation | gzip > $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz

# Backup uploaded files
tar -czf $BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz /opt/medical-eval/backend/uploads

# Remove old backups (older than RETENTION_DAYS)
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "uploads_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $TIMESTAMP"
```

Make it executable:

```bash
chmod +x /opt/backup.sh
```

### 16.2 Schedule Automatic Backups

```bash
# Edit crontab
crontab -e

# Select nano (option 1)
```

Add this line at the end (runs daily at 2 AM):

```
0 2 * * * /opt/backup.sh >> /var/log/backup.log 2>&1
```

Save and exit.

### 16.3 Test Backup

```bash
# Run backup manually
/opt/backup.sh

# Check if backup was created
ls -lh /opt/backups/
```

---

## Part 17: Monitoring and Maintenance

### 17.1 Check Application Status

```bash
# Check running containers
docker compose ps

# Check resource usage
docker stats

# Check disk space
df -h

# Check memory usage
free -h
```

### 17.2 View Logs

```bash
# All logs
docker compose logs

# Specific service
docker compose logs backend
docker compose logs frontend
docker compose logs nginx

# Follow logs in real-time
docker compose logs -f backend
```

### 17.3 Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend
```

### 17.4 Update Application

When you push changes to GitHub:

```bash
cd /opt/medical-eval

# Pull latest code
git pull

# Rebuild and restart
docker compose down
docker compose build
docker compose up -d

# Run any new migrations
docker compose exec backend npx prisma migrate deploy
```

---

## Part 18: Cost Estimate

**Monthly Costs:**
- Hetzner CPX11 server: €4.51/month (~$5 USD)
- Domain (already paid yearly on GoDaddy): ~$12/year
- SSL Certificate (Let's Encrypt): FREE
- Backups (optional Hetzner automated): €0.90/month

**Total: ~€5.41/month (~$6 USD/month)**

---

## Part 19: Troubleshooting

### Problem: Can't connect to domain

**Solution:**
```bash
# Check if DNS is working
ping evaluaremedicala.services

# Check if nginx is running
docker compose ps nginx

# Check nginx logs
docker compose logs nginx
```

### Problem: SSL certificate error

**Solution:**
```bash
# Renew certificates manually
docker compose run --rm certbot renew

# Restart nginx
docker compose restart nginx
```

### Problem: Application not loading

**Solution:**
```bash
# Check all services
docker compose ps

# Check backend logs
docker compose logs backend

# Restart everything
docker compose down
docker compose up -d
```

### Problem: Database connection error

**Solution:**
```bash
# Check postgres is running
docker compose ps postgres

# Check backend can reach database
docker compose exec backend npx prisma db push
```

---

## Part 20: Support & Next Steps

### Done! Your app is now live at:
- https://evaluaremedicala.services

### Recommended next steps:
1. Change all default passwords
2. Create real user accounts
3. Test thoroughly on tablets
4. Set up monitoring (optional)
5. Consider enabling Hetzner automated backups (€0.90/month)

### Getting help:
- Hetzner docs: https://docs.hetzner.com/
- Docker docs: https://docs.docker.com/
- Let's Encrypt docs: https://letsencrypt.org/docs/

---

**Congratulations! Your medical evaluation system is now deployed and accessible from any device with internet access!**
