FROM denoland/deno:1.33.2
COPY . .
RUN npm install
RUN tsc
RUN npm build
CMD ["node","./dist/main.js" ]