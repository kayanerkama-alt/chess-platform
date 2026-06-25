FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install root dependencies
RUN npm install

# Copy client package.json and install client deps
RUN cd client && npm install

# Build client
RUN npm run build

# Copy server code
COPY server/ ./server/
COPY .env.example ./

# Create data directory
RUN mkdir -p data

EXPOSE 3001

CMD ["node", "server/index.js"]