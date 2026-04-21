# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy all config files Vite needs to compile
COPY package*.json \
     tsconfig.json \
     tsconfig.app.json \
     tsconfig.node.json \
     vite.config.ts \
     index.html \
     ./

# Optional config files — copy only if they exist (|| true prevents failure)
COPY postcss.config.* tailwind.config.* ./

RUN npm ci

# Copy source + public assets
COPY src    ./src
COPY public ./public

RUN npm run build
# Output lands in /app/dist

# ── Stage 2: Nginx runtime ────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove the default nginx placeholder page
RUN rm -rf /usr/share/nginx/html/*

# Our SPA-aware config (handles React Router + API proxy + SSE)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled React app
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]