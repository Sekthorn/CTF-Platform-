# ==========================================
# WebSec CTF - Frontend UI Multi-Stage Dockerfile
# ==========================================

# ------------------------------------------
# Stage 1: Build Vite React Application
# ------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build args for frontend API endpoint
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_APP_NAME="WebSec CTF"

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME

RUN npm run build

# ------------------------------------------
# Stage 2: Lightweight Production Nginx Server
# ------------------------------------------
FROM nginx:alpine AS runner

# Remove default nginx configurations
RUN rm -rf /etc/nginx/conf.d/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
