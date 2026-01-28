# ---------- Stage 1: Builder ----------
FROM node:24-alpine3.21 AS builder

WORKDIR /app

COPY package*.json package-lock.json tsconfig.json ./

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm i --legacy-peer-deps

COPY src ./src

RUN npm run build

# ---------- Stage 2: Runtime ----------
FROM node:24-alpine3.21 AS runtime

ENV NODE_ENV=production

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json package-lock.json ./

RUN npm install -g pm2 npm@latest

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm i --omit=dev --legacy-peer-deps

COPY --from=builder /app/build ./build

EXPOSE 4007

USER node

CMD [ "npm", "run", "start" ]