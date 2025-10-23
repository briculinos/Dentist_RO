#!/bin/bash

# Medical Evaluation System - Deployment Script for Hetzner
# This script automates the deployment process on a fresh Hetzner server

set -e  # Exit on any error

echo "========================================"
echo "Medical Evaluation System - Deployment"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${NC}→ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use: sudo ./deploy.sh)"
    exit 1
fi

print_success "Running as root"

# Step 1: Update system
print_info "Updating system packages..."
apt update && apt upgrade -y
print_success "System updated"

# Step 2: Install Docker
print_info "Installing Docker..."
if ! command -v docker &> /dev/null; then
    apt install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl start docker
    systemctl enable docker
    print_success "Docker installed"
else
    print_success "Docker already installed"
fi

# Step 3: Install additional tools
print_info "Installing additional tools..."
apt install -y git nano htop ufw fail2ban unattended-upgrades
print_success "Additional tools installed"

# Step 4: Configure firewall
print_info "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable
print_success "Firewall configured"

# Step 5: Configure Fail2Ban
print_info "Configuring Fail2Ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = 22
EOF
systemctl restart fail2ban
systemctl enable fail2ban
print_success "Fail2Ban configured"

# Step 6: Enable automatic security updates
print_info "Enabling automatic security updates..."
dpkg-reconfigure -plow unattended-upgrades
print_success "Automatic updates enabled"

# Step 7: Create application directory
print_info "Creating application directory..."
mkdir -p /opt/medical-eval
cd /opt/medical-eval
print_success "Application directory created"

# Step 8: Clone repository
print_info "Cloning repository..."
if [ -d ".git" ]; then
    print_warning "Repository already exists, pulling latest changes..."
    git pull
else
    git clone https://github.com/briculinos/Dentist_RO.git .
fi
print_success "Repository cloned"

# Step 9: Create directories
print_info "Creating required directories..."
mkdir -p nginx certbot/conf certbot/www backend/uploads /opt/backups
print_success "Directories created"

# Step 10: Environment configuration
print_info "Configuring environment variables..."
if [ ! -f .env ]; then
    print_warning ".env file not found. Please create it manually."
    print_info "Example:"
    cat .env.example
    exit 1
fi
cp .env backend/.env
print_success "Environment configured"

# Step 11: Copy nginx initial configuration
print_info "Setting up Nginx configuration..."
cp nginx-templates/nginx-initial.conf nginx/nginx.conf
print_success "Nginx configuration ready"

# Step 12: Build and start containers (initial - no SSL yet)
print_info "Building and starting containers..."
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d postgres backend frontend nginx
print_success "Containers started"

# Step 13: Wait for services to be ready
print_info "Waiting for services to be ready (30 seconds)..."
sleep 30

# Step 14: Run database migrations
print_info "Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy
print_success "Migrations completed"

# Step 15: Seed database
print_info "Seeding database..."
docker compose -f docker-compose.prod.yml exec -T backend node prisma/seed.js
print_success "Database seeded"

# Step 16: Set up backup cron job
print_info "Setting up automated backups..."
cat > /opt/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

mkdir -p $BACKUP_DIR

# Backup database
docker compose -f /opt/medical-eval/docker-compose.prod.yml exec -T postgres \
  pg_dump -U postgres medical_evaluation | gzip > $BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz

# Backup uploaded files
tar -czf $BACKUP_DIR/uploads_backup_$TIMESTAMP.tar.gz /opt/medical-eval/backend/uploads

# Remove old backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "uploads_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $TIMESTAMP"
EOF

chmod +x /opt/backup.sh

# Add to crontab if not already there
(crontab -l 2>/dev/null | grep -v '/opt/backup.sh'; echo "0 2 * * * /opt/backup.sh >> /var/log/backup.log 2>&1") | crontab -
print_success "Automated backups configured"

# Step 17: Print next steps
echo ""
echo "========================================"
print_success "Initial deployment completed!"
echo "========================================"
echo ""
print_warning "IMPORTANT NEXT STEPS:"
echo ""
echo "1. Obtain SSL certificates:"
echo "   docker compose -f docker-compose.prod.yml run --rm certbot certonly --webroot \\"
echo "     --webroot-path=/var/www/certbot \\"
echo "     --email YOUR_EMAIL@example.com \\"
echo "     --agree-tos \\"
echo "     --no-eff-email \\"
echo "     -d evaluaremedicala.services \\"
echo "     -d www.evaluaremedicala.services"
echo ""
echo "2. Update Nginx to use SSL:"
echo "   cp nginx-templates/nginx-ssl.conf nginx/nginx.conf"
echo "   docker compose -f docker-compose.prod.yml restart nginx"
echo ""
echo "3. Start certbot for auto-renewal:"
echo "   docker compose -f docker-compose.prod.yml up -d certbot"
echo ""
echo "4. Access your application at:"
echo "   https://evaluaremedicala.services"
echo ""
echo "5. Default login credentials:"
echo "   Email: admin@clinica.ro"
echo "   Password: admin123"
echo "   ⚠️  CHANGE THESE IMMEDIATELY!"
echo ""
echo "6. Check logs:"
echo "   docker compose -f docker-compose.prod.yml logs -f"
echo ""
echo "========================================"
