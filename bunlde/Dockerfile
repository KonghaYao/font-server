FROM node:18-alpine3.17
COPY . .
RUN npm install
RUN npm build
CMD ["node","./dist/main.js" ]