## Commands run to setup VPC
```shell
#/bin/bash

# Add App User
sudo adduser app
sudo passwd app # Requires double prompt
# Paste Password into prompts, how in ansible
sudo usermod -aG wheel app

# Switch to app user
su - app # Requires password

# Update the system
sudo yum update -y # might require password
sudo yum install -y yum-utils

sudo dnf install -y oracle-epel-release-el8

sudo dnf install certbot python3-certbot-nginx

# TODO: Add Certbot commands and create nginx config
sudo dnf install -y snapd
sudo systemctl enable --now snapd.socket
sudo systemctl start snapd
sudo ln -s /var/lib/snapd/snap /snap

#
sudo snap install core
sudo snap refresh core

# Add Docker Registry
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# Install Required packages
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo yum install -y git

# Configure Firewall
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# Setup Nginx
sudo dnf install nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure Nginx
# Move file to /etc/nginx/conf.d/api.mmaoracle.ca.conf
sudo nginx -t
sudo systemctl reload nginx

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.26.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version

# Start Docker
sudo systemctl enable --now docker
sudo usermod -aG docker app
sudo systemctl restart docker

# Create SSH
mkdir ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
# echo my ssh key to ~/.ssh/authorized_keys



# Create application folder
mkdir mma-oracle
cd mma-oracle
git init
eval "$(ssh-agent -s)"
ssh-add - <<< "${{ secrets.DEPLOY_KEY }}"
git remote add origin [origin repo]





docker swarm init
```

nginx config:

```nginx configuration
server {
    server_name api.mmaoracle.ca;

    location /core/ {
	rewrite ^/core/(.*) /$1 break;
	proxy_pass http://127.0.0.1:4000;
	proxy_set_header Host $http_host;
	proxy_set_header X-Real-IP $remote_addr;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /data/ {
	rewrite ^/data/(.*) /$1 break;
	proxy_pass http://127.0.0.1:3000;
	proxy_set_header Host $http_host;
	proxy_set_header X-Real-IP $remote_addr;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /mongo/ {
	rewrite ^/mongo/(.*) /$1 break;
        proxy_pass http://127.0.0.1:8081/;
        proxy_set_header Host $http_host;
	proxy_set_header X-Real-IP $remote_addr;
	proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
	proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/api.mmaoracle.ca/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api.mmaoracle.ca/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = api.mmaoracle.ca) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    server_name api.mmaoracle.ca;
    return 404; # managed by Certbot
}
```
