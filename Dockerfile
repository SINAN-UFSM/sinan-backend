# First Stage: Build and Compile Typescript
FROM node:22-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

# Second Stage: Create the final image
FROM node:22-slim AS runner

ENV NODE_ENV=production
ENV PORT=8000

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/docs ./docs
COPY --from=builder --chown=node:node /app/drizzle ./drizzle

USER node

EXPOSE 8000

CMD ["sh", "-c", "node dist/infra/database/drizzle/setup-db.js && node dist/index.js"]