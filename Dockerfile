# Stage 1: Build frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
# Empty VITE_SERVER_URL so frontend uses relative paths (same origin)
ENV VITE_SERVER_URL=""
RUN npm run build

# Stage 2: Production
FROM node:22-alpine
WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./public

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "src/index.js"]
