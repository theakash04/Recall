# build time

FROM node:22-alpine as builder

WORKDIR /app

COPY backend/package.json backend/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY backend .

RUN pnpm build

# runtime

FROM node:22-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
EXPOSE 8000

CMD [ "node", "dist/index.js" ]