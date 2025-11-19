FROM node:18-alpine
WORKDIR /app

# Copy package manifests first to install dependencies
COPY package*.json ./
RUN npm ci --production

# Copy the rest of the server sources
COPY . .

ENV PORT=4000
EXPOSE 4000

CMD ["node", "index.js"]
