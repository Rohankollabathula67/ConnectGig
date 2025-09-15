FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source
COPY . .

# Build
RUN npm run build

EXPOSE 3001
CMD [ "npm", "run", "start:prod" ]