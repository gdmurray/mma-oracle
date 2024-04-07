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

# Add Docker Registry
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo yum install -y git
sudo yum install -y nginx


# Create application folder
mkdir mma-oracle
cd mma-oracle
git init
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
