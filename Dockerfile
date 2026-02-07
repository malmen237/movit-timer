FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY web-server.js index.html web-renderer.js sw.js styles.css entrypoint.sh ./
COPY assets/ ./assets/

RUN chmod +x entrypoint.sh

EXPOSE 8090

ENTRYPOINT ["./entrypoint.sh"]
