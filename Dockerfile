FROM node:24-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

FROM node:24-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend/ ./
RUN npm run build

FROM node:24-alpine AS backend-prod-deps
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --omit=dev

FROM node:24-alpine AS runtime
WORKDIR /app/backend

COPY --from=backend-prod-deps /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package.json ./package.json
COPY --from=frontend-builder /app/frontend/build /app/frontend/build

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
