# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests first — Docker layer cache skips npm ci if unchanged
COPY package*.json tsconfig.json ./
RUN npm ci

# Compile TypeScript → dist/
COPY src ./src
RUN npm run build

# Remove dev dependencies from node_modules
RUN npm prune --omit=dev

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

# tini: proper PID 1, forwards SIGTERM so graceful shutdown works
RUN apk add --no-cache tini

# Only copy the compiled output + pruned prod deps
COPY --from=builder /app/dist         ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]