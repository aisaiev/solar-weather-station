FROM node:16

COPY . .

WORKDIR /backend

RUN npm install

RUN npm run build

COPY . .

EXPOSE 3000

CMD [ "node", "dist/main.js" ]