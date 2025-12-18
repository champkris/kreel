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

# Production start command using ENTRYPOINT
ENTRYPOINT ["sh", "-c"]
CMD ["npx prisma migrate deploy; echo SERVER_STARTING; node dist/index.js"]
