FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --omit=dev

FROM node:22-alpine AS runner

RUN addgroup -S fraglog && adduser -S fraglog -G fraglog

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN chown -R fraglog:fraglog /app

USER fraglog

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]