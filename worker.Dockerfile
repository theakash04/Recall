# build time

FROM node:22-alpine as builder

WORKDIR /app

COPY backend/package.json backend/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY backend .

RUN pnpm build

# Runtime

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

CMD ["node", "dist/worker/index.js"]
