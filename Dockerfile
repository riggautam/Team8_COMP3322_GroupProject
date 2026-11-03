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

FROM node:22-alpine AS backend-prod
WORKDIR /app
ENV NODE_ENV=production
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY --chown=node:node backend/ ./
USER node
CMD ["node", "server.js"]

FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ARG VITE_GOOGLE_MAPS_API_KEY
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
RUN npm run build

FROM nginx:alpine AS frontend-prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /app/dist /usr/share/nginx/html
