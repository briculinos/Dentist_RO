# Quick Deployment Reference

## Prerequisites Checklist
- [ ] Hetzner Cloud account created
- [ ] Server created (CPX11 - 2GB RAM recommended)
- [ ] Domain `evaluaremedicala.services` DNS configured to point to server IP
- [ ] SSH access to server working

## One-Command Deployment

Once you have SSH access to your Hetzner server:

```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Run deployment script
curl -sSL https://raw.githubusercontent.com/briculinos/Dentist_RO/master/deploy.sh | bash
```

## Manual Step-by-Step (If automated script doesn't work)

### 1. DNS Configuration (GoDaddy)
```
Type: A
Name: @
Value: YOUR_HETZNER_SERVER_IP
TTL: 600

Type: A
Name: www
Value: YOUR_HETZNER_SERVER_IP
TTL: 600
```

### 2. Initial Server Setup
```bash
# Connect to server
ssh root@YOUR_SERVER_IP

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | bash

# Install tools
apt install -y git nano ufw fail2ban
```

### 3. Configure Firewall
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 4. Deploy Application
```bash
# Clone repository
mkdir -p /opt/medical-eval
cd /opt/medical-eval
git clone https://github.com/briculinos/Dentist_RO.git .

# Create .env file
nano .env
# (Copy from .env.example and modify passwords)

# Copy to backend
cp .env backend/.env

# Set up nginx
mkdir -p nginx certbot/conf certbot/www
cp nginx-templates/nginx-initial.conf nginx/nginx.conf

# Build and start
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d postgres backend frontend nginx

# Wait 30 seconds, then run migrations
sleep 30
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
docker compose -f docker-compose.prod.yml exec backend node prisma/seed.js
```

### 5. Obtain SSL Certificate
```bash
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  --email YOUR_EMAIL@example.com \
  --agree-tos --no-eff-email \
  -d evaluaremedicala.services \
  -d www.evaluaremedicala.services
```

### 6. Enable SSL in Nginx
```bash
cp nginx-templates/nginx-ssl.conf nginx/nginx.conf
docker compose -f docker-compose.prod.yml restart nginx
docker compose -f docker-compose.prod.yml up -d certbot
```

## Access Application

**URL:** https://evaluaremedicala.services

**Default Credentials:**
- Email: `admin@clinica.ro`
- Password: `admin123`

**⚠️ CHANGE PASSWORD IMMEDIATELY!**

## Useful Commands

### View Logs
```bash
cd /opt/medical-eval
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend
```

### Restart Services
```bash
cd /opt/medical-eval
docker compose -f docker-compose.prod.yml restart
docker compose -f docker-compose.prod.yml restart backend
```

### Update Application
```bash
cd /opt/medical-eval
git pull
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### Manual Backup
```bash
# Database backup
docker compose -f /opt/medical-eval/docker-compose.prod.yml exec postgres \
  pg_dump -U postgres medical_evaluation > backup_$(date +%Y%m%d).sql

# Files backup
tar -czf backup_uploads_$(date +%Y%m%d).tar.gz /opt/medical-eval/backend/uploads
```

### Check Status
```bash
cd /opt/medical-eval
docker compose -f docker-compose.prod.yml ps
docker stats
```

### Check SSL Certificate Expiry
```bash
docker compose -f docker-compose.prod.yml run --rm certbot certificates
```

### Renew SSL Certificate Manually
```bash
docker compose -f docker-compose.prod.yml run --rm certbot renew
docker compose -f docker-compose.prod.yml restart nginx
```

## Troubleshooting

### Can't connect to domain
```bash
# Check DNS
ping evaluaremedicala.services

# Check if nginx is running
docker ps | grep nginx

# Check nginx logs
docker logs medical_evaluation_nginx
```

### Application not loading
```bash
# Check all services
docker compose -f docker-compose.prod.yml ps

# Restart everything
docker compose -f docker-compose.prod.yml restart
```

### Database connection error
```bash
# Check postgres is running
docker ps | grep postgres

# Check backend logs
docker compose -f docker-compose.prod.yml logs backend
```

## Cost Estimate

- **Hetzner CPX11:** €4.51/month (~$5 USD)
- **Domain:** ~$12/year (already purchased)
- **SSL:** FREE (Let's Encrypt)
- **Optional Backups:** €0.90/month

**Total: ~€5/month**

## Support

For detailed instructions, see: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
