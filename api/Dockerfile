FROM node:lts-slim
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
RUN npm install -g pm2
CMD pm2 start dist/main.js -i max -n font-server --no-daemon
# CMD node dist/main.js