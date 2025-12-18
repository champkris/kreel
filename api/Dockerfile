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

# Expose port
EXPOSE 3001

# Production start command
CMD ["sh", "-c", "echo 'Container starting...' && npx prisma migrate deploy 2>&1 || echo 'Migration failed, continuing...' && echo 'Starting server...' && npm start"]
