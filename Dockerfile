FROM node:20-alpine

WORKDIR /app

# Commit SHA passed during Docker build phase
ARG COMMIT_SHA=unknown

# Environment variable exposed to the application runtime
ENV COMMIT_SHA=${COMMIT_SHA}
ENV PORT=80

COPY server.js ./

EXPOSE 80

CMD ["node", "server.js"]
