# ── Build-Stage ──
FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /workspace

# Abhängigkeiten: Real Life Stack und Web of Trust
COPY real-life-stack/packages/toolkit/         real-life-stack/packages/toolkit/
COPY real-life-stack/packages/data-interface/  real-life-stack/packages/data-interface/
COPY real-life-stack/packages/mock-connector/  real-life-stack/packages/mock-connector/
COPY web-of-trust/packages/wot-core/          web-of-trust/packages/wot-core/

# RLN-Quellcode
COPY rln/ rln/

WORKDIR /workspace/rln

# pnpm-workspace zeigt auf ../../real-life-stack/... — das passt jetzt,
# weil die Verzeichnisstruktur im Container /workspace/ spiegelt.

# Installieren und bauen (base=/ für eigene Domain)
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm install --no-frozen-lockfile --ignore-scripts
ENV VITE_BASE_PATH=/
# Nur Vite-Build, ohne tsc — die Typen werden lokal geprüft
RUN npx vite build

# ── Serve-Stage ──
FROM nginx:alpine

# Statische Dateien aus dem Build kopieren
COPY --from=build /workspace/rln/dist/ /usr/share/nginx/html/

# SPA-Routing: alle Pfade auf index.html umleiten
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
