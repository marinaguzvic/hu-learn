FROM nginx:1.27-alpine

# Drop default content
RUN rm -rf /usr/share/nginx/html/*

# App shell — baked into the image
COPY app/index.html  /usr/share/nginx/html/index.html
COPY app/css/        /usr/share/nginx/html/css/
COPY app/js/         /usr/share/nginx/html/js/

# Nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
# /data is intentionally left empty here.
# At runtime, TrueNAS mounts a host dataset over this directory.
# If no volume is mounted the app shows a helpful error rather than crashing.
RUN mkdir -p /usr/share/nginx/html/data

# nginx runs as uid 101 (nginx) inside the alpine image
# TrueNAS dataset permissions should allow read by uid 101, or use 755
# USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
