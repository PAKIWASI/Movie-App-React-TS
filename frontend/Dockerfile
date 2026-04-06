
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# VITE_API_URL is injected at build time so the JS bundle knows the backend address
# this is in the .env at the same level as this file
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build          # outputs to /app/dist


# Production stage — nginx serves the static files
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config to handle React Router (all paths → index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
