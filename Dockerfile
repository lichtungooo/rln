# ── Build-Stage ──
FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Die Vite-Config nutzt path.resolve(__dirname, '../../real-life-stack/...')
# __dirname = /home/build/rln → ../../ = /home/ → /home/real-life-stack/
# Deshalb: /home/build/rln/ und /home/real-life-stack/ nebeneinander
WORKDIR /home

# Abhängigkeiten auf die richtige Ebene legen
COPY real-life-stack/packages/toolkit/         real-life-stack/packages/toolkit/
COPY real-life-stack/packages/data-interface/  real-life-stack/packages/data-interface/
COPY real-life-stack/packages/mock-connector/  real-life-stack/packages/mock-connector/
COPY web-of-trust/packages/wot-core/          web-of-trust/packages/wot-core/

# RLN-Quellcode — eine Ebene tiefer
COPY rln/ build/rln/

WORKDIR /home/build/rln

# Installieren und bauen
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm install --no-frozen-lockfile --ignore-scripts
ENV VITE_BASE_PATH=/
RUN npx vite build

# ── Serve-Stage ──
FROM nginx:alpine

COPY --from=build /home/build/rln/dist/ /usr/share/nginx/html/

# SPA-Routing: alle Pfade auf index.html umleiten
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
