FROM node:16

COPY . /solar-weather-station

RUN ls -a

WORKDIR /solar-weather-station

COPY .env backend/

COPY .env frontend/

WORKDIR /solar-weather-station/frontend

RUN npm install

RUN npm run build

RUN ls -a

WORKDIR /solar-weather-station/backend

RUN ls -a

RUN npm install

RUN npm run build

RUN ls -a

EXPOSE 3000

CMD [ "node", "dist/main.js" ]