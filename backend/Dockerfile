# multi-stage build

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci              # First layer: package.json dependencies (only rerun if it changes)
COPY . .               
RUN npm run build       # Second layer: src code (changes in code only rerun this command)
# compiles TypeScript to /app/dist

# Stage break
    # The builder stage now has: Node 20, node_modules/, .ts source files, and the compiled dist/. 
    # We only need the last one in production. Everything else is waste.

# Production stage — only the compiled output, no dev deps
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev                   # install only production dependencies
COPY --from=builder /app/dist ./dist
# just an indicator that app interally uses port 5000
EXPOSE 5000
# The default command to run when the container starts
CMD ["node", "dist/index.js"]
# UN executes during build time; CMD executes at runtime. There can only be one CMD

# Final image size: roughly 180MB (Node 20 Alpine base) + prod node_modules + dist/. 
# Without multi-stage it would be 400-500MB+ because TypeScript and all dev deps would be included.
