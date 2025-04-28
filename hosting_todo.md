# Web Server Setup Checklist for Raspberry Pi

## 1. **Security Setup**

- [X] Change default credentials (username/password)
- [X] Update system packages (sudo apt update && sudo apt upgrade -y)
- [ ] Set up UFW firewall rules:
  - Allow HTTP (sudo ufw allow 80/tcp)
  - Allow HTTPS (sudo ufw allow 443/tcp)
  - Enable firewall (sudo ufw enable)
- [ ] Use SSH key-based authentication:
  - Generate SSH key pair (ssh-keygen -t rsa -b 4096)
  - Disable password authentication in `/etc/ssh/sshd_config` (`PasswordAuthentication no`)
- [ ] Install SSL certificate (if exposing to the internet) using Let’s Encrypt:
  - Install Certbot (`sudo apt install certbot python3-certbot-nginx`)
  - Run Certbot (`sudo certbot --nginx`)

## 2. **Network Setup**

- [ ] Assign a static local IP to the Raspberry Pi:
  - Edit `/etc/dhcpcd.conf` to set static IP, router, and DNS
- [ ] Configure port forwarding (if exposing to the internet):
  - Forward ports 80 (HTTP) and 443 (HTTPS) on your router
- [ ] (Optional) Consider using reverse proxy (e.g., Cloudflare Tunnel, Ngrok, Tailscale)

## 3. **Web Server & Performance**

- [ ] Install Nginx for a lightweight web server (sudo apt install nginx)
- [ ] (Optional) Enable gzip/Brotli compression for static files
- [ ] (Optional) Set up a CDN for external access
- [ ] Monitor system performance:
  - Check CPU and memory usage with `htop`
  - Check disk space with `df -h`

## 4. **Backup & Recovery**

- [ ] Create regular backups of important files (e.g., tar -czvf backup.tar.gz /var/www/html)
- [ ] Set up automated backups to external storage or cloud service

## 5. **General Maintenance**

- [ ] Check for updates regularly (sudo apt update && sudo apt upgrade -y)
- [ ] Monitor logs (e.g., /var/log/nginx/access.log) for unusual activity
