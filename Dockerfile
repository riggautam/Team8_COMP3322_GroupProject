FROM node:22-alpine AS backend-dev
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
CMD ["npm", "run", "dev", "--", "--legacy-watch"]

FROM node:22-alpine AS frontend-dev
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
