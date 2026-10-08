FROM node:22-alpine AS backend-dev

WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./

ENV NODE_ENV=development
ENV PORT=3001
EXPOSE 3001
CMD ["npm", "run", "dev", "--", "--legacy-watch"]

FROM node:22-alpine AS backend-prod

WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev
COPY backend/ ./

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001
CMD ["node", "server.js"]

FROM node:22-alpine AS frontend-dev

WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM node:22-alpine AS frontend-build

WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM nginx:alpine AS frontend-prod

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/dist /usr/share/nginx/html
EXPOSE 80
