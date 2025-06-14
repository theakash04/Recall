# build time

FROM node:22-alpine

WORKDIR /app

COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY frontend .

RUN pnpm build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["pnpm", "start"]
