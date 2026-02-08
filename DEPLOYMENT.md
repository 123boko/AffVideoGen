# Docker Deployment Guide

## Prerequisites

- VPS with Docker and Docker Compose installed
- Domain name (optional, but recommended)
- SSH access to your VPS

## Deployment Steps

### 1. Prepare Your VPS

SSH into your VPS:
```bash
ssh user@your-vps-ip
```

Install Docker and Docker Compose:
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

### 2. Clone Your Repository

```bash
git clone <your-repo-url>
cd AffVideoGen
```

### 3. Configure Environment Variables

Create `.env` file:
```bash
cp .env.example .env
nano .env
```

Update with your values:
```env
DB_PASSWORD=your-secure-password
NEXTAUTH_URL=http://your-vps-ip:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)
OPENROUTER_API_KEY=your-key
ELEVENLABS_API_KEY=your-key
```

### 4. Build and Start Containers

```bash
docker-compose up -d --build
```

This will:
- Build the Next.js application
- Start PostgreSQL database
- Start the application on port 3000

### 5. Run Database Migrations

```bash
docker-compose exec app npx prisma migrate deploy
```

### 6. Verify Deployment

Check if containers are running:
```bash
docker-compose ps
```

View logs:
```bash
docker-compose logs -f app
```

Access your application:
```
http://your-vps-ip:3000
```

## Optional: SSL/HTTPS Setup with Nginx

### 1. Install Nginx

```bash
sudo apt-get install nginx certbot python3-certbot-nginx
```

### 2. Configure Nginx

Create `/etc/nginx/sites-available/affvideogen`:
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
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/affvideogen /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Get SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com
```

Update `.env`:
```env
NEXTAUTH_URL=https://your-domain.com
```

Restart containers:
```bash
docker-compose restart
```

## Useful Commands

**View logs:**
```bash
docker-compose logs -f app
docker-compose logs -f postgres
```

**Restart services:**
```bash
docker-compose restart
```

**Stop services:**
```bash
docker-compose down
```

**Update application:**
```bash
git pull
docker-compose up -d --build
docker-compose exec app npx prisma migrate deploy
```

**Access database:**
```bash
docker-compose exec postgres psql -U affvideogen -d affvideogen
```

## Troubleshooting

**Container won't start:**
```bash
docker-compose logs app
```

**Database connection issues:**
- Check if postgres container is running: `docker-compose ps`
- Verify DATABASE_URL in `.env`
- Wait 10-15 seconds after starting for DB to be ready

**Port already in use:**
```bash
# Change port in docker-compose.yml
ports:
  - "8080:3000"  # Use 8080 instead of 3000
```

**Clear everything and restart:**
```bash
docker-compose down -v
docker-compose up -d --build
docker-compose exec app npx prisma migrate deploy
```

## Security Recommendations

1. Use strong passwords for DB_PASSWORD
2. Keep NEXTAUTH_SECRET secure and random
3. Enable firewall: `sudo ufw allow 80,443,22/tcp`
4. Regular backups of postgres_data volume
5. Keep Docker and system updated

Your application is now deployed! 🚀

