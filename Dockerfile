# Einfaches Dockerfile: serviert die vorgebaute App
# Build passiert lokal oder in der GitHub Action nach dem Build-Schritt
FROM nginx:alpine

COPY dist/ /usr/share/nginx/html/

# SPA-Routing: alle Pfade auf index.html umleiten
RUN printf 'server {\n\
  listen 80;\n\
  root /usr/share/nginx/html;\n\
  location / {\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
