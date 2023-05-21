FROM node:lts-slim
RUN apt-get update && apt-get install curl -y
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
# CMD 不进行使用，在 docker-compose 中定义开始文件