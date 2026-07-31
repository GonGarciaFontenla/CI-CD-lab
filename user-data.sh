#!/bin/bash
set -euxo pipefail

dnf update -y
dnf install -y docker ruby wget jq nginx

# Docker
systemctl enable --now docker
usermod -aG docker ec2-user

# Agente de CodeDeploy (el bucket es específico de la región)
cd /home/ec2-user
wget https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
chmod +x ./install
./install auto
systemctl enable --now codedeploy-agent

# Directorio de destino del despliegue
mkdir -p /opt/cicd-lab

# Nginx: nginx.conf mínimo sin el server :80 por defecto de AL2023
cat > /etc/nginx/nginx.conf <<'NGINX'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /run/nginx.pid;
events { worker_connections 1024; }
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    sendfile      on;
    keepalive_timeout 65;
    include /etc/nginx/conf.d/*.conf;
}
NGINX

# upstream inicial -> slot blue (8081)
cat > /etc/nginx/conf.d/upstream.conf <<'NGINX'
upstream app_backend {
    server 127.0.0.1:8081;
}
NGINX

# server block del reverse proxy (único listener en :80)
cat > /etc/nginx/conf.d/app.conf <<'NGINX'
server {
    listen 80;
    server_name _;
    location / {
        proxy_pass http://app_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX

nginx -t
systemctl enable --now nginx