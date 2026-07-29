#!/bin/bash
set -e

BLUE_CONTAINER="cicd-lab-blue"
GREEN_CONTAINER="cicd-lab-green"

# Read active port from /etc/nginx/conf.d/upstream.conf
ACTIVE_PORT=""
if [ -f /etc/nginx/conf.d/upstream.conf ]; then
    ACTIVE_PORT=$(grep -oE "[0-9]{4}" /etc/nginx/conf.d/upstream.conf || true)
fi

echo "Active port reported by Nginx configuration: ${ACTIVE_PORT}"

# Identify old container to remove based on current active port
if [ "${ACTIVE_PORT}" = "8082" ]; then
    OLD_CONTAINER="${BLUE_CONTAINER}"
elif [ "${ACTIVE_PORT}" = "8081" ]; then
    OLD_CONTAINER="${GREEN_CONTAINER}"
else
    echo "Could not determine active port from Nginx upstream config. Skipping cleanup."
    OLD_CONTAINER=""
fi

if [ -n "${OLD_CONTAINER}" ]; then
    if docker ps -a --format '{{.Names}}' | grep -q "^${OLD_CONTAINER}$"; then
        echo "Allowing a 5-second grace period for in-flight HTTP requests to drain from '${OLD_CONTAINER}'..."
        sleep 5

        echo "Stopping old container '${OLD_CONTAINER}'..."
        docker stop "${OLD_CONTAINER}" || true

        echo "Removing old container '${OLD_CONTAINER}'..."
        docker rm "${OLD_CONTAINER}" || true
    else
        echo "Old container '${OLD_CONTAINER}' is not running."
    fi
fi

# Final validation ping to Nginx reverse proxy on host port 80
echo "Validating application health through Nginx reverse proxy (http://localhost:80)..."
if curl -s -f "http://localhost:80" > /dev/null; then
    echo "Service validation SUCCESSFUL! Zero-downtime deployment complete."
else
    echo "ERROR: Service validation on port 80 failed!"
    exit 1
fi
