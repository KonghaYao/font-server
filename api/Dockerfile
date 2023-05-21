FROM node:lts-slim
RUN apt-get update && apt-get install curl -y
RUN npm install -g pm2 --registry=https://registry.npmmirror.com
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD npm run deploy
# CMD node dist/main.js