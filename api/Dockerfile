FROM node:18-alpine

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Verify build output exists
RUN ls -la dist/ && head -5 dist/index.js

# Expose port
EXPOSE 3001

# Production start command with explicit error output
CMD ["sh", "-c", "echo 'NODE STARTING' && node dist/index.js || echo 'NODE CRASHED WITH CODE:' $?"]
