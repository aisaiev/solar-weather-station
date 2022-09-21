FROM node:16

COPY . .

RUN ls -a

WORKDIR /frontend

RUN npm install

RUN npm run build

RUN ls -a

WORKDIR /backend

RUN ls -a

RUN npm install

RUN npm run build

COPY . .

RUN ls -a

EXPOSE 3000

CMD [ "node", "dist/main.js" ]