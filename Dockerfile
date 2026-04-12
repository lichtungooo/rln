# ── Build-Stage ──
FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Verzeichnisstruktur:
# /home/build/rln/                    ← vite.config.ts mit __dirname
# /home/real-life-stack/packages/...  ← ../../real-life-stack von rln/ aus
# /home/web-of-trust/packages/...    ← ../../web-of-trust von rln/ aus

WORKDIR /home

# Abhängigkeiten auf die richtige Ebene
COPY real-life-stack/packages/toolkit/         real-life-stack/packages/toolkit/
COPY real-life-stack/packages/data-interface/  real-life-stack/packages/data-interface/
COPY real-life-stack/packages/mock-connector/  real-life-stack/packages/mock-connector/
COPY web-of-trust/packages/wot-core/          web-of-trust/packages/wot-core/

# RLN-Quellcode
COPY rln/ build/rln/

WORKDIR /home/build/rln

# pnpm-workspace Pfade an die Container-Struktur anpassen
RUN printf "packages:\n\
  - '../../real-life-stack/packages/toolkit'\n\
  - '../../real-life-stack/packages/data-interface'\n\
  - '../../real-life-stack/packages/mock-connector'\n\
  - '../../web-of-trust/packages/wot-core'\n" > pnpm-workspace.yaml

# Installieren und bauen
RUN pnpm install --no-frozen-lockfile --ignore-scripts
ENV VITE_BASE_PATH=/
RUN npx vite build

# ── Serve-Stage ──
FROM nginx:alpine

COPY --from=build /home/build/rln/dist/ /usr/share/nginx/html/

# SPA-Routing
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
