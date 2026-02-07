FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY web-server.js entrypoint.sh ./
COPY public/ ./public/

RUN chmod +x entrypoint.sh && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 8090

ENTRYPOINT ["./entrypoint.sh"]
