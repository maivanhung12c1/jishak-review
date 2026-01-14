# ---------- Stage 1: Builder ----------
FROM node:24-alpine3.21 AS builder

WORKDIR /app

# Copy file cấu hình cần thiết trước để tận dụng cache layer
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
COPY .npmrc .npmrc

# Sử dụng NPM token từ secrets mount (không hardcode trong Dockerfile)
RUN npm install -g npm@latest
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm ci

# Copy source code vào
COPY src ./src
COPY tools ./tools
# Build source code TypeScript
RUN npm run build

# ---------- Stage 2: Runtime ----------
FROM node:24-alpine3.21 AS runtime

WORKDIR /app

# Cài curl nếu cần health check/debug
RUN apk add --no-cache curl

# Copy package config & lock để cài production dependencies
COPY package.json ./
COPY package-lock.json ./
COPY .npmrc .npmrc

# Cài production deps, dùng NPM token mount như ở trên
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm ci --omit=dev

# Copy compiled code từ stage 1
COPY --from=builder /app/build ./build

# Port app sẽ lắng nghe
EXPOSE 4007

# Lệnh khởi chạy app
CMD ["node", "build/index.js"]

