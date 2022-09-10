FROM node:16

COPY . .

RUN ls -a

WORKDIR /backend

RUN npm install

RUN npm run build

COPY . .

RUN ls -a

EXPOSE 3000

CMD [ "node", "dist/main.js" ]