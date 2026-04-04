# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build          # compiles TypeScript to /app/dist

# Production stage — only the compiled output, no dev deps
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev      # install only production dependencies
COPY --from=builder /app/dist ./dist
EXPOSE 5000
CMD ["node", "dist/index.js"]
