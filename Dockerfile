FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./
COPY client/package*.json ./client/
COPY client/yarn.lock ./client/

# Install dependencies
RUN yarn install --frozen-lockfile
RUN cd client && yarn install --frozen-lockfile && cd ..

# Build client
RUN cd client && yarn build && cd ..

# Copy server code
COPY server/ ./server/
COPY data/ ./data/

# Create data directory
RUN mkdir -p data

EXPOSE 3001

CMD ["node", "server/index.js"]