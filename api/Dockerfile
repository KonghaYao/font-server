FROM node:lts-slim
RUN apt-get update && apt-get install curl -y
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
RUN npm install -g pm2
CMD npm run deploy
# CMD node dist/main.js