#!/bin/bash
set -e

AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="585008043636"
REPO_NAME="cicd-lab-app"
IMAGE_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${REPO_NAME}:latest"

BLUE_PORT=8081
GREEN_PORT=8082

BLUE_CONTAINER="cicd-lab-blue"
GREEN_CONTAINER="cicd-lab-green"

# 1. Determine active container and choose target slot
if docker ps --format '{{.Names}}' | grep -q "^${BLUE_CONTAINER}$"; then
    echo "Currently ACTIVE: Blue (${BLUE_CONTAINER} on port ${BLUE_PORT})"
    TARGET_PORT=${GREEN_PORT}
    TARGET_CONTAINER=${GREEN_CONTAINER}
    TARGET_COLOR="green"
else
    echo "Currently ACTIVE: Green or None. Setting target slot to Blue (${BLUE_CONTAINER} on port ${BLUE_PORT})"
    TARGET_PORT=${BLUE_PORT}
    TARGET_CONTAINER=${BLUE_CONTAINER}
    TARGET_COLOR="blue"
fi

echo "Targeting deployment slot: ${TARGET_COLOR} (Container: ${TARGET_CONTAINER}, Port: ${TARGET_PORT})"

# 2. Login to ECR & Pull latest image
echo "Logging in to Amazon ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

echo "Pulling latest image: ${IMAGE_URI}..."
docker pull "${IMAGE_URI}"

# 3. Clean up target container if a leftover instance exists
if docker ps -a --format '{{.Names}}' | grep -q "^${TARGET_CONTAINER}$"; then
    echo "Cleaning up leftover target container '${TARGET_CONTAINER}'..."
    docker stop "${TARGET_CONTAINER}" || true
    docker rm "${TARGET_CONTAINER}" || true
fi

# 4. Start new container on target host port
echo "Starting container '${TARGET_CONTAINER}' on host port ${TARGET_PORT}..."
docker run -d \
  --name "${TARGET_CONTAINER}" \
  --restart unless-stopped \
  -p ${TARGET_PORT}:80 \
  "${IMAGE_URI}"

# 5. Healthcheck polling loop
echo "Performing healthcheck on http://localhost:${TARGET_PORT}..."
MAX_RETRIES=10
RETRY_COUNT=0
HEALTHY=false

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s -f "http://localhost:${TARGET_PORT}" > /dev/null; then
        HEALTHY=true
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Healthcheck attempt ${RETRY_COUNT}/${MAX_RETRIES} failed. Retrying in 3s..."
    sleep 3
done

if [ "$HEALTHY" = false ]; then
    echo "ERROR: Healthcheck failed for ${TARGET_CONTAINER} on port ${TARGET_PORT}!"
    echo "Aborting deployment and removing failed target container..."
    docker stop "${TARGET_CONTAINER}" || true
    docker rm "${TARGET_CONTAINER}" || true
    exit 1
fi

echo "Healthcheck passed successfully!"

# 6. Switch Nginx traffic to target port
echo "Updating Nginx upstream configuration to point to port ${TARGET_PORT}..."
cat <<EOF > /etc/nginx/conf.d/upstream.conf
upstream app_backend {
    server 127.0.0.1:${TARGET_PORT};
}
EOF

echo "Testing and reloading Nginx..."
nginx -t
nginx -s reload

echo "Traffic successfully switched to ${TARGET_CONTAINER} on port ${TARGET_PORT}."
