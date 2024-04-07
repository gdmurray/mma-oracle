## Commands run to setup VPC
```shell
#/bin/bash

# Add App User
sudo adduser app
sudo passwd app
# Paste Password into prompts, how in ansible
sudo usermod -aG wheel app

# Switch to app user
su - app

# Update the system
sudo yum update -y
sudo yum install -y yum-utils

# Install Snapd https://oracle-base.com/articles/linux/letsencrypt-free-certificates-on-oracle-linux
sudo dnf install -y oracle-epel-release-el8
## OR ##
cd /tmp
wget https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm
rpm -Uvh /tmp/epel-release-latest-8.noarch.rpm

sudo dnf install certbot python3-certbot-nginx

#
sudo dnf install -y snapd
sudo systemctl enable --now snapd.socket
sudo systemctl start snapd
sudo ln -s /var/lib/snapd/snap /snap

#
sudo snap install core
sudo snap refresh core

# Add Docker Registry
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo yum install -y git
sudo yum install -y nginx

sudo curl -L "https://github.com/docker/compose/releases/download/v2.26.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version

# Create application folder
mkdir mma-oracle
cd mma-oracle
git init
eval "$(ssh-agent -s)"
ssh-add - <<< "${{ secrets.DEPLOY_KEY }}"
git remote add origin [origin repo]

# Create SSH
mkdir ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
# echo my ssh key to ~/.ssh/authorized_keys



# Start Docker
sudo systemctl enable --now docker
sudo usermod -aG docker app
sudo systemctl restart docker
docker swarm init
```
